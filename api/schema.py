from typing import Optional
from pydantic import BaseModel

# ===== schemas
class MintNft(BaseModel):
    payload_uuidv4: str

class ImagePayment(BaseModel):
    prompt: str

class GenerateImage(BaseModel):
    payload_uuidv4: str