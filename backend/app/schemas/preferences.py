from pydantic import BaseModel


# ============= Request Schemas =============

class LanguageBase(BaseModel):
    language_id: int


class InterestBase(BaseModel):
    interest_id: int


class TravelStyleBase(BaseModel):
    travel_style_id: int


# ============= Response Schemas =============

class LanguageResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class InterestResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class TravelStyleResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UserLanguageResponse(BaseModel):
    id: int
    language_id: int
    language: LanguageResponse

    class Config:
        from_attributes = True


class UserInterestResponse(BaseModel):
    id: int
    interest_id: int
    interest: InterestResponse

    class Config:
        from_attributes = True


class UserTravelStyleResponse(BaseModel):
    id: int
    travel_style_id: int
    travel_style: TravelStyleResponse

    class Config:
        from_attributes = True
