from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, Float, and_, desc, event, or_, select
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base

import os
from datetime import datetime as dt
import json

import logging

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


Base = declarative_base()

class Wallet(Base):
    __tablename__ = "wallet"
    wallet_id = Column(Integer, primary_key=True)
    public_key = Column(String())
    classic_address = Column(String())
    created_at = Column(DateTime())
    updated_at = Column(DateTime())

    ## adding fiat currency
    fiat_i8n_currency = Column(String(3))

    def __init__(self,
                 public_key=None,
                 classic_address=None):
                 
        self.public_key = public_key
        self.classic_address = classic_address 
        self.fiat_i8n_currency = "USD" 
        self.created_at = dt.now()
        self.updated_at = dt.now()
    
    def __repr__(self):
        return f"<Wallet(wallet_id={self.wallet_id})>"

    def to_dict(self):
        return {
            "wallet_id": self.wallet_id,
            "classic_address": self.classic_address,
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at)
        }


class XummPayload(Base):
    __tablename__ = "xumm_payload"

    xumm_payload_id = Column(Integer, primary_key=True)
    body = Column(String(16000))
    webhook_body = Column(String(16000))
    created_at = Column(DateTime())
    updated_at = Column(DateTime())
    payload_uuidv4 = Column(String(36))
    wallet_id = Column(Integer, ForeignKey('wallet.wallet_id'))

    is_signed = Column(Integer)
    txid = Column(String(64))


    payment_item_id = Column(Integer, ForeignKey('payment_item.payment_item_id'), nullable=True)
    payment_item = relationship('PaymentItem', foreign_keys=[payment_item_id])

    def __init__(self,
                 payload_body=None,
                 wallet_id=None,
                 payload_uuidv4=None):
                 
        self.body = payload_body
        self.wallet_id = wallet_id
        self.payload_uuidv4 = payload_uuidv4
        self.created_at = dt.now()
        self.updated_at = dt.now()
        self.is_signed = 0

    def __repr__(self):
        return f"<XummPayload(xumm_payload_id={self.xumm_payload_id})>"

    def from_dict(self, data):
        for field in ['xumm_payload_id', 'body', 'webhook_body', 'created_at', 'updated_at', 'payload_uuidv4', 'wallet_id', 'is_signed', 'txid']:
            if field in data:
                if data[field] != None:
                    setattr(self, field, data[field])

    @property
    def is_signed_bool(self):
        return False if self.is_signed == 0 else True

    def set_is_signed_bool(self, is_signed_bool=False):
        self.is_signed = 1 if is_signed_bool else 0

    
    def to_dict(self):
        return self.serialize()

        
    def serialize(self):
        is_signed = False if self.is_signed == 0 else True

        s_m = {
            "xumm_payload_id": self.xumm_payload_id,
            "is_signed": is_signed,
            "payload_uuidv4": self.payload_uuidv4,
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at),
            "txid": self.txid,
        }

        if self.body:
            s_m["body"] = json.loads(self.body)

        if self.webhook_body:
            s_m["webhook_body"] = json.loads(self.webhook_body)

        return s_m

class FileUpload(Base):
    __tablename__ = 'file_uploads'
    file_upload_id = Column('id', Integer, primary_key=True)
    type = Column('type', String(32))  # this will be our discriminator

    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    original_name = Column(String, nullable=False)

    created_at = Column(DateTime, nullable=False, default=dt.utcnow)
    updated_at = Column(DateTime, nullable=False, default=dt.utcnow, onupdate=dt.utcnow)
    __mapper_args__ = {
        'polymorphic_on': type,
        'polymorphic_identity': 'FileUpload'
    }


class NiftyXCustomImage(Base):
    niftyx_nft_id = Column(Integer, ForeignKey('payment_item.payment_item_id'), nullable=True)
    niftyx_nft = relationship('NiftyXNonFungibleToken', backref='images', cascade="none")

    __mapper_args__ = {
        'polymorphic_identity': 'NiftyXCustomImage'
    }

class NiftyXDiffusionImage(Base):
    niftyx_nft_id = Column(Integer, ForeignKey('payment_item.payment_item_id'), nullable=True)
    niftyx_nft = relationship('NiftyXNonFungibleToken', backref='images', cascade="none")

    __mapper_args__ = {
        'polymorphic_identity': 'NiftyXCustomImage'
    }

class NiftyXNonFungibleToken(Base):
    uri = Column(String(), nullable=False)


