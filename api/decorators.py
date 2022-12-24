import functools
from http.client import HTTPException
from http import HTTPStatus
from fastapi.responses import JSONResponse

import logging
import requests
import inspect
import json
import jwt

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("uvicorn.error")


class XummJWKS():

    def __init__(self, jwks_url='https://oauth2.xumm.app/certs'):
        self.jwks_url = jwks_url

    @functools.cached_property
    def jwks(self):
        return requests.get(self.jwks_url).json()

    @staticmethod
    def verify_jwt(jwt_token, jwks=None, kid="default"):

        if jwks is None:
            raise ValueError("jwks is required")

        jwt_body = jwt.decode(jwt_token, options={"verify_signature": False})

        public_keys = {}
        for jwk in jwks['keys']:
            kid = jwk['kid']
            public_keys[kid] = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))
            
        key = public_keys[kid]
        logger.info(f"=== kid {kid} {public_keys} {key}")
        payload = jwt.decode(jwt_token, key, algorithms=['RS256'], audience=jwt_body['aud'], issuer='https://oauth2.xumm.app')
        logger.info(f"=== payload {payload} VERIFIED")


xummJWKS = XummJWKS().jwks  

def verify_xumm_jwt(method_or_name):
    def decorator(method):
        if callable(method_or_name):
            # print("CALL method_or_name",method_or_name)
            method.gw_method = method.__name__
        else:
            # print("method_or_name",method_or_name)
            method.gw_method = method_or_name
        
        @functools.wraps(method)
        async def wrapper(*args, **kwargs):
      

          # right now we are not using scopes
          if 'request' in kwargs:
            request = kwargs['request']
            if 'headers' in request:
                # can expect lower case
                if 'authorization' in request.headers:
                    authorization = request.headers['authorization']
                    # logger.info(f"=== authorization header {authorization}")
                    if 'Bearer' in authorization:
                        jwt_token = authorization.split('Bearer ')[1]
                        logger.info(f"=== jwt_token {jwt_token}")
                        logger.info(f"=== jwks {xummJWKS}")
                        # not working for xumm app
                        # try:
                        #     XummJWKS.verify_jwt(jwt_token, jwks=xummJWKS)
                        # except Exception as e:
                        #     logger.error(f"=== error {e}")
                        #     return JSONResponse(status_code=HTTPStatus.UNAUTHORIZED, content={"message": "auth headers, cannot verify jwt credentials"})


                    if inspect.iscoroutinefunction(method):
                        return await method(*args, **kwargs)
                    else:
                        return method(*args, **kwargs)
                else:                   
                    return JSONResponse(status_code=HTTPStatus.UNAUTHORIZED, content={"message": "auth headers, invalid or missing"})
            else:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"message": "request headers, invalid or missing"})
          else:
            return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"message": "request, invalid or missing"})



        return wrapper

    if callable(method_or_name):
        return decorator(method_or_name)

    return decorator



def verify_xumm_jwt_get(method_or_name):
    """
    requires authorization param in query string
    """
    def decorator(method):
        if callable(method_or_name):
            # print("CALL method_or_name",method_or_name)
            method.gw_method = method.__name__
        else:
            # print("method_or_name",method_or_name)
            method.gw_method = method_or_name
        
        @functools.wraps(method)
        async def wrapper(*args, **kwargs):
      

          # right now we are not using scopes
          if 'request' in kwargs:
            request = kwargs['request']
            if 'headers' in request:
                # can expect lower case in query string
                if 'authorization' in request.query_params:
                    authorization = request.query_params['authorization']
                    if 'Bearer' in authorization:
                        jwt_token = authorization.split('Bearer ')[1]
                        logger.info(f"=== jwt_token {jwt_token}")
                        logger.info(f"=== jwks {xummJWKS}")
                        try:
                            XummJWKS.verify_jwt(jwt_token, jwks=xummJWKS)
                        except Exception as e:
                            logger.error(f"=== error {e}")
                            return JSONResponse(status_code=HTTPStatus.UNAUTHORIZED, content={"message": "auth headers, cannot verify jwt credentials"})


                    if inspect.iscoroutinefunction(method):
                        return await method(*args, **kwargs)
                    else:
                        return method(*args, **kwargs)
                else:                   
                    return JSONResponse(status_code=HTTPStatus.UNAUTHORIZED, content={"message": "auth headers, invalid or missing"})
            else:
                return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"message": "request headers, invalid or missing"})
          else:
            return JSONResponse(status_code=HTTPStatus.BAD_REQUEST, content={"message": "request, invalid or missing"})



        return wrapper

    if callable(method_or_name):
        return decorator(method_or_name)

    return decorator

