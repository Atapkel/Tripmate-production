from datetime import datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.trips import Offer, TripVacancy


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
        if status in ("rejected", "accepted"):
            offer.offerer_outcome_seen_at = None
        await self.db.commit()
        await self.db.refresh(offer)
        return offer

    async def count_pending_received_for_requester(self, requester_id: int) -> int:
        q = (
            select(func.count())
            .select_from(Offer)
            .join(TripVacancy, Offer.trip_vacancy_id == TripVacancy.id)
            .where(
                and_(
                    TripVacancy.requester_id == requester_id,
                    Offer.status == "pending",
                )
            )
        )
        result = await self.db.execute(q)
        return int(result.scalar_one() or 0)

    async def count_unseen_outcome_for_offerer(self, offerer_id: int) -> int:
        q = select(func.count()).where(
            and_(
                Offer.offerer_id == offerer_id,
                Offer.status.in_(["accepted", "rejected"]),
                Offer.offerer_outcome_seen_at.is_(None),
            )
        )
        result = await self.db.execute(q)
        return int(result.scalar_one() or 0)

    async def mark_outcome_offers_seen_for_offerer(self, offerer_id: int) -> int:
        now = datetime.now(timezone.utc)
        stmt = (
            update(Offer)
            .where(
                and_(
                    Offer.offerer_id == offerer_id,
                    Offer.status.in_(["accepted", "rejected"]),
                    Offer.offerer_outcome_seen_at.is_(None),
                )
            )
            .values(offerer_outcome_seen_at=now)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount or 0

    async def get_attention_counts(self, user_id: int) -> Tuple[int, int]:
        pending = await self.count_pending_received_for_requester(user_id)
        unseen_outcome = await self.count_unseen_outcome_for_offerer(user_id)
        return pending, unseen_outcome

    # ── DELETE ──────────────────────────────────────────────────────────

    async def delete(self, offer: Offer) -> None:
        await self.db.delete(offer)
        await self.db.commit()
