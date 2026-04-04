from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class TripVacancyCreateRequest(BaseModel):
    destination_country_id: int
    destination_city_id: int
    start_date: date
    end_date: date
    min_budget: Optional[Decimal] = Field(None, ge=0)
    max_budget: Optional[Decimal] = Field(None, ge=0)
    people_needed: int = Field(..., ge=1, le=20)
    description: Optional[str] = Field(None, max_length=2000)
    min_age: Optional[int] = Field(None, ge=16, le=100)
    max_age: Optional[int] = Field(None, ge=16, le=100)
    gender_preference: Optional[str] = Field(None, pattern="^(male|female|any)$")


class TripVacancyUpdateRequest(BaseModel):
    destination_country_id: Optional[int] = None
    destination_city_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    min_budget: Optional[Decimal] = Field(None, ge=0)
    max_budget: Optional[Decimal] = Field(None, ge=0)
    people_needed: Optional[int] = Field(None, ge=1, le=20)
    description: Optional[str] = Field(None, max_length=2000)
    min_age: Optional[int] = Field(None, ge=16, le=100)
    max_age: Optional[int] = Field(None, ge=16, le=100)
    gender_preference: Optional[str] = Field(None, pattern="^(male|female|any)$")


class OfferCreateRequest(BaseModel):
    trip_vacancy_id: int = Field(..., gt=0)
    message: Optional[str] = Field(None, max_length=2000)
    proposed_budget: Optional[Decimal] = Field(None, ge=0)


class OfferUpdateRequest(BaseModel):
    message: Optional[str] = Field(None, max_length=2000)
    proposed_budget: Optional[Decimal] = Field(None, ge=0)


class OfferStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(accepted|rejected|cancelled)$")
