import os
from fastapi import FastAPI
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse, PlainTextResponse

from api import routes

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

def create_app():
    app = FastAPI(title="niftyX API",
    description="use stable diffusion to create NFTs on the XRPL blockchain",
    version=config['API_VERSION'])
    return app

app = create_app()
app.include_router(routes.router)

@app.exception_handler(Exception)
def validation_exception_handler(request, err):
    base_error_message = f"Failed to execute: {request.method}: {request.url}"
    return JSONResponse(status_code=400, content={"message": f"{base_error_message}. Detail: {err}"})
    
@app.middleware("http")
async def CorsSupportMiddleware(request: Request, call_next):
    logger.info("CorsSupportMiddleware was called")

    headers_cors = {}
    headers_cors["Access-Control-Allow-Origin"] = "*"
    headers_cors["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    headers_cors["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    headers_cors["Access-Control-Max-Age"] = "86400"
    headers_cors["Access-Control-Allow-Credentials"] = "true"
    headers_cors["Access-Control-Expose-Headers"] = "Content-Length, Content-Range"

    if request.method == "OPTIONS":
        #return JSONResponse(status_code=204, headers=headers_cors, content={})
        return PlainTextResponse("OK", status_code=200, headers=headers_cors)

    response = await call_next(request) 

    response.headers.update(headers_cors)
    return response
