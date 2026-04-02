from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.recommendation.generated_plans import GeneratedTripPlan
from app.models.recommendation.recommended_places import RecommendedPlace
from app.schemas.recommendation.structured import (
    PlaceRecommendationsSchema,
    RecommendedPlaceSchema,
)


class GeneratedTripPlanRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_trip_vacancy_id(
        self, trip_vacancy_id: int
    ) -> Optional[GeneratedTripPlan]:
        query = select(GeneratedTripPlan).filter(
            GeneratedTripPlan.trip_vacancy_id == trip_vacancy_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_trip_vacancy_id_with_places(
        self, trip_vacancy_id: int
    ) -> Optional[GeneratedTripPlan]:
        query = (
            select(GeneratedTripPlan)
            .options(selectinload(GeneratedTripPlan.recommended_places))
            .filter(GeneratedTripPlan.trip_vacancy_id == trip_vacancy_id)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_user_plans_with_places(
        self, user_id: int
    ) -> List[GeneratedTripPlan]:
        from app.models.trips import Offer, TripVacancy

        query = (
            select(GeneratedTripPlan)
            .options(selectinload(GeneratedTripPlan.recommended_places))
            .join(TripVacancy, GeneratedTripPlan.trip_vacancy_id == TripVacancy.id)
            .outerjoin(
                Offer,
                (Offer.trip_vacancy_id == TripVacancy.id)
                & (Offer.offerer_id == user_id)
                & (Offer.status == "accepted"),
            )
            .filter(
                GeneratedTripPlan.generated_at.isnot(None),
                or_(
                    TripVacancy.requester_id == user_id,
                    Offer.id.isnot(None),
                ),
            )
            .order_by(GeneratedTripPlan.generated_at.desc())
        )
        result = await self.db.execute(query)
        return list(result.scalars().unique().all())

    async def upsert_plan_response(
        self, trip_vacancy_id: int, planner_response: PlaceRecommendationsSchema
    ) -> GeneratedTripPlan:
        plan = await self.get_by_trip_vacancy_id(trip_vacancy_id)
        now = datetime.now(timezone.utc)
        raw = planner_response.model_dump()

        if not plan:
            plan = GeneratedTripPlan(
                trip_vacancy_id=trip_vacancy_id,
                raw_response=raw,
                generation_requested_at=now,
                generated_at=now,
            )
            self.db.add(plan)
            await self.db.flush()
        else:
            plan.raw_response = raw
            if not plan.generation_requested_at:
                plan.generation_requested_at = now
            plan.generated_at = now
            await self.db.execute(
                delete(RecommendedPlace).where(
                    RecommendedPlace.generated_plan_id == plan.id
                )
            )

        places = [
            self._build_place(plan.id, place)
            for place in planner_response.recommended_places
        ]
        if places:
            self.db.add_all(places)

        await self.db.commit()
        await self.db.refresh(plan)
        return plan

    async def mark_generation_requested(
        self, trip_vacancy_id: int, should_delete: bool = False
    ) -> GeneratedTripPlan:
        plan = await self.get_by_trip_vacancy_id(trip_vacancy_id)
        now = datetime.now(timezone.utc)

        if should_delete and plan:
            await self.db.delete(plan)
            await self.db.commit()
            return plan

        if not plan:
            plan = GeneratedTripPlan(
                trip_vacancy_id=trip_vacancy_id,
                raw_response={},
                generation_requested_at=now,
                generated_at=None,
            )
            self.db.add(plan)
        else:
            plan.generation_requested_at = now

        await self.db.commit()
        await self.db.refresh(plan)
        return plan

    @staticmethod
    def _build_place(
        generated_plan_id: int, place: RecommendedPlaceSchema
    ) -> RecommendedPlace:
        return RecommendedPlace(
            generated_plan_id=generated_plan_id,
            place_id=place.place_id,
            name=place.name,
            category=place.category,
            short_description=place.short_description,
            why_people_go=place.why_people_go,
            why_recommended=place.why_recommended,
            best_season=place.best_season,
            audience=place.audience,
            best_time_of_day=place.best_time_of_day,
            image_url=place.image_url,
            query_to_search=place.query_to_search,
            raw_payload=place.model_dump(),
        )
