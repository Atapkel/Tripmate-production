from datetime import datetime, timezone
from typing import Dict, List, Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        self.connection_users: Dict[WebSocket, int] = {}

    async def connect(self, websocket: WebSocket, chat_group_id: int, user_id: int):
        await websocket.accept()

        if chat_group_id not in self.active_connections:
            self.active_connections[chat_group_id] = set()

        self.active_connections[chat_group_id].add(websocket)
        self.connection_users[websocket] = user_id

        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "chat_group_id": chat_group_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    def disconnect(self, websocket: WebSocket, chat_group_id: int):
        if chat_group_id in self.active_connections:
            self.active_connections[chat_group_id].discard(websocket)
            if not self.active_connections[chat_group_id]:
                del self.active_connections[chat_group_id]

        self.connection_users.pop(websocket, None)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast_to_chat_group(
        self, chat_group_id: int, message: dict, exclude: WebSocket = None
    ):
        if chat_group_id not in self.active_connections:
            return

        disconnected = []
        for connection in self.active_connections[chat_group_id]:
            if connection == exclude:
                continue
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection, chat_group_id)

    async def send_typing_indicator(
        self, chat_group_id: int, user_id: int, is_typing: bool
    ):
        await self.broadcast_to_chat_group(chat_group_id, {
            "type": "typing",
            "user_id": user_id,
            "is_typing": is_typing,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    def get_active_users(self, chat_group_id: int) -> List[int]:
        if chat_group_id not in self.active_connections:
            return []

        user_ids = set()
        for connection in self.active_connections[chat_group_id]:
            if connection in self.connection_users:
                user_ids.add(self.connection_users[connection])

        return list(user_ids)


manager = ConnectionManager()
