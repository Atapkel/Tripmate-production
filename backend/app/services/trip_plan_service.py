import logging
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recommendation.generated_plans import GeneratedTripPlan
from app.models.trips import TripVacancy
from app.repositories.generated_trip_plan_repository import GeneratedTripPlanRepository
from app.repositories.offer_repository import OfferRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.trip_vacancy_repository import TripVacancyRepository
from app.schemas.recommendation.requests import (
    GenerateRecommendationsRequest,
    RecommendationUserPayload,
)
from app.schemas.recommendation.structured import PlaceRecommendationsSchema
from app.services.ai_service import generate_recommendations
from app.services.image_service import enrich_with_unsplash_images

logger = logging.getLogger(__name__)


class TripPlanService:
    PLAN_GENERATION_COOLDOWN_MINUTES = 10

    def __init__(self, db: AsyncSession):
        self.db = db
        self.trip_vacancy_repo = TripVacancyRepository(db)
        self.offer_repo = OfferRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.generated_plan_repo = GeneratedTripPlanRepository(db)

    async def generate_plan(
        self, trip_vacancy_id: int, user_id: int
    ) -> Tuple[bool, Optional[PlaceRecommendationsSchema], Optional[str]]:
        try:
            trip_vacancy = await self.trip_vacancy_repo.get_by_id(trip_vacancy_id)
            if not trip_vacancy:
                return False, None, "Trip vacancy not found"

            if not await self._is_user_trip_member(trip_vacancy, user_id):
                logger.warning("Generate plan denied: user %d is not a member", user_id)
                return False, None, "You don't have permission to generate plan for this trip"

            # Check for existing plan / cooldown
            existing = await self.generated_plan_repo.get_by_trip_vacancy_id(trip_vacancy_id)
            if existing:
                if existing.generated_at:
                    return False, None, "Trip plan has already been generated"
                if (
                    existing.generation_requested_at
                    and datetime.now(timezone.utc) - existing.generation_requested_at
                    < timedelta(minutes=self.PLAN_GENERATION_COOLDOWN_MINUTES)
                ):
                    return False, None, "Plan is being generated, please wait"

            if trip_vacancy.people_joined < trip_vacancy.people_needed:
                return (
                    False,
                    None,
                    f"Trip vacancy is not full yet. "
                    f"Currently {trip_vacancy.people_joined}/{trip_vacancy.people_needed} people joined",
                )

            # Collect profiles of all trip members
            accepted_offers = await self.offer_repo.get_offers_by_status(
                trip_vacancy_id, "accepted", skip=0, limit=100
            )
            profile_user_ids = [trip_vacancy.requester_id] + [
                o.offerer_id for o in accepted_offers
            ]
            profiles = await self.profile_repo.get_by_user_ids_with_relations(profile_user_ids)
            profiles_by_uid = {p.user_id: p for p in profiles}

            users_data: List[RecommendationUserPayload] = []

            # Requester = user-1
            req_profile = profiles_by_uid.get(trip_vacancy.requester_id)
            if req_profile:
                entry = self._profile_to_payload(req_profile)
                entry.user_label = "user-1"
                users_data.append(entry)

            # Accepted offerers = user-2, user-3, ...
            for idx, offer in enumerate(accepted_offers, start=2):
                offerer_profile = profiles_by_uid.get(offer.offerer_id)
                if offerer_profile:
                    entry = self._profile_to_payload(offerer_profile)
                    entry.user_label = f"user-{idx}"
                    users_data.append(entry)

            logger.info("Collected %d user profiles for plan generation", len(users_data))

            await self.generated_plan_repo.mark_generation_requested(trip_vacancy.id)

            payload = self._build_plan_payload(trip_vacancy, users_data)
            logger.info("Sending plan request for trip vacancy %d", trip_vacancy.id)

            planner_response = await self._call_plan_service(payload)

            await self.generated_plan_repo.upsert_plan_response(
                trip_vacancy_id=trip_vacancy.id,
                planner_response=planner_response,
            )

            plan: GeneratedTripPlan = (
                await self.generated_plan_repo.get_by_trip_vacancy_id_with_places(
                    trip_vacancy_id
                )
            )

            num_places = len(plan.recommended_places) if plan.recommended_places else 0
            logger.info("Plan saved with %d recommended places", num_places)

            await enrich_with_unsplash_images(plan.recommended_places)

            return True, planner_response, None
        except Exception as e:
            logger.error("Failed to generate plan: %s", e)
            return False, None, f"Failed to generate plan: {str(e)}"

    async def get_user_plans(
        self, user_id: int
    ) -> List[GeneratedTripPlan]:
        return await self.generated_plan_repo.get_user_plans_with_places(user_id)

    async def get_trip_plan(
        self, trip_vacancy_id: int, user_id: int
    ) -> Tuple[bool, Optional[GeneratedTripPlan], Optional[str]]:
        try:
            trip_vacancy = await self.trip_vacancy_repo.get_by_id(trip_vacancy_id)
            if not trip_vacancy:
                return False, None, "Trip vacancy not found"

            if not await self._is_user_trip_member(trip_vacancy, user_id):
                return False, None, "You don't have permission to view this trip plan"

            plan = await self.generated_plan_repo.get_by_trip_vacancy_id_with_places(
                trip_vacancy_id
            )
            if not plan:
                return False, None, "Trip plan not found"
            if not plan.generated_at:
                return False, None, "Plan is being generated, please wait"

            return True, plan, None
        except Exception as e:
            return False, None, f"Failed to get trip plan: {str(e)}"

    # ── PRIVATE HELPERS ─────────────────────────────────────────────────

    async def _is_user_trip_member(self, trip_vacancy: TripVacancy, user_id: int) -> bool:
        if trip_vacancy.requester_id == user_id:
            return True
        offer = await self.offer_repo.check_existing_offer(trip_vacancy.id, user_id)
        return bool(offer and offer.status == "accepted")

    @staticmethod
    def _calculate_age(date_of_birth: date) -> int:
        today = date.today()
        return (
            today.year
            - date_of_birth.year
            - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
        )

    def _profile_to_payload(self, profile) -> RecommendationUserPayload:
        return RecommendationUserPayload(
            name=f"{profile.first_name} {profile.last_name}",
            age=self._calculate_age(profile.date_of_birth),
            gender=profile.gender,
            from_city=profile.city.name if profile.city else "",
            from_country=profile.country.name if profile.country else "",
            bio=profile.bio or "",
            languages=[ul.language.name for ul in profile.languages],
            interests=[ui.interest.name for ui in profile.interests],
            travel_styles=[ts.travel_style.name for ts in profile.travel_styles],
            user_label="",
        )

    @staticmethod
    def _build_plan_payload(
        trip_vacancy: TripVacancy, users_data: List[RecommendationUserPayload]
    ) -> GenerateRecommendationsRequest:
        return GenerateRecommendationsRequest(
            trip_vacancy_id=trip_vacancy.id,
            destination_city=(
                trip_vacancy.destination_city.name if trip_vacancy.destination_city else ""
            ),
            destination_country=(
                trip_vacancy.destination_country.name if trip_vacancy.destination_country else ""
            ),
            start_date=trip_vacancy.start_date or None,
            end_date=trip_vacancy.end_date or None,
            description=trip_vacancy.description or "",
            min_budget=(
                float(trip_vacancy.min_budget) if trip_vacancy.min_budget is not None else 0.0
            ),
            max_budget=(
                float(trip_vacancy.max_budget) if trip_vacancy.max_budget is not None else 0.0
            ),
            users=users_data,
        )

    async def _call_plan_service(
        self, payload: GenerateRecommendationsRequest
    ) -> PlaceRecommendationsSchema:
        try:
            return await generate_recommendations(payload)
        except Exception:
            await self.generated_plan_repo.mark_generation_requested(
                payload.trip_vacancy_id, should_delete=True
            )
            raise
