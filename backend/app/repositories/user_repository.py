from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.users import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── CREATE ──────────────────────────────────────────────────────────

    async def create(self, email: str, password: str, role: str = "user") -> User:
        user = User(email=email, password=password, role=role)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    # ── READ ────────────────────────────────────────────────────────────

    async def get_by_id(
        self, user_id: int, include_deleted: bool = False
    ) -> Optional[User]:
        query = select(User).filter(User.id == user_id)
        if not include_deleted:
            query = query.filter(User.deleted_at.is_(None))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_email(
        self, email: str, include_deleted: bool = False
    ) -> Optional[User]:
        query = select(User).filter(User.email == email)
        if not include_deleted:
            query = query.filter(User.deleted_at.is_(None))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_with_profile(self, user_id: int) -> Optional[User]:
        query = (
            select(User)
            .filter(User.id == user_id, User.deleted_at.is_(None))
            .options(joinedload(User.profile))
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
        is_active: Optional[bool] = None,
        is_verified: Optional[bool] = None,
        role: Optional[str] = None,
    ) -> List[User]:
        query = select(User)
        if not include_deleted:
            query = query.filter(User.deleted_at.is_(None))
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        if is_verified is not None:
            query = query.filter(User.is_verified == is_verified)
        if role:
            query = query.filter(User.role == role)
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def exists_by_email(self, email: str) -> bool:
        query = select(User.id).filter(User.email == email, User.deleted_at.is_(None))
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def count(
        self,
        include_deleted: bool = False,
        is_active: Optional[bool] = None,
        is_verified: Optional[bool] = None,
    ) -> int:
        query = select(func.count()).select_from(User)
        if not include_deleted:
            query = query.filter(User.deleted_at.is_(None))
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        if is_verified is not None:
            query = query.filter(User.is_verified == is_verified)
        result = await self.db.execute(query)
        return result.scalar_one()

    # ── UPDATE ──────────────────────────────────────────────────────────

    async def update(self, user_id: int, **kwargs) -> Optional[User]:
        user = await self.get_by_id(user_id)
        if not user:
            return None
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_password(self, user_id: int, new_password: str) -> Optional[User]:
        return await self.update(user_id, password=new_password)

    async def verify_user(self, user_id: int) -> Optional[User]:
        return await self.update(user_id, is_verified=True)

    async def activate_user(self, user_id: int) -> Optional[User]:
        return await self.update(user_id, is_active=True)

    async def deactivate_user(self, user_id: int) -> Optional[User]:
        return await self.update(user_id, is_active=False)

    # ── DELETE ──────────────────────────────────────────────────────────

    async def soft_delete(self, user_id: int) -> bool:
        user = await self.get_by_id(user_id)
        if not user:
            return False
        user.deleted_at = datetime.now(timezone.utc)
        user.is_active = False
        await self.db.commit()
        return True

    async def restore(self, user_id: int) -> Optional[User]:
        user = await self.get_by_id(user_id, include_deleted=True)
        if not user or user.deleted_at is None:
            return None
        user.deleted_at = None
        user.is_active = True
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def hard_delete(self, user_id: int) -> bool:
        user = await self.get_by_id(user_id, include_deleted=True)
        if not user:
            return False
        await self.db.delete(user)
        await self.db.commit()
        return True
