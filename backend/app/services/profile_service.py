from typing import Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.locations import City
from app.models.profiles import Profile
from app.repositories.preferences_repository import PreferencesRepository
from app.repositories.profile_repository import ProfileRepository


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.profile_repo = ProfileRepository(db)
        self.preferences_repo = PreferencesRepository(db)

    # ── VALIDATION ──────────────────────────────────────────────────────

    async def _validate_city_country(
        self, city_id: Optional[int], country_id: Optional[int]
    ) -> Optional[str]:
        if city_id is not None and country_id is not None:
            result = await self.db.execute(select(City).filter(City.id == city_id))
            city = result.scalar_one_or_none()
            if not city:
                return "City not found"
            if city.country_id != country_id:
                return "City does not belong to the specified country"
        elif city_id is not None and country_id is None:
            return "Country is required when city is specified"
        return None

    # ── CREATE ──────────────────────────────────────────────────────────

    async def create_profile(
        self, user_id: int, **profile_data
    ) -> Tuple[bool, Optional[Profile], Optional[str]]:
        try:
            if await self.profile_repo.exists_by_user_id(user_id):
                return False, None, "Profile already exists for this user"

            error = await self._validate_city_country(
                profile_data.get("city_id"), profile_data.get("country_id")
            )
            if error:
                return False, None, error

            profile = await self.profile_repo.create(user_id=user_id, **profile_data)
            return True, profile, None
        except Exception as e:
            return False, None, f"Failed to create profile: {str(e)}"

    # ── READ ────────────────────────────────────────────────────────────

    async def get_profile_by_id(
        self, profile_id: int, include_relations: bool = False
    ) -> Optional[Profile]:
        if include_relations:
            return await self.profile_repo.get_with_relations(profile_id)
        return await self.profile_repo.get_by_id(profile_id)

    async def get_profile_by_user_id(
        self, user_id: int, include_relations: bool = False
    ) -> Optional[Profile]:
        if include_relations:
            return await self.profile_repo.get_by_user_id_with_relations(user_id)
        return await self.profile_repo.get_by_user_id(user_id)

    # ── UPDATE ──────────────────────────────────────────────────────────

    async def update_profile(
        self, profile_id: int, **update_data
    ) -> Tuple[bool, Optional[Profile], Optional[str]]:
        try:
            update_data = {k: v for k, v in update_data.items() if v is not None}
            if not update_data:
                profile = await self.profile_repo.get_by_id(profile_id)
                return True, profile, None

            city_id = update_data.get("city_id")
            country_id = update_data.get("country_id")
            if city_id is not None or country_id is not None:
                existing = await self.profile_repo.get_by_id(profile_id)
                if not existing:
                    return False, None, "Profile not found"
                effective_city = city_id if city_id is not None else existing.city_id
                effective_country = country_id if country_id is not None else existing.country_id
                error = await self._validate_city_country(effective_city, effective_country)
                if error:
                    return False, None, error

            profile = await self.profile_repo.update(profile_id, **update_data)
            if not profile:
                return False, None, "Profile not found"
            return True, profile, None
        except Exception as e:
            return False, None, f"Failed to update profile: {str(e)}"

    async def update_profile_by_user_id(
        self, user_id: int, **update_data
    ) -> Tuple[bool, Optional[Profile], Optional[str]]:
        profile = await self.profile_repo.get_by_user_id(user_id)
        if not profile:
            return False, None, "Profile not found"

        language_ids = update_data.pop("language_ids", None)
        interest_ids = update_data.pop("interest_ids", None)
        travel_style_ids = update_data.pop("travel_style_ids", None)

        success, profile, error = await self.update_profile(profile.id, **update_data)
        if not success:
            return False, None, error

        if language_ids is not None:
            await self.preferences_repo.set_languages(profile.id, language_ids)
        if interest_ids is not None:
            await self.preferences_repo.set_interests(profile.id, interest_ids)
        if travel_style_ids is not None:
            await self.preferences_repo.set_travel_styles(profile.id, travel_style_ids)

        return True, profile, None

    # ── DELETE ──────────────────────────────────────────────────────────

    async def delete_profile(self, profile_id: int) -> Tuple[bool, Optional[str]]:
        try:
            if not await self.profile_repo.delete(profile_id):
                return False, "Profile not found"
            return True, None
        except Exception as e:
            return False, f"Failed to delete profile: {str(e)}"

    async def delete_profile_by_user_id(self, user_id: int) -> Tuple[bool, Optional[str]]:
        profile = await self.profile_repo.get_by_user_id(user_id)
        if not profile:
            return False, "Profile not found"
        return await self.delete_profile(profile.id)
