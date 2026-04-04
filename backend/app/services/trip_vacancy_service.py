import logging
from datetime import date, datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.locations import City
from app.models.trips import TripVacancy
from app.repositories.chat_group_repository import ChatGroupRepository
from app.repositories.chat_member_repository import ChatMemberRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.offer_repository import OfferRepository
from app.repositories.trip_vacancy_repository import TripVacancyRepository

logger = logging.getLogger(__name__)


class TripVacancyService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.trip_vacancy_repo = TripVacancyRepository(db)
        self.chat_group_repo = ChatGroupRepository(db)
        self.chat_member_repo = ChatMemberRepository(db)
        self.message_repo = MessageRepository(db)
        self.offer_repo = OfferRepository(db)

    # ── VALIDATION ──────────────────────────────────────────────────────

    async def _validate_city_country(self, city_id: int, country_id: int) -> Optional[str]:
        result = await self.db.execute(select(City).filter(City.id == city_id))
        city = result.scalar_one_or_none()
        if not city:
            return "City not found"
        if city.country_id != country_id:
            return "City does not belong to the specified country"
        return None

    # ── CREATE ──────────────────────────────────────────────────────────

    MAX_ACTIVE_TRIPS = 5

    async def create_trip_vacancy(
        self, requester_id: int, **data
    ) -> Tuple[bool, Optional[TripVacancy], Optional[str]]:
        try:
            active_count = await self.trip_vacancy_repo.count_active_by_requester(requester_id)
            if active_count >= self.MAX_ACTIVE_TRIPS:
                return False, None, f"You can have at most {self.MAX_ACTIVE_TRIPS} active trips at a time"

            error = await self._validate_city_country(
                data["destination_city_id"], data["destination_country_id"]
            )
            if error:
                return False, None, error

            start_date = data.get("start_date")
            end_date = data.get("end_date")
            if start_date and end_date and start_date >= end_date:
                return False, None, "End date must be after start date"

            min_budget = data.get("min_budget")
            max_budget = data.get("max_budget")
            if min_budget is not None and max_budget is not None and min_budget > max_budget:
                return False, None, "Max budget must be greater than or equal to min budget"

            min_age = data.get("min_age")
            max_age = data.get("max_age")
            if min_age is not None and max_age is not None and min_age > max_age:
                return False, None, "Max age must be greater than or equal to min age"

            trip_vacancy = await self.trip_vacancy_repo.create(
                requester_id=requester_id, **data
            )

            # Create chat group named after destination city
            result = await self.db.execute(
                select(City).filter(City.id == data["destination_city_id"])
            )
            city = result.scalar_one_or_none()
            city_name = city.name if city else "Trip"
            chat_group = await self.chat_group_repo.create(
                trip_vacancy.id, f"Trip to {city_name}"
            )

            # Add requester as first member
            await self.chat_member_repo.create(chat_group.id, requester_id)

            return True, trip_vacancy, None
        except Exception as e:
            return False, None, f"Failed to create trip vacancy: {str(e)}"

    # ── READ ────────────────────────────────────────────────────────────

    async def get_trip_vacancy_by_id(self, trip_vacancy_id: int) -> Optional[TripVacancy]:
        return await self.trip_vacancy_repo.get_by_id(trip_vacancy_id)

    async def get_my_trip_vacancies(
        self, requester_id: int, skip: int = 0, limit: int = 100
    ) -> List[TripVacancy]:
        return await self.trip_vacancy_repo.get_by_requester_id(requester_id, skip, limit)

    async def get_all_trip_vacancies(
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
        if status is None:
            status = "open"

        return await self.trip_vacancy_repo.get_all(
            skip=skip,
            limit=limit,
            destination_city=destination_city,
            destination_country=destination_country,
            status=status,
            start_date_from=start_date_from,
            start_date_to=start_date_to,
            min_age=min_age,
            max_age=max_age,
            min_budget=min_budget,
            max_budget=max_budget,
            gender_preference=gender_preference,
            from_city=from_city,
            from_country=from_country,
        )

    # ── UPDATE ──────────────────────────────────────────────────────────

    async def update_trip_vacancy(
        self, trip_vacancy_id: int, requester_id: int, **update_data
    ) -> Tuple[bool, Optional[TripVacancy], Optional[str]]:
        try:
            trip_vacancy = await self.trip_vacancy_repo.get_by_id(trip_vacancy_id)
            if not trip_vacancy:
                return False, None, "Trip vacancy not found"
            if trip_vacancy.requester_id != requester_id:
                return False, None, "You don't have permission to update this trip vacancy"
            if trip_vacancy.status == "deleted_by_host":
                return False, None, "Cannot update a trip that was removed by the organizer"

            update_data = {k: v for k, v in update_data.items() if v is not None}
            if not update_data:
                return True, trip_vacancy, None

            # Validate city-country if changed
            city_id = update_data.get("destination_city_id")
            country_id = update_data.get("destination_country_id")
            if city_id is not None or country_id is not None:
                effective_city = city_id if city_id is not None else trip_vacancy.destination_city_id
                effective_country = country_id if country_id is not None else trip_vacancy.destination_country_id
                error = await self._validate_city_country(effective_city, effective_country)
                if error:
                    return False, None, error

            # Validate dates
            start = update_data.get("start_date", trip_vacancy.start_date)
            end = update_data.get("end_date", trip_vacancy.end_date)
            if start and end and start >= end:
                return False, None, "End date must be after start date"

            # Validate budget
            mn = update_data.get("min_budget", trip_vacancy.min_budget)
            mx = update_data.get("max_budget", trip_vacancy.max_budget)
            if mn is not None and mx is not None and mn > mx:
                return False, None, "Max budget must be greater than or equal to min budget"

            # Validate age
            mn_age = update_data.get("min_age", trip_vacancy.min_age)
            mx_age = update_data.get("max_age", trip_vacancy.max_age)
            if mn_age is not None and mx_age is not None and mn_age > mx_age:
                return False, None, "Max age must be greater than or equal to min age"

            updated = await self.trip_vacancy_repo.update(trip_vacancy_id, **update_data)
            return True, updated, None
        except Exception as e:
            return False, None, f"Failed to update trip vacancy: {str(e)}"

    async def update_status(
        self, trip_vacancy_id: int, requester_id: int, status: str
    ) -> Tuple[bool, Optional[TripVacancy], Optional[str]]:
        trip_vacancy = await self.trip_vacancy_repo.get_by_id(trip_vacancy_id)
        if not trip_vacancy:
            return False, None, "Trip vacancy not found"
        if trip_vacancy.requester_id != requester_id:
            return False, None, "You don't have permission to update this trip vacancy"
        if trip_vacancy.status == "deleted_by_host":
            return False, None, "Cannot change status of a removed trip"

        valid_statuses = ("open", "matched", "closed", "cancelled")
        if status not in valid_statuses:
            return False, None, f"Invalid status. Must be one of: {', '.join(valid_statuses)}"

        updated = await self.trip_vacancy_repo.update_status(trip_vacancy_id, status)
        return True, updated, None

    # ── DELETE ──────────────────────────────────────────────────────────

    async def delete_trip_vacancy(
        self, trip_vacancy_id: int, requester_id: int
    ) -> Tuple[bool, Optional[str]]:
        """Soft-delete: status deleted_by_host, chat and messages kept; system TripMate notice."""
        try:
            trip_vacancy = await self.trip_vacancy_repo.get_by_id(trip_vacancy_id)
            if not trip_vacancy:
                return False, "Trip vacancy not found"
            if trip_vacancy.requester_id != requester_id:
                return False, "You don't have permission to delete this trip vacancy"
            if trip_vacancy.status == "deleted_by_host":
                return False, "Trip is already removed"

            chat_group = await self.chat_group_repo.get_by_trip_vacancy_id(trip_vacancy_id)
            if chat_group:
                notice = (
                    f'TripMate: The trip "{chat_group.name}" was removed by the organizer. '
                    "This chat stays open so you can read past messages. "
                    "New messages are disabled."
                )
                await self.message_repo.create(chat_group.id, None, notice)
                # chat_groups.updated_at is TIMESTAMP WITHOUT TIME ZONE; asyncpg rejects tz-aware datetimes.
                await self.chat_group_repo.update(
                    chat_group,
                    updated_at=datetime.now(timezone.utc).replace(tzinfo=None),
                )

            offers = await self.offer_repo.get_by_trip_vacancy_id(trip_vacancy_id)
            now = datetime.now(timezone.utc)
            for offer in offers:
                if offer.status == "pending":
                    await self.offer_repo.update_status(
                        offer, "cancelled", reviewed_at=now
                    )

            await self.trip_vacancy_repo.update_status(trip_vacancy_id, "deleted_by_host")
            if chat_group:
                await self.chat_member_repo.reset_trip_removal_seen_for_members_after_host_removal(
                    chat_group.id, requester_id
                )
            return True, None
        except Exception as e:
            return False, f"Failed to remove trip vacancy: {str(e)}"
