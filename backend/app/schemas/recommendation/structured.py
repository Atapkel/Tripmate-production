from typing import Literal

from pydantic import BaseModel


class RecommendedPlaceSchema(BaseModel):
    place_id: str
    name: str
    category: Literal[
        "landmark", "restaurant", "museum", "nature", "sports",
        "cultural", "shopping", "activity", "wellness",
    ]
    short_description: str
    why_people_go: str
    why_recommended: str
    best_time_of_day: Literal["morning", "afternoon", "evening", "sunset", "night"]
    best_season: list[Literal["spring", "summer", "autumn", "winter"]]
    audience: list[Literal[
        "kids", "teens", "adults", "seniors",
        "family", "couples", "friends", "solo_travelers",
    ]]
    image_url: str
    query_to_search: str | None


class PlaceRecommendationsSchema(BaseModel):
    recommended_places: list[RecommendedPlaceSchema]
