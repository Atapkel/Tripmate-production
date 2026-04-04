from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.users import User
from app.schemas.common import MessageResponse
from app.schemas.locations import CityResponse, CountryResponse, NationalityResponse
from app.schemas.preferences import (
    InterestBase,
    InterestResponse,
    LanguageBase,
    LanguageResponse,
    TravelStyleBase,
    TravelStyleResponse,
)
from app.services.profile_preferences_service import ProfilePreferencesService
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/me", tags=["Profile Preferences"])


async def _get_profile_id(current_user: User, db: AsyncSession) -> int:
    profile = await ProfileService(db).get_profile_by_user_id(current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile.id


# ── Languages ──────────────────────────────────────────────────────────

@router.post("/languages", response_model=MessageResponse)
async def add_language(
    request: LanguageBase,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_id = await _get_profile_id(current_user, db)
    service = ProfilePreferencesService(db)
    success, error = await service.add_language(profile_id, request.language_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Language added successfully"}


@router.delete("/languages/{language_id}", response_model=MessageResponse)
async def remove_language(
    language_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_id = await _get_profile_id(current_user, db)
    service = ProfilePreferencesService(db)
    success, error = await service.remove_language(profile_id, language_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Language removed successfully"}


@router.put("/languages", response_model=MessageResponse)
async def set_languages(
    language_ids: List[int],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_id = await _get_profile_id(current_user, db)
    service = ProfilePreferencesService(db)
    success, error = await service.set_languages(profile_id, language_ids)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Languages updated successfully"}


# ── Interests ──────────────────────────────────────────────────────────

@router.post("/interests", response_model=MessageResponse)
async def add_interest(
    request: InterestBase,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_id = await _get_profile_id(current_user, db)
    service = ProfilePreferencesService(db)
    success, error = await service.add_interest(profile_id, request.interest_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Interest added successfully"}


@router.delete("/interests/{interest_id}", response_model=MessageResponse)
async def remove_interest(
    interest_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_id = await _get_profile_id(current_user, db)
    service = ProfilePreferencesService(db)
    success, error = await service.remove_interest(profile_id, interest_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Interest removed successfully"}


@router.put("/interests", response_model=MessageResponse)
async def set_interests(
    interest_ids: List[int],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_id = await _get_profile_id(current_user, db)
    service = ProfilePreferencesService(db)
    success, error = await service.set_interests(profile_id, interest_ids)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Interests updated successfully"}


# ── Travel Styles ──────────────────────────────────────────────────────

@router.post("/travel-styles", response_model=MessageResponse)
async def add_travel_style(
    request: TravelStyleBase,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_id = await _get_profile_id(current_user, db)
    service = ProfilePreferencesService(db)
    success, error = await service.add_travel_style(profile_id, request.travel_style_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Travel style added successfully"}


@router.delete("/travel-styles/{travel_style_id}", response_model=MessageResponse)
async def remove_travel_style(
    travel_style_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_id = await _get_profile_id(current_user, db)
    service = ProfilePreferencesService(db)
    success, error = await service.remove_travel_style(profile_id, travel_style_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Travel style removed successfully"}


@router.put("/travel-styles", response_model=MessageResponse)
async def set_travel_styles(
    travel_style_ids: List[int],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile_id = await _get_profile_id(current_user, db)
    service = ProfilePreferencesService(db)
    success, error = await service.set_travel_styles(profile_id, travel_style_ids)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Travel styles updated successfully"}


# ── Lookup Options (public) ────────────────────────────────────────────

options_router = APIRouter(prefix="/options", tags=["Lookup Options"])


@options_router.get("/countries", response_model=List[CountryResponse])
async def get_all_countries(db: AsyncSession = Depends(get_db)):
    service = ProfilePreferencesService(db)
    return await service.get_all_countries()


@options_router.get("/countries/{country_id}/cities", response_model=List[CityResponse])
async def get_cities_by_country(country_id: int, db: AsyncSession = Depends(get_db)):
    service = ProfilePreferencesService(db)
    return await service.get_cities_by_country(country_id)


@options_router.get("/languages", response_model=List[LanguageResponse])
async def get_all_languages(db: AsyncSession = Depends(get_db)):
    service = ProfilePreferencesService(db)
    return await service.get_all_languages()


@options_router.get("/interests", response_model=List[InterestResponse])
async def get_all_interests(db: AsyncSession = Depends(get_db)):
    service = ProfilePreferencesService(db)
    return await service.get_all_interests()


@options_router.get("/travel-styles", response_model=List[TravelStyleResponse])
async def get_all_travel_styles(db: AsyncSession = Depends(get_db)):
    service = ProfilePreferencesService(db)
    return await service.get_all_travel_styles()


@options_router.get("/nationalities", response_model=List[NationalityResponse])
async def get_all_nationalities(db: AsyncSession = Depends(get_db)):
    service = ProfilePreferencesService(db)
    return await service.get_all_nationalities()
