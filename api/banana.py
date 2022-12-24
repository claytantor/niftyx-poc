import asyncio
import os
import banana_dev as banana
import base64
import random
from io import BytesIO
from PIL import Image
import logging
import uuid


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


class StableDiffusionModel():
    prompt: str = "table full of muffins"
    num_inference_steps: int = 50
    guidance_scale: int = 9
    height: int = 512
    width: int = 512
    seed: int  = random.randrange(32768)

    def __init__(self, promptInfo:dict):

        self.prompt = str(promptInfo["prompt"])
        self.num_inference_steps = int(promptInfo["num_inference_steps"])
        self.guidance_scale = int(promptInfo["guidance_scale"])
        self.height = int(promptInfo["height"])
        self.width = int(promptInfo["width"])
        self.seed = int(promptInfo["seed"])


    def get_model_inputs(self):
        return {
            "prompt": str(self.prompt),
            "num_inference_steps": int(self.num_inference_steps),
            "guidance_scale": int(self.guidance_scale),
            "height": int(self.height),
            "width": int(self.width),
            "seed": int(self.seed)
        }

async def render_image(model):
    logger.info(f"Model inputs: {model.get_model_inputs()}")

    # Run the model
    out = banana.run(
        config['BANANA_API_KEY'], 
        config['BANANA_MODEL_KEY'], 
        model.get_model_inputs())

    # Extract the image and save to output.jpg
    image_byte_string = out["modelOutputs"][0]["image_base64"]
    image_encoded = image_byte_string.encode('utf-8')
    image_bytes = BytesIO(base64.b64decode(image_encoded))
    image = Image.open(image_bytes)
    return image

async def main():
    prompt_info = {
        "prompt": "table full of muffins",
        "num_inference_steps": 50,
        "guidance_scale": 9,
        "height": 512,
        "width": 512,
        "seed": random.randrange(32768)
    }
    model = StableDiffusionModel(prompt_info)
    image = await render_image(model)
    image.save(f"out/output-{str(uuid.uuid4())}.jpg")

if __name__ == '__main__':
    print(f"app_config: {app_config}")
    asyncio.run(main())