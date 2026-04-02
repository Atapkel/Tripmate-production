from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class ProfileCreateRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date
    gender: str = Field(..., min_length=1, max_length=20)
    country_id: Optional[int] = None
    city_id: Optional[int] = None
    nationality: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    instagram_handle: Optional[str] = Field(None, max_length=100)
    telegram_handle: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    profile_photo: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, min_length=1, max_length=20)
    country_id: Optional[int] = None
    city_id: Optional[int] = None
    nationality: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    instagram_handle: Optional[str] = Field(None, max_length=100)
    telegram_handle: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    profile_photo: Optional[str] = None
    language_ids: Optional[List[int]] = None
    interest_ids: Optional[List[int]] = None
    travel_style_ids: Optional[List[int]] = None
