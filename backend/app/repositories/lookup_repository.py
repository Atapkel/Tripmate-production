from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.locations import City, Country
from app.models.preferences import Interest, Language, TravelStyle


class LookupRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_countries(self) -> List[Country]:
        query = select(Country).order_by(Country.name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_cities_by_country(self, country_id: int) -> List[City]:
        query = select(City).filter(City.country_id == country_id).order_by(City.name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_all_languages(self) -> List[Language]:
        result = await self.db.execute(select(Language))
        return list(result.scalars().all())

    async def get_all_interests(self) -> List[Interest]:
        result = await self.db.execute(select(Interest))
        return list(result.scalars().all())

    async def get_all_travel_styles(self) -> List[TravelStyle]:
        result = await self.db.execute(select(TravelStyle))
        return list(result.scalars().all())
