import os
import json
import requests

# === logging
import logging
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


async def get_xapp_tokeninfo(xumm_token):

    url = f"https://xumm.app/api/v1/platform/xapp/ott/{xumm_token}"

    headers = {
        "accept": "application/json",
        "X-API-Key": f"{config['XUMM_API_KEY']}",
        "X-API-Secret": f"{config['XUMM_API_SECRET']}",
    }

    response = requests.get(url, headers=headers)

    return json.loads(response.text)