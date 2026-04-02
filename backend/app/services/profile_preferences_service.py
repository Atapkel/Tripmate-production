from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.lookup_repository import LookupRepository
from app.repositories.preferences_repository import PreferencesRepository


class ProfilePreferencesService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.preferences_repo = PreferencesRepository(db)
        self.lookup_repo = LookupRepository(db)

    # ── LANGUAGES ───────────────────────────────────────────────────────

    async def add_language(self, profile_id: int, language_id: int) -> Tuple[bool, Optional[str]]:
        try:
            if not await self.preferences_repo.add_language(profile_id, language_id):
                return False, "Failed to add language"
            return True, None
        except Exception as e:
            return False, f"Failed to add language: {str(e)}"

    async def remove_language(self, profile_id: int, language_id: int) -> Tuple[bool, Optional[str]]:
        try:
            if not await self.preferences_repo.remove_language(profile_id, language_id):
                return False, "Language not found in profile"
            return True, None
        except Exception as e:
            return False, f"Failed to remove language: {str(e)}"

    async def set_languages(self, profile_id: int, language_ids: List[int]) -> Tuple[bool, Optional[str]]:
        try:
            await self.preferences_repo.set_languages(profile_id, language_ids)
            return True, None
        except Exception as e:
            return False, f"Failed to set languages: {str(e)}"

    async def get_profile_languages(self, profile_id: int):
        return await self.preferences_repo.get_profile_languages(profile_id)

    # ── INTERESTS ───────────────────────────────────────────────────────

    async def add_interest(self, profile_id: int, interest_id: int) -> Tuple[bool, Optional[str]]:
        try:
            if not await self.preferences_repo.add_interest(profile_id, interest_id):
                return False, "Failed to add interest"
            return True, None
        except Exception as e:
            return False, f"Failed to add interest: {str(e)}"

    async def remove_interest(self, profile_id: int, interest_id: int) -> Tuple[bool, Optional[str]]:
        try:
            if not await self.preferences_repo.remove_interest(profile_id, interest_id):
                return False, "Interest not found in profile"
            return True, None
        except Exception as e:
            return False, f"Failed to remove interest: {str(e)}"

    async def set_interests(self, profile_id: int, interest_ids: List[int]) -> Tuple[bool, Optional[str]]:
        try:
            await self.preferences_repo.set_interests(profile_id, interest_ids)
            return True, None
        except Exception as e:
            return False, f"Failed to set interests: {str(e)}"

    async def get_profile_interests(self, profile_id: int):
        return await self.preferences_repo.get_profile_interests(profile_id)

    # ── TRAVEL STYLES ───────────────────────────────────────────────────

    async def add_travel_style(self, profile_id: int, travel_style_id: int) -> Tuple[bool, Optional[str]]:
        try:
            if not await self.preferences_repo.add_travel_style(profile_id, travel_style_id):
                return False, "Failed to add travel style"
            return True, None
        except Exception as e:
            return False, f"Failed to add travel style: {str(e)}"

    async def remove_travel_style(self, profile_id: int, travel_style_id: int) -> Tuple[bool, Optional[str]]:
        try:
            if not await self.preferences_repo.remove_travel_style(profile_id, travel_style_id):
                return False, "Travel style not found in profile"
            return True, None
        except Exception as e:
            return False, f"Failed to remove travel style: {str(e)}"

    async def set_travel_styles(self, profile_id: int, travel_style_ids: List[int]) -> Tuple[bool, Optional[str]]:
        try:
            await self.preferences_repo.set_travel_styles(profile_id, travel_style_ids)
            return True, None
        except Exception as e:
            return False, f"Failed to set travel styles: {str(e)}"

    async def get_profile_travel_styles(self, profile_id: int):
        return await self.preferences_repo.get_profile_travel_styles(profile_id)

    # ── LOOKUP HELPERS ──────────────────────────────────────────────────

    async def get_all_countries(self):
        return await self.lookup_repo.get_all_countries()

    async def get_cities_by_country(self, country_id: int):
        return await self.lookup_repo.get_cities_by_country(country_id)

    async def get_all_languages(self):
        return await self.lookup_repo.get_all_languages()

    async def get_all_interests(self):
        return await self.lookup_repo.get_all_interests()

    async def get_all_travel_styles(self):
        return await self.lookup_repo.get_all_travel_styles()
