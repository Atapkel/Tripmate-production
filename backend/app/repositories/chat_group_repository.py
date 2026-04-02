from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat.groups import ChatGroup
from app.models.chat.members import ChatMember


class ChatGroupRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── CREATE ──────────────────────────────────────────────────────────

    async def create(self, trip_vacancy_id: int, name: str) -> ChatGroup:
        chat_group = ChatGroup(trip_vacancy_id=trip_vacancy_id, name=name)
        self.db.add(chat_group)
        await self.db.commit()
        await self.db.refresh(chat_group)
        return chat_group

    # ── READ ────────────────────────────────────────────────────────────

    async def get_by_id(self, chat_group_id: int) -> Optional[ChatGroup]:
        query = select(ChatGroup).filter(ChatGroup.id == chat_group_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_trip_vacancy_id(self, trip_vacancy_id: int) -> Optional[ChatGroup]:
        query = select(ChatGroup).filter(ChatGroup.trip_vacancy_id == trip_vacancy_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_user_chat_groups(
        self, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[ChatGroup]:
        query = (
            select(ChatGroup)
            .join(ChatMember, ChatGroup.id == ChatMember.chat_group_id)
            .filter(ChatMember.user_id == user_id)
            .options(selectinload(ChatGroup.members))
            .order_by(ChatGroup.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    # ── UPDATE ──────────────────────────────────────────────────────────

    async def update(self, chat_group: ChatGroup, **kwargs) -> ChatGroup:
        for key, value in kwargs.items():
            if hasattr(chat_group, key):
                setattr(chat_group, key, value)
        await self.db.commit()
        await self.db.refresh(chat_group)
        return chat_group

    # ── DELETE ──────────────────────────────────────────────────────────

    async def delete(self, chat_group: ChatGroup) -> None:
        await self.db.delete(chat_group)
        await self.db.commit()
