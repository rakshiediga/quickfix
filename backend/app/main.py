import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base
from app.routers import auth, customer, provider, booking, reviews, notifications, chats, admin
from app.core.sockets import manager

# Create database tables on startup (if they do not already exist)
try:
    Base.metadata.create_all(bind=engine)
    print("MySQL database tables created successfully.")
except Exception as e:
    print(f"Database table generation warning: {e}")

app = FastAPI(
    title="QuickFix API",
    description="Backend API for QuickFix Local Services Platform",
    version="1.0.0"
)

# CORS configurations matching React frontend development URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory and mount as static folder to serve files directly
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount(f"/{settings.UPLOAD_DIR}", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers with standard API Versioning prefix
app.include_router(auth.router, prefix="/api/v1")
app.include_router(customer.router, prefix="/api/v1")
app.include_router(provider.router, prefix="/api/v1")
app.include_router(booking.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(chats.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"status": "running", "api_version": "v1"}

# Realtime WebSocket Endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Keep connection alive; handle incoming packets if client issues checks
            data = await websocket.receive_json()
            # E.g. echo or broadcast ping
            await websocket.send_json({"type": "ping_reply", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    except Exception as e:
        print(f"WS error on {user_id}: {e}")
        manager.disconnect(user_id, websocket)
