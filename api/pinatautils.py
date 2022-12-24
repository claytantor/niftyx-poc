import os, sys
from pinatapy import PinataPy


# === logging
import logging

from api.s3utils import get_image_from_s3
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

pinata = PinataPy(config['PINATA_API_KEY'], config['PINATA_SECRET_KEY'])

async def pinata_pin_remote_image(bucket="mybucket", filename="image.png", pin_file_name="image.png"):
    image_to_pin = get_image_from_s3(bucket, filename)
    image_to_pin.save(f'{config["PINATA_OUTDIR"]}/{pin_file_name}')

    # === pinata pin remote image
    return pinata.pin_file_to_ipfs(
        path_to_file=f'{config["PINATA_OUTDIR"]}/{pin_file_name}',
        ipfs_destination_path="/",
        save_absolute_paths=False,
        options={"pinataMetadata": {"name": pin_file_name, "mime-type": "image/png"}}
    )
    

