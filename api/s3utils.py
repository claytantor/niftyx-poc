import os, random, uuid, base64
import boto3
from io import BytesIO
from PIL import Image

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

# Create an S3 client
s3_session = boto3.Session(
    aws_access_key_id=config['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=config['AWS_SECRET_ACCESS_KEY']
)
s3_client = s3_session.client("s3", region_name="us-west-2")

def put_image_to_s3(pil_image, bucket="mybucket", filename="image.png"):
    # Create a BytesIO object from the image
    image_bytes = BytesIO()
    pil_image.save(image_bytes, "PNG")
    image_bytes.seek(0)

    # Upload the image to the S3 bucket
    s3_client.put_object(Bucket=bucket, Key=filename, Body=image_bytes)

def get_image_from_s3(bucket="mybucket", filename="image.png"):
    # Download the image from the S3 bucket
    s3_object = s3_client.get_object(Bucket=bucket, Key=filename)
    # Read the image data into BytesIO
    image_bytes = BytesIO(s3_object["Body"].read())
    # Load the image data into PIL
    pil_image = Image.open(image_bytes)
    return pil_image