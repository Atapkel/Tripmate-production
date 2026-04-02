from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.locations import City, Country
from app.models.preferences import (
    UserInterest,
    UserLanguage,
    UserTravelStyle,
)
from app.models.profiles import Profile


class ProfileRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── CREATE ──────────────────────────────────────────────────────────

    async def create(self, user_id: int, **kwargs) -> Profile:
        profile = Profile(user_id=user_id, **kwargs)
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    # ── READ ────────────────────────────────────────────────────────────

    async def get_by_id(self, profile_id: int) -> Optional[Profile]:
        query = select(Profile).filter(Profile.id == profile_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: int) -> Optional[Profile]:
        query = select(Profile).filter(Profile.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_with_relations(self, profile_id: int) -> Optional[Profile]:
        query = (
            select(Profile)
            .filter(Profile.id == profile_id)
            .options(
                joinedload(Profile.languages).joinedload(UserLanguage.language),
                joinedload(Profile.interests).joinedload(UserInterest.interest),
                joinedload(Profile.travel_styles).joinedload(UserTravelStyle.travel_style),
            )
        )
        result = await self.db.execute(query)
        return result.unique().scalar_one_or_none()

    async def get_by_user_id_with_relations(self, user_id: int) -> Optional[Profile]:
        query = (
            select(Profile)
            .filter(Profile.user_id == user_id)
            .options(
                joinedload(Profile.languages).joinedload(UserLanguage.language),
                joinedload(Profile.interests).joinedload(UserInterest.interest),
                joinedload(Profile.travel_styles).joinedload(UserTravelStyle.travel_style),
            )
        )
        result = await self.db.execute(query)
        return result.unique().scalar_one_or_none()

    async def get_by_user_ids_with_relations(self, user_ids: List[int]) -> List[Profile]:
        if not user_ids:
            return []
        query = (
            select(Profile)
            .filter(Profile.user_id.in_(user_ids))
            .options(
                joinedload(Profile.languages).joinedload(UserLanguage.language),
                joinedload(Profile.interests).joinedload(UserInterest.interest),
                joinedload(Profile.travel_styles).joinedload(UserTravelStyle.travel_style),
            )
        )
        result = await self.db.execute(query)
        return list(result.unique().scalars().all())

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        country: Optional[str] = None,
        city: Optional[str] = None,
        gender: Optional[str] = None,
    ) -> List[Profile]:
        query = select(Profile)
        if country:
            query = query.join(Country, Profile.country_id == Country.id)
            query = query.filter(Country.name == country)
        if city:
            query = query.join(City, Profile.city_id == City.id)
            query = query.filter(City.name == city)
        if gender:
            query = query.filter(Profile.gender == gender)
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def exists_by_user_id(self, user_id: int) -> bool:
        query = select(Profile.id).filter(Profile.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    # ── UPDATE ──────────────────────────────────────────────────────────

    async def update(self, profile_id: int, **kwargs) -> Optional[Profile]:
        profile = await self.get_by_id(profile_id)
        if not profile:
            return None
        for key, value in kwargs.items():
            if hasattr(profile, key) and value is not None:
                setattr(profile, key, value)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    # ── DELETE ──────────────────────────────────────────────────────────

    async def delete(self, profile_id: int) -> bool:
        profile = await self.get_by_id(profile_id)
        if not profile:
            return False
        await self.db.delete(profile)
        await self.db.commit()
        return True
