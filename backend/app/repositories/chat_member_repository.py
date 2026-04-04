from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat.groups import ChatGroup
from app.models.chat.members import ChatMember
from app.models.trips import TripVacancy


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

    async def set_last_read_message_id(
        self, chat_group_id: int, user_id: int, message_id: Optional[int]
    ) -> None:
        member = await self.get_by_chat_and_user(chat_group_id, user_id)
        if not member:
            return
        member.last_read_message_id = message_id
        await self.db.commit()
        await self.db.refresh(member)

    async def reset_trip_removal_seen_for_members_after_host_removal(
        self, chat_group_id: int, organizer_user_id: int
    ) -> None:
        now = datetime.now(timezone.utc)
        await self.db.execute(
            update(ChatMember)
            .where(
                and_(
                    ChatMember.chat_group_id == chat_group_id,
                    ChatMember.user_id != organizer_user_id,
                )
            )
            .values(trip_removal_seen_at=None)
        )
        await self.db.execute(
            update(ChatMember)
            .where(
                and_(
                    ChatMember.chat_group_id == chat_group_id,
                    ChatMember.user_id == organizer_user_id,
                )
            )
            .values(trip_removal_seen_at=now)
        )
        await self.db.commit()

    async def mark_trip_removal_seen(self, chat_group_id: int, user_id: int) -> None:
        now = datetime.now(timezone.utc)
        await self.db.execute(
            update(ChatMember)
            .where(
                and_(
                    ChatMember.chat_group_id == chat_group_id,
                    ChatMember.user_id == user_id,
                )
            )
            .values(trip_removal_seen_at=now)
        )
        await self.db.commit()

    async def acknowledge_deleted_trip_removals_for_user(self, user_id: int) -> int:
        now = datetime.now(timezone.utc)
        deleted_ids_subq = (
            select(ChatGroup.id)
            .join(TripVacancy, ChatGroup.trip_vacancy_id == TripVacancy.id)
            .where(TripVacancy.status == "deleted_by_host")
        )
        stmt = (
            update(ChatMember)
            .where(
                and_(
                    ChatMember.user_id == user_id,
                    ChatMember.trip_removal_seen_at.is_(None),
                    ChatMember.chat_group_id.in_(deleted_ids_subq),
                )
            )
            .values(trip_removal_seen_at=now)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount or 0

    # ── DELETE ──────────────────────────────────────────────────────────

    async def delete(self, chat_member: ChatMember) -> None:
        await self.db.delete(chat_member)
        await self.db.commit()
