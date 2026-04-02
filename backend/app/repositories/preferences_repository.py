from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.preferences import (
    UserInterest,
    UserLanguage,
    UserTravelStyle,
)


class PreferencesRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── LANGUAGES ───────────────────────────────────────────────────────

    async def add_language(self, profile_id: int, language_id: int) -> Optional[UserLanguage]:
        query = select(UserLanguage).filter(
            UserLanguage.profile_id == profile_id,
            UserLanguage.language_id == language_id,
        )
        result = await self.db.execute(query)
        existing = result.scalar_one_or_none()
        if existing:
            return existing

        user_language = UserLanguage(profile_id=profile_id, language_id=language_id)
        self.db.add(user_language)
        await self.db.commit()
        await self.db.refresh(user_language)
        return user_language

    async def remove_language(self, profile_id: int, language_id: int) -> bool:
        query = select(UserLanguage).filter(
            UserLanguage.profile_id == profile_id,
            UserLanguage.language_id == language_id,
        )
        result = await self.db.execute(query)
        user_language = result.scalar_one_or_none()
        if not user_language:
            return False
        await self.db.delete(user_language)
        await self.db.commit()
        return True

    async def get_profile_languages(self, profile_id: int) -> List[UserLanguage]:
        query = (
            select(UserLanguage)
            .filter(UserLanguage.profile_id == profile_id)
            .options(joinedload(UserLanguage.language))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def set_languages(self, profile_id: int, language_ids: List[int]) -> bool:
        query = select(UserLanguage).filter(UserLanguage.profile_id == profile_id)
        result = await self.db.execute(query)
        for ul in result.scalars().all():
            await self.db.delete(ul)
        await self.db.commit()  

        await self.db.flush()
        for language_id in language_ids:
            self.db.add(UserLanguage(profile_id=profile_id, language_id=language_id))
        await self.db.commit()
        return True

    # ── INTERESTS ───────────────────────────────────────────────────────

    async def add_interest(self, profile_id: int, interest_id: int) -> Optional[UserInterest]:
        query = select(UserInterest).filter(
            UserInterest.profile_id == profile_id,
            UserInterest.interest_id == interest_id,
        )
        result = await self.db.execute(query)
        existing = result.scalar_one_or_none()
        if existing:
            return existing

        user_interest = UserInterest(profile_id=profile_id, interest_id=interest_id)
        self.db.add(user_interest)
        await self.db.commit()
        await self.db.refresh(user_interest)
        return user_interest

    async def remove_interest(self, profile_id: int, interest_id: int) -> bool:
        query = select(UserInterest).filter(
            UserInterest.profile_id == profile_id,
            UserInterest.interest_id == interest_id,
        )
        result = await self.db.execute(query)
        user_interest = result.scalar_one_or_none()
        if not user_interest:
            return False
        await self.db.delete(user_interest)
        await self.db.commit()
        return True

    async def get_profile_interests(self, profile_id: int) -> List[UserInterest]:
        query = (
            select(UserInterest)
            .filter(UserInterest.profile_id == profile_id)
            .options(joinedload(UserInterest.interest))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def set_interests(self, profile_id: int, interest_ids: List[int]) -> bool:
        query = select(UserInterest).filter(UserInterest.profile_id == profile_id)
        result = await self.db.execute(query)
        for ui in result.scalars().all():
            await self.db.delete(ui)
        await self.db.commit() 

        for interest_id in interest_ids:
            self.db.add(UserInterest(profile_id=profile_id, interest_id=interest_id))
        await self.db.commit()
        return True

    # ── TRAVEL STYLES ───────────────────────────────────────────────────

    async def add_travel_style(self, profile_id: int, travel_style_id: int) -> Optional[UserTravelStyle]:
        query = select(UserTravelStyle).filter(
            UserTravelStyle.profile_id == profile_id,
            UserTravelStyle.travel_style_id == travel_style_id,
        )
        result = await self.db.execute(query)
        existing = result.scalar_one_or_none()
        if existing:
            return existing

        user_ts = UserTravelStyle(profile_id=profile_id, travel_style_id=travel_style_id)
        self.db.add(user_ts)
        await self.db.commit()
        await self.db.refresh(user_ts)
        return user_ts

    async def remove_travel_style(self, profile_id: int, travel_style_id: int) -> bool:
        query = select(UserTravelStyle).filter(
            UserTravelStyle.profile_id == profile_id,
            UserTravelStyle.travel_style_id == travel_style_id,
        )
        result = await self.db.execute(query)
        user_ts = result.scalar_one_or_none()
        if not user_ts:
            return False
        await self.db.delete(user_ts)
        await self.db.commit()
        return True

    async def get_profile_travel_styles(self, profile_id: int) -> List[UserTravelStyle]:
        query = (
            select(UserTravelStyle)
            .filter(UserTravelStyle.profile_id == profile_id)
            .options(joinedload(UserTravelStyle.travel_style))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def set_travel_styles(self, profile_id: int, travel_style_ids: List[int]) -> bool:
        query = select(UserTravelStyle).filter(UserTravelStyle.profile_id == profile_id)
        result = await self.db.execute(query)
        for uts in result.scalars().all():
            await self.db.delete(uts)
        await self.db.commit()  

        for ts_id in travel_style_ids:
            self.db.add(UserTravelStyle(profile_id=profile_id, travel_style_id=ts_id))
        await self.db.commit()
        return True
