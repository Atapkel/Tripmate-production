from datetime import date
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class RecommendationUserPayload(BaseModel):
    name: str = Field(default="", max_length=255)
    age: int = Field(default=0, ge=0, le=120)
    gender: str = Field(default="", max_length=20)
    from_city: str = Field(default="", max_length=120)
    from_country: str = Field(default="", max_length=120)
    bio: str = Field(default="", max_length=2000)
    languages: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    travel_styles: list[str] = Field(default_factory=list)
    user_label: str | None = None


class GenerateRecommendationsRequest(BaseModel):
    trip_vacancy_id: int = Field(ge=1)
    destination_city: str = Field(default="", max_length=120)
    destination_country: str = Field(default="", max_length=120)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: str = Field(default="", max_length=5000)
    min_budget: float = Field(default=0.0, ge=0)
    max_budget: float = Field(default=0.0, ge=0)
    users: list[RecommendationUserPayload] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_dates_and_budget(self) -> "GenerateRecommendationsRequest":
        if self.start_date and self.end_date:
            if self.end_date < self.start_date:
                raise ValueError("end_date must be greater than or equal to start_date")
        if self.max_budget < self.min_budget:
            raise ValueError("max_budget must be greater than or equal to min_budget")
        return self
