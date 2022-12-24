import os, io
import random
import jwt
import json
import uuid
from cachetools import TTLCache
from http import HTTPStatus

from fastapi import APIRouter
from fastapi import Depends, FastAPI, HTTPException, Request, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse, Response, FileResponse, StreamingResponse, RedirectResponse

import logging

# ==== xrpl
import xrpl
from xrpl.models.requests.account_info import AccountInfo
from xrpl.models.requests.account_nfts import AccountNFTs
from xrpl.models.requests import NFTSellOffers


from xrpl.models.transactions import Payment
from xrpl.models import Memo, Payment, TransactionMetadata
from xrpl.wallet.main import Wallet
from xrpl.models.amounts.issued_currency_amount import IssuedCurrencyAmount
from xrpl.core.binarycodec import encode, encode_for_signing
from api.banana import StableDiffusionModel, render_image

from api.decorators import verify_xumm_jwt, verify_xumm_jwt_get
from api.pinatautils import pinata_pin_remote_image
from api.s3utils import put_image_to_s3
from api.schema import GenerateImage, ImagePayment, MintNft
from api.xrplutils import XrpNetwork, get_xrp_network_from_jwt, xrpToDrops


# === logging
import logging

from api.xummutils import get_xapp_tokeninfo
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("uvicorn.error")

# === config
app_config = os.getenv("APP_CONFIG",f"{os.path.dirname(__file__)}/../env/local/api.env")
logger.debug(f"app_config: {app_config}")
from dotenv import dotenv_values
config = {
    **dotenv_values(app_config),  # load shared development variables
    **os.environ,  # override loaded values with environment variables
}

# auth
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")
router = APIRouter()

# xumm
import xumm
xumm_sdk = xumm.XummSdk(config['XUMM_API_KEY'], config['XUMM_API_SECRET'])


# cache
cache = TTLCache(maxsize=1000, ttl=3600)


def get_token_body(token):
    try:
        jwt_body = jwt.decode(token, options={"verify_signature": False})
        return jwt_body
    except:
        return None

@router.get("/info")
def get_api_info():
    return {"version": f"{config['API_VERSION']}"}


@router.get("/account/info")
@verify_xumm_jwt
async def get_account_info(request: Request,  token: str = Depends(oauth2_scheme)):
    
    jwt_body = get_token_body(token)

    xrp_network = get_xrp_network_from_jwt(jwt_body)
    client = xrpl.clients.JsonRpcClient(xrp_network.json_rpc)

    acct_info = AccountInfo(
        account=jwt_body['sub'],
        ledger_index="current",
        queue=True,
        strict=True,
    )

    response = await client.request_impl(acct_info)
    return response.to_dict()

@router.get("/account/nfts")
@verify_xumm_jwt
async def get_account_nfts(request: Request,  token: str = Depends(oauth2_scheme)):
    
    jwt_body = get_token_body(token)

    xrp_network = get_xrp_network_from_jwt(jwt_body)
    client = xrpl.clients.JsonRpcClient(xrp_network.json_rpc)

    acct_info = AccountNFTs(
        account=jwt_body['sub']
    )

    response = await client.request_impl(acct_info)
    return response.to_dict()


@router.post("/payload/payment")
@verify_xumm_jwt
async def post_payment(
    generateImage: ImagePayment,
    request: Request,
    token: str = Depends(oauth2_scheme)):
    jwt_body = get_token_body(token)
    
    classic_address = jwt_body['sub']
    logger.info(f"=== pay_generate classic_address {jwt_body['sub']} prompt: {generateImage.prompt}")


    # Create a Payment transaction
    # amount_pay = random.uniform(0.21, 0.33)
    amount_pay = 0.25

    payment_tx = Payment(
        account=jwt_body['sub'],
        amount=str(xrpToDrops(amount_pay)),
        destination=config['NIFTYX_ADDRESS'],
    )

    tx_xrpl = payment_tx.to_xrpl()
    

    create_payload = {
        'txjson': tx_xrpl,
        "custom_meta": {
            "identifier": str(uuid.uuid4()).replace('-', '')[:8],
            "blob": json.dumps({'prompt': generateImage.prompt}),
            "instruction": "Please sign this transaction to pay for your NFT"
        }
    }   

    if generateImage.user_token:
        create_payload['user_token'] = generateImage.user_token

    logger.info(f"=== full payment payload {create_payload}")
     
    xumm_payload = xumm_sdk.payload.create(create_payload)
    logger.info(f"=== payload response {json.dumps(xumm_payload.to_dict(),indent=4)}")

    return JSONResponse(status_code=HTTPStatus.OK, content=xumm_payload.to_dict())


