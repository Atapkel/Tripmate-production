from datetime import datetime
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.trips import Offer


class OfferRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── CREATE ──────────────────────────────────────────────────────────

    async def create(self, offerer_id: int, **kwargs) -> Offer:
        offer = Offer(offerer_id=offerer_id, **kwargs)
        self.db.add(offer)
        await self.db.commit()
        await self.db.refresh(offer)
        return offer

    # ── READ ────────────────────────────────────────────────────────────

    async def get_by_id(self, offer_id: int) -> Optional[Offer]:
        query = select(Offer).filter(Offer.id == offer_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_offerer_id(
        self, offerer_id: int, skip: int = 0, limit: int = 100
    ) -> List[Offer]:
        query = (
            select(Offer)
            .filter(Offer.offerer_id == offerer_id)
            .order_by(Offer.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_trip_vacancy_id(
        self, trip_vacancy_id: int, skip: int = 0, limit: int = 100
    ) -> List[Offer]:
        query = (
            select(Offer)
            .filter(Offer.trip_vacancy_id == trip_vacancy_id)
            .order_by(Offer.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_offers_by_status(
        self, trip_vacancy_id: int, status: str, skip: int = 0, limit: int = 100
    ) -> List[Offer]:
        query = (
            select(Offer)
            .filter(
                and_(Offer.trip_vacancy_id == trip_vacancy_id, Offer.status == status)
            )
            .order_by(Offer.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_received_offers(
        self, requester_id: int, skip: int = 0, limit: int = 100
    ) -> List[Offer]:
        from app.models.trips import TripVacancy

        query = (
            select(Offer)
            .options(
                selectinload(Offer.vacancy).selectinload(TripVacancy.destination_country),
                selectinload(Offer.vacancy).selectinload(TripVacancy.destination_city),
            )
            .join(TripVacancy, Offer.trip_vacancy_id == TripVacancy.id)
            .filter(TripVacancy.requester_id == requester_id)
            .order_by(Offer.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def check_existing_offer(
        self, trip_vacancy_id: int, offerer_id: int
    ) -> Optional[Offer]:
        query = select(Offer).filter(
            and_(
                Offer.trip_vacancy_id == trip_vacancy_id,
                Offer.offerer_id == offerer_id,
                Offer.status.in_(["pending", "accepted"]),
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    # ── UPDATE ──────────────────────────────────────────────────────────

    async def update(self, offer: Offer, **kwargs) -> Offer:
        for key, value in kwargs.items():
            if hasattr(offer, key):
                setattr(offer, key, value)
        await self.db.commit()
        await self.db.refresh(offer)
        return offer

    async def update_status(
        self, offer: Offer, status: str, reviewed_at: Optional[datetime] = None
    ) -> Offer:
        offer.status = status
        if reviewed_at:
            offer.reviewed_at = reviewed_at
        await self.db.commit()
        await self.db.refresh(offer)
        return offer

    # ── DELETE ──────────────────────────────────────────────────────────

    async def delete(self, offer: Offer) -> None:
        await self.db.delete(offer)
        await self.db.commit()
