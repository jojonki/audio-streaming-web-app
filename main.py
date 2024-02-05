import numpy as np
from fastapi import FastAPI, Request, WebSocket, staticfiles
from fastapi.templating import Jinja2Templates
from starlette.responses import HTMLResponse
from starlette.websockets import WebSocketDisconnect

websocket_connections = {}


BUFFER_SIZE = 4096 * 2
app = FastAPI()
app.mount("/static", staticfiles.StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="static")


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global SAMPLE_RATE
    audio_buffer = np.array([], dtype=np.float32)
    await websocket.accept()
    print(f"Connected. {id(websocket)}")
    connection_id = id(websocket)
    websocket_connections[connection_id] = websocket

    try:
        while True:
            data = await websocket.receive_bytes()
            numpy_data = np.frombuffer(data, dtype=np.float32)
            audio_buffer = np.concatenate((audio_buffer, numpy_data))
            if len(audio_buffer) >= BUFFER_SIZE:
                send_data = audio_buffer[:BUFFER_SIZE]
                # rm sent data
                audio_buffer = audio_buffer[BUFFER_SIZE:]
                await websocket.send_bytes(send_data.tobytes())
    except WebSocketDisconnect:
        del websocket_connections[connection_id]
