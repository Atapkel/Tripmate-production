from datetime import date
from typing import List, Optional

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.locations import City, Country
from app.models.profiles import Profile
from app.models.trips import Offer, TripVacancy
from app.models.users import User


class TripVacancyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def count_active_by_requester(self, requester_id: int) -> int:
        query = select(func.count()).select_from(TripVacancy).filter(
            TripVacancy.requester_id == requester_id,
            TripVacancy.status == "open",
        )
        result = await self.db.execute(query)
        return result.scalar_one()

    # ── CREATE ──────────────────────────────────────────────────────────

    async def create(self, requester_id: int, **kwargs) -> TripVacancy:
        trip_vacancy = TripVacancy(requester_id=requester_id, **kwargs)
        self.db.add(trip_vacancy)
        await self.db.commit()
        await self.db.refresh(trip_vacancy)
        return trip_vacancy

    # ── READ ────────────────────────────────────────────────────────────

    async def get_by_id(self, trip_vacancy_id: int) -> Optional[TripVacancy]:
        query = select(TripVacancy).filter(TripVacancy.id == trip_vacancy_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_requester_id(
        self, requester_id: int, skip: int = 0, limit: int = 100
    ) -> List[TripVacancy]:
        query = (
            select(TripVacancy)
            .outerjoin(
                Offer,
                (Offer.trip_vacancy_id == TripVacancy.id)
                & (Offer.offerer_id == requester_id)
                & (Offer.status == "accepted"),
            )
            .filter(
                or_(
                    TripVacancy.requester_id == requester_id,
                    Offer.id.isnot(None),
                ),
            )
            .order_by(TripVacancy.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().unique().all())

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        destination_city: Optional[str] = None,
        destination_country: Optional[str] = None,
        status: Optional[str] = None,
        start_date_from: Optional[date] = None,
        start_date_to: Optional[date] = None,
        min_age: Optional[int] = None,
        max_age: Optional[int] = None,
        min_budget: Optional[float] = None,
        max_budget: Optional[float] = None,
        gender_preference: Optional[str] = None,
        from_city: Optional[str] = None,
        from_country: Optional[str] = None,
    ) -> List[TripVacancy]:
        query = select(TripVacancy)

        # Join requester profile when filtering by origin location
        if from_city or from_country:
            query = query.join(User, TripVacancy.requester_id == User.id)
            query = query.join(Profile, User.id == Profile.user_id)

        # Destination filters via aliased tables
        if destination_city:
            dest_city = City.__table__.alias("dest_city")
            query = query.join(dest_city, TripVacancy.destination_city_id == dest_city.c.id)
            query = query.filter(dest_city.c.name == destination_city)
        if destination_country:
            dest_country = Country.__table__.alias("dest_country")
            query = query.join(dest_country, TripVacancy.destination_country_id == dest_country.c.id)
            query = query.filter(dest_country.c.name == destination_country)

        if status:
            query = query.filter(TripVacancy.status == status)
        if start_date_from:
            query = query.filter(TripVacancy.start_date >= start_date_from)
        if start_date_to:
            query = query.filter(TripVacancy.start_date <= start_date_to)

        # Age range overlap: vacancy accepts this user's age
        if min_age is not None:
            query = query.filter(
                (TripVacancy.min_age.is_(None)) | (TripVacancy.min_age <= min_age)
            )
        if max_age is not None:
            query = query.filter(
                (TripVacancy.max_age.is_(None)) | (TripVacancy.max_age >= max_age)
            )

        # Budget range overlap
        if min_budget is not None:
            query = query.filter(
                (TripVacancy.max_budget.is_(None)) | (TripVacancy.max_budget >= min_budget)
            )
        if max_budget is not None:
            query = query.filter(
                (TripVacancy.min_budget.is_(None)) | (TripVacancy.min_budget <= max_budget)
            )

        if gender_preference:
            gender_lower = gender_preference.lower()
            query = query.filter(
                (func.lower(TripVacancy.gender_preference) == "any")
                | (func.lower(TripVacancy.gender_preference) == gender_lower)
            )

        # Origin location filters via aliased profile tables
        if from_city:
            profile_city = City.__table__.alias("profile_city")
            query = query.join(profile_city, Profile.city_id == profile_city.c.id)
            query = query.filter(profile_city.c.name == from_city)
        if from_country:
            profile_country = Country.__table__.alias("profile_country")
            query = query.join(profile_country, Profile.country_id == profile_country.c.id)
            query = query.filter(profile_country.c.name == from_country)

        query = query.order_by(TripVacancy.created_at.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count(
        self,
        destination_city: Optional[str] = None,
        destination_country: Optional[str] = None,
        status: Optional[str] = None,
    ) -> int:
        query = select(func.count()).select_from(TripVacancy)
        if destination_city:
            dest_city = City.__table__.alias("cnt_city")
            query = query.join(dest_city, TripVacancy.destination_city_id == dest_city.c.id)
            query = query.filter(dest_city.c.name == destination_city)
        if destination_country:
            dest_country = Country.__table__.alias("cnt_country")
            query = query.join(dest_country, TripVacancy.destination_country_id == dest_country.c.id)
            query = query.filter(dest_country.c.name == destination_country)
        if status:
            query = query.filter(TripVacancy.status == status)
        result = await self.db.execute(query)
        return result.scalar_one()

    # ── UPDATE ──────────────────────────────────────────────────────────

    async def update(self, trip_vacancy_id: int, **kwargs) -> Optional[TripVacancy]:
        trip_vacancy = await self.get_by_id(trip_vacancy_id)
        if not trip_vacancy:
            return None
        for key, value in kwargs.items():
            if hasattr(trip_vacancy, key) and value is not None:
                setattr(trip_vacancy, key, value)
        await self.db.commit()
        await self.db.refresh(trip_vacancy)
        return trip_vacancy

    async def update_status(self, trip_vacancy_id: int, status: str) -> Optional[TripVacancy]:
        return await self.update(trip_vacancy_id, status=status)

    # ── DELETE ──────────────────────────────────────────────────────────

    async def delete(self, trip_vacancy_id: int) -> bool:
        trip_vacancy = await self.get_by_id(trip_vacancy_id)
        if not trip_vacancy:
            return False
        await self.db.delete(trip_vacancy)
        await self.db.commit()
        return True
