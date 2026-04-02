from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class RecommendedPlaceResponse(BaseModel):
    id: int
    place_id: str
    name: str
    category: Optional[str] = None
    short_description: Optional[str] = None
    why_people_go: Optional[str] = None
    why_recommended: Optional[str] = None
    best_season: Optional[List[str]] = None
    audience: Optional[List[str]] = None
    best_time_of_day: Optional[str] = None
    image_url: Optional[str] = None
    query_to_search: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TripPlanResponse(BaseModel):
    id: int
    trip_vacancy_id: int
    generation_requested_at: Optional[datetime] = None
    generated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    recommended_places: List[RecommendedPlaceResponse]

    class Config:
        from_attributes = True


class GeneratePlanResponse(BaseModel):
    response: Dict[str, Any]

    class Config:
        from_attributes = True
