from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat.members import ChatMember


class ChatMemberRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── CREATE ──────────────────────────────────────────────────────────

    async def create(self, chat_group_id: int, user_id: int) -> ChatMember:
        chat_member = ChatMember(chat_group_id=chat_group_id, user_id=user_id)
        self.db.add(chat_member)
        await self.db.commit()
        await self.db.refresh(chat_member)
        return chat_member

    # ── READ ────────────────────────────────────────────────────────────

    async def get_by_id(self, member_id: int) -> Optional[ChatMember]:
        query = select(ChatMember).filter(ChatMember.id == member_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_chat_and_user(
        self, chat_group_id: int, user_id: int
    ) -> Optional[ChatMember]:
        query = select(ChatMember).filter(
            and_(
                ChatMember.chat_group_id == chat_group_id,
                ChatMember.user_id == user_id,
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_members_by_chat_group(
        self, chat_group_id: int, skip: int = 0, limit: int = 100
    ) -> List[ChatMember]:
        query = (
            select(ChatMember)
            .filter(ChatMember.chat_group_id == chat_group_id)
            .options(selectinload(ChatMember.user))
            .order_by(ChatMember.joined_at.asc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def is_member(self, chat_group_id: int, user_id: int) -> bool:
        member = await self.get_by_chat_and_user(chat_group_id, user_id)
        return member is not None

    # ── DELETE ──────────────────────────────────────────────────────────

    async def delete(self, chat_member: ChatMember) -> None:
        await self.db.delete(chat_member)
        await self.db.commit()
