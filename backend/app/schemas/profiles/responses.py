from datetime import date
from typing import List, Optional

from pydantic import BaseModel

from app.schemas.locations import CityResponse, CountryResponse
from app.schemas.preferences import (
    UserInterestResponse,
    UserLanguageResponse,
    UserTravelStyleResponse,
)


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    country_id: Optional[int] = None
    city_id: Optional[int] = None
    country: Optional[CountryResponse] = None
    city: Optional[CityResponse] = None
    nationality: Optional[str] = None
    phone: Optional[str] = None
    instagram_handle: Optional[str] = None
    telegram_handle: Optional[str] = None
    bio: Optional[str] = None
    profile_photo: Optional[str] = None

    class Config:
        from_attributes = True


class ProfileDetailResponse(ProfileResponse):
    languages: List[UserLanguageResponse] = []
    interests: List[UserInterestResponse] = []
    travel_styles: List[UserTravelStyleResponse] = []

    class Config:
        from_attributes = True
