import json
from datetime import datetime, timezone
from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_user_from_websocket_token
from app.core.websocket_manager import manager
from app.core.database import AsyncSessionLocal, get_db
from app.models.users import User
from app.repositories.profile_repository import ProfileRepository
from app.schemas.chat import ChatGroupResponse, ChatMemberResponse, ChatMessageResponse
from app.schemas.chat.requests import MessageSendRequest
from app.schemas.common import MessageResponse
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chats", tags=["Chats"])


# ── Groups ─────────────────────────────────────────────────────────────

@router.get("/me", response_model=List[ChatGroupResponse])
async def get_my_chat_groups(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    return await service.get_my_chat_groups(current_user.id, skip, limit)


@router.get("/{chat_group_id}", response_model=ChatGroupResponse)
async def get_chat_group(
    chat_group_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    success, group, error = await service.get_chat_group(chat_group_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return group


@router.get("/trip/{trip_id}", response_model=ChatGroupResponse)
async def get_chat_group_by_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    success, group, error = await service.get_chat_group_by_trip_vacancy(
        trip_id, current_user.id
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return group


# ── Members ────────────────────────────────────────────────────────────

@router.get("/{chat_group_id}/members", response_model=List[ChatMemberResponse])
async def get_chat_members(
    chat_group_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    success, members, error = await service.get_chat_members(
        chat_group_id, current_user.id, skip, limit
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return members


# ── Messages ───────────────────────────────────────────────────────────

@router.post(
    "/{chat_group_id}/messages",
    response_model=ChatMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    chat_group_id: int,
    request: MessageSendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    success, message, error = await service.send_message(
        chat_group_id, current_user.id, request.content
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return message


@router.get("/{chat_group_id}/messages", response_model=List[ChatMessageResponse])
async def get_messages(
    chat_group_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    success, messages, error = await service.get_messages(
        chat_group_id, current_user.id, skip, limit
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return messages


@router.get("/{chat_group_id}/messages/recent", response_model=List[ChatMessageResponse])
async def get_recent_messages(
    chat_group_id: int,
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    success, messages, error = await service.get_recent_messages(
        chat_group_id, current_user.id, limit
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return messages


@router.delete("/{chat_group_id}/messages/{message_id}", response_model=MessageResponse)
async def delete_message(
    chat_group_id: int,
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    success, error = await service.delete_message(message_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Message deleted successfully"}


@router.get("/{chat_group_id}/active-users", response_model=List[int])
async def get_active_users(
    chat_group_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService(db)
    success, _, error = await service.get_chat_group(chat_group_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return manager.get_active_users(chat_group_id)


# ── WebSocket ──────────────────────────────────────────────────────────

@router.websocket("/ws/{chat_group_id}")
async def websocket_chat(
    websocket: WebSocket,
    chat_group_id: int,
    token: str,
):
    authenticated_user = None

    try:
        sender_name = None
        async with AsyncSessionLocal() as db:
            authenticated_user = await get_user_from_websocket_token(token, db)
            if not authenticated_user:
                await websocket.close(
                    code=status.WS_1008_POLICY_VIOLATION,
                    reason="Invalid authentication",
                )
                return

            user_id = authenticated_user.id

            service = ChatService(db)
            success, _, error = await service.get_chat_group(chat_group_id, user_id)
            if not success:
                await websocket.close(
                    code=status.WS_1008_POLICY_VIOLATION,
                    reason=error or "Access denied",
                )
                return

            profile_repo = ProfileRepository(db)
            profile = await profile_repo.get_by_user_id(user_id)
            if profile:
                sender_name = f"{profile.first_name} {profile.last_name}"

        await manager.connect(websocket, chat_group_id, user_id)

        await manager.broadcast_to_chat_group(
            chat_group_id,
            {
                "type": "user_joined",
                "user_id": user_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            exclude=websocket,
        )

        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            message_type = message_data.get("type")

            if message_type == "message":
                content = message_data.get("content", "").strip()
                if not content:
                    continue

                broadcast_payload = None
                error = None
                async with AsyncSessionLocal() as db:
                    service = ChatService(db)
                    success, saved_msg, error = await service.send_message(
                        chat_group_id, user_id, content
                    )
                    if success and saved_msg:
                        broadcast_payload = {
                            "type": "message",
                            "id": saved_msg.id,
                            "chat_group_id": saved_msg.chat_group_id,
                            "sender_id": saved_msg.sender_id,
                            "sender_name": sender_name,
                            "content": saved_msg.content,
                            "created_at": saved_msg.created_at.isoformat(),
                        }

                if broadcast_payload:
                    await manager.broadcast_to_chat_group(
                        chat_group_id, broadcast_payload
                    )
                else:
                    await manager.send_personal_message(
                        {"type": "error", "message": error or "Failed to send message"},
                        websocket,
                    )

            elif message_type == "typing":
                is_typing = message_data.get("is_typing", False)
                await manager.send_typing_indicator(chat_group_id, user_id, is_typing)

            else:
                await manager.send_personal_message(
                    {"type": "error", "message": f"Unknown message type: {message_type}"},
                    websocket,
                )

    except WebSocketDisconnect:
        if authenticated_user:
            manager.disconnect(websocket, chat_group_id)
            await manager.broadcast_to_chat_group(chat_group_id, {
                "type": "user_left",
                "user_id": authenticated_user.id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

    except Exception:
        if authenticated_user:
            manager.disconnect(websocket, chat_group_id)
            try:
                await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
            except Exception:
                pass
