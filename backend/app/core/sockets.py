from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps userId -> active WebSocket connections list (supports multiple tabs open)
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"WebSocket client connected: {user_id} ({len(self.active_connections[user_id])} active tabs)")

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                self.active_connections.pop(user_id, None)
        print(f"WebSocket client disconnected: {user_id}")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            disconnected_sockets = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected_sockets.append(connection)
            # Cleanup any stale connections
            for socket in disconnected_sockets:
                self.disconnect(user_id, socket)

    async def broadcast(self, message: dict):
        for user_id, connections in list(self.active_connections.items()):
            disconnected_sockets = []
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected_sockets.append(connection)
            for socket in disconnected_sockets:
                self.disconnect(user_id, socket)

manager = ConnectionManager()
