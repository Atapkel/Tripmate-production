from typing import List, Optional

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat.messages import Message
from app.models.users import User


class MessageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── CREATE ──────────────────────────────────────────────────────────

    async def create(
        self, chat_group_id: int, sender_id: Optional[int], content: str
    ) -> Message:
        message = Message(
            chat_group_id=chat_group_id, sender_id=sender_id, content=content
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message, attribute_names=["id", "chat_group_id", "sender_id", "content", "created_at"])
        return message

    # ── READ ────────────────────────────────────────────────────────────

    async def get_by_id(self, message_id: int) -> Optional[Message]:
        query = select(Message).filter(Message.id == message_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_max_message_id(self, chat_group_id: int) -> Optional[int]:
        query = select(func.max(Message.id)).where(Message.chat_group_id == chat_group_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def count_unread_for_member(
        self,
        chat_group_id: int,
        user_id: int,
        last_read_message_id: Optional[int],
    ) -> int:
        threshold = last_read_message_id or 0
        query = (
            select(func.count())
            .select_from(Message)
            .where(
                and_(
                    Message.chat_group_id == chat_group_id,
                    or_(
                        Message.sender_id.is_(None),
                        Message.sender_id != user_id,
                    ),
                    Message.id > threshold,
                )
            )
        )
        result = await self.db.execute(query)
        return int(result.scalar_one() or 0)

    async def get_messages_by_chat_group(
        self, chat_group_id: int, skip: int = 0, limit: int = 100
    ) -> List[Message]:
        query = (
            select(Message)
            .filter(Message.chat_group_id == chat_group_id)
            .options(selectinload(Message.sender).selectinload(User.profile))
            .order_by(Message.created_at.asc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_recent_messages(
        self, chat_group_id: int, limit: int = 50
    ) -> List[Message]:
        query = (
            select(Message)
            .filter(Message.chat_group_id == chat_group_id)
            .options(selectinload(Message.sender).selectinload(User.profile))
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(reversed(list(result.scalars().all())))

    # ── UPDATE ──────────────────────────────────────────────────────────

    async def update(self, message: Message, **kwargs) -> Message:
        for key, value in kwargs.items():
            if hasattr(message, key):
                setattr(message, key, value)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    # ── DELETE ──────────────────────────────────────────────────────────

    async def delete(self, message: Message) -> None:
        await self.db.delete(message)
        await self.db.commit()
