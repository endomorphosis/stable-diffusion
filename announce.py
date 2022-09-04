import jwt
from jwt import encode, decode 
from re import search
from fastapi import FastAPI, Request, HTTPException, BackgroundTasks, Cookie, WebSocket, WebSocketDisconnect, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse
from datetime import datetime, timedelta
from starlette.status import HTTP_403_FORBIDDEN
from starlette.responses import RedirectResponse, Response, JSONResponse
from starlette.requests import Request
import sys
import os
import json
import this
import uvicorn
import websockets
import asyncio

app = FastAPI()

def install_pip_package(package_string):
    os.system('pip install ' + package_string)

@app.post("/announce")
async def root(request: Request):
    params_json = await request.json()
    print(params_json)
    return(params_json)

@app.websocket("/ws")
async def chat(websocket: WebSocket):
    token = websocket.cookies.get("Authorization")
    hashed_username = websocket.cookies.get("hashed_username")
    hashed_password = websocket.cookies.get("hashed_password")
    
async def rest(uri):
    async with connect(uri) as websocket:
        await websocket.send("Hello world!")
        const response = await websocket.recv()
        return response





uvicorn.run(app, host="0.0.0.0", port=8000)
