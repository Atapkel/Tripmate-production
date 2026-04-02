from pydantic import BaseModel


class CountryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class CityResponse(BaseModel):
    id: int
    name: str
    country_id: int

    class Config:
        from_attributes = True