@router.post("/payload/generate")
@verify_xumm_jwt
async def post_generate(
    generateImage: GenerateImage,
    request: Request,
    token: str = Depends(oauth2_scheme)):
    # logger.info(f"=== create NFT payload id: {payload_uuidv4}")
    # jwt_token = authorization.split('Bearer ')[1]
    jwt_body = get_token_body(token)
    logger.info(f"=== create NFT jwt_body {jwt_body}")

    # lets use the xumm sdk to find the payload 
    # and check if it was signed and owned by the JWT user
    payload_uuidv4 = generateImage.payload_uuidv4
    payload = xumm_sdk.payload.get(payload_uuidv4)
    logger.info(f"=== payload {json.dumps(payload.to_dict())}")

    if jwt_body['sub'] != payload.to_dict()['payload']['request_json']['Account']:
        return JSONResponse(status_code=HTTPStatus.UNAUTHORIZED, content={"error": "unauthorized"})

    # check if we have already processed this payload eventually
    # we will need to use a durable store like redis or dynamodb
    logger.info(f"=== cache for {payload_uuidv4} {cache.get(payload_uuidv4)}")
    if f"{cache.get(payload_uuidv4)}" != "None":
        count = int(cache.get(payload_uuidv4))
        logger.info(f"=== count {count} for {payload_uuidv4}")
        if count and count > 3:
            return JSONResponse(status_code=HTTPStatus.TOO_MANY_REQUESTS, content={"error": "too many requests"})
        else:
            cache[payload_uuidv4] = count + 1
            logger.info(f"=== count found for {payload_uuidv4} incrementing to {cache.get(payload_uuidv4)}")
    else:
        logger.info(f"=== count not found for {payload_uuidv4} setting to 0")
        cache[payload_uuidv4] = 0

    # get the prompt from the payload
    prompt = json.loads(payload.to_dict()['custom_meta']['blob'])['prompt']
    logger.info(f"=== prompt {prompt}")

    if payload.meta.signed:
        logger.info(f"=== payload is signed")

        try:
            prompt_info = {
                "prompt": prompt,
                "num_inference_steps": 50,
                "guidance_scale": 9,
                "height": 512,
                "width": 512,
                "seed": random.randrange(32768)
            }
            model = StableDiffusionModel(prompt_info)
            nft_image = await render_image(model)


            # lets send the image to s3
            put_image_to_s3(nft_image, bucket=config['AWS_BUCKET_NAME'], 
                filename=f"{config['AWS_UPLOADED_IMAGES_PATH']}/{payload_uuidv4}.png")

            # return serve_pil_image(nft_image)
            # "https://s3.us-west-2.amazonaws.com/niftyx.net/uploaded_images/1e429939-8400-49db-86ed-b1d61496e719.png"
            img_src = f"https://s3.us-west-2.amazonaws.com/{config['AWS_BUCKET_NAME']}/{config['AWS_UPLOADED_IMAGES_PATH']}/{payload_uuidv4}.png"
            return JSONResponse(status_code=HTTPStatus.OK, content={"img_src": img_src, 'prompt': prompt})


        except Exception as e:
            logger.error(f"=== error {e}")
            return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"message": "error generating image"})

    return JSONResponse(status_code=HTTPStatus.NOT_ACCEPTABLE, content={"message": "payload has not been signed"})


@router.post("/payload/mint_nft")
@verify_xumm_jwt
async def post_mint_nft(
    createNft: MintNft,
    request: Request,
    token: str = Depends(oauth2_scheme)):
    jwt_body = get_token_body(token)
    
    logger.info(f"=== create NFT payload id: {createNft.payload_uuidv4}")

    # lets use the xumm sdk to find the payload 
    # and check if it was signed
    payload = xumm_sdk.payload.get(createNft.payload_uuidv4)
    logger.info(f"=== payload {json.dumps(payload.to_dict())}")


    if payload.meta.signed:
        logger.info(f"=== payload is signed")
        # get the prompt from the payload
        prompt = json.loads(payload.to_dict()['custom_meta']['blob'])['prompt']
        logger.info(f"=== prompt {prompt}")

        # lets send the image to pinata
        # img_src = f"https://s3.us-west-2.amazonaws.com/{config['AWS_BUCKET_NAME']}/{config['AWS_UPLOADED_IMAGES_PATH']}/{createNft.payload_uuidv4}.png"
        p_words = prompt.split(" ")
        pin_file_name = f"{'_'.join(p_words[:3])}_{str(uuid.uuid4()).replace('-','')[:6]}.png"
        pinata_response = await pinata_pin_remote_image(bucket=config['AWS_BUCKET_NAME'], filename=f"{config['AWS_UPLOADED_IMAGES_PATH']}/{createNft.payload_uuidv4}.png", pin_file_name=pin_file_name)
        logger.info(f"=== pinata_response {pinata_response}")


        #{'IpfsHash': 'QmUzXmszdktv7TGPEMFbHL9cvBNN3ihj5w6o7itmmukR6j', 'PinSize': 302024, 'Timestamp': '2022-12-18T05:49:53.181Z'}

        # lets mint the nft

        nft_mint_tx = xrpl.models.transactions.NFTokenMint(
            account=jwt_body['sub'],
            uri=xrpl.utils.str_to_hex(f"ipfs://{pinata_response['IpfsHash']}?filename={pin_file_name}"),
            flags=0,
            transfer_fee=0,
            nftoken_taxon=0
        )

        create_payload = {
            'txjson': nft_mint_tx.to_xrpl()
        }   
        
        xumm_payload = xumm_sdk.payload.create(create_payload)

        return JSONResponse(status_code=HTTPStatus.OK, content=xumm_payload.to_dict())


# xumm endpoints
# /xumm/xapp?xAppStyle=LIGHT&xAppToken=1ed288a5-b858-42ab-b8e6-ba9fd8e1b59d
@router.get("/xumm/xapp")
async def get_xumm_app(
    xAppStyle: str,
    xAppToken: str,
    request: Request):
    logger.info(f"=== xumm app {xAppStyle} {xAppToken}")

    xapp_session = await get_xapp_tokeninfo(xAppToken)
    if xapp_session is None:
        return JSONResponse(status_code=HTTPStatus.UNAUTHORIZED, content={"xAppToken": "cannot create payload"})

    logger.info(f"==== xapp_session a: {xapp_session}") 

    return RedirectResponse(f'https://niftyx.net/xapp?xAppToken={xAppToken}')



    


# ============== functions ==============

def serve_pil_image(pil_img, type='PNG', mimetype='image/png'):
    img_io = io.BytesIO()
    pil_img.save(img_io, type, quality=70)
    img_io.seek(0)
    return Response(content=img_io.getvalue(), media_type="image/png")

