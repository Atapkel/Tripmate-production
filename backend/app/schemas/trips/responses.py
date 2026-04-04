from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, model_validator

from app.schemas.locations import CityResponse, CountryResponse


class TripVacancyResponse(BaseModel):
    id: int
    requester_id: int
    destination_country_id: int
    destination_city_id: int
    destination_country: Optional[CountryResponse] = None
    destination_city: Optional[CityResponse] = None
    start_date: date
    end_date: date
    min_budget: Optional[Decimal] = None
    max_budget: Optional[Decimal] = None
    people_needed: int
    people_joined: int
    description: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    gender_preference: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OfferResponse(BaseModel):
    id: int
    trip_vacancy_id: int
    offerer_id: int
    message: Optional[str]
    proposed_budget: Optional[Decimal]
    status: str
    reviewed_at: Optional[datetime]
    offerer_outcome_seen_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OfferAttentionResponse(BaseModel):
    pending_received: int
    unseen_outcome_sent: int


class OfferWithTripResponse(OfferResponse):
    trip_vacancy: Optional[TripVacancyResponse] = None

    @model_validator(mode="before")
    @classmethod
    def map_vacancy(cls, data):
        if hasattr(data, "vacancy") and data.vacancy is not None:
            # ORM model uses 'vacancy', map to 'trip_vacancy'
            if not hasattr(data, "trip_vacancy") or data.trip_vacancy is None:
                data.__dict__["trip_vacancy"] = data.vacancy
        return data

    class Config:
        from_attributes = True
