from datetime import datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trips import Offer
from app.repositories.chat_group_repository import ChatGroupRepository
from app.repositories.chat_member_repository import ChatMemberRepository
from app.repositories.offer_repository import OfferRepository
from app.repositories.trip_vacancy_repository import TripVacancyRepository


class OfferService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.offer_repo = OfferRepository(db)
        self.trip_vacancy_repo = TripVacancyRepository(db)
        self.chat_group_repo = ChatGroupRepository(db)
        self.chat_member_repo = ChatMemberRepository(db)

    # ── CREATE ──────────────────────────────────────────────────────────

    async def create_offer(
        self, offerer_id: int, **offer_data
    ) -> Tuple[bool, Optional[Offer], Optional[str]]:
        try:
            trip_vacancy_id = offer_data.get("trip_vacancy_id")

            trip_vacancy = await self.trip_vacancy_repo.get_by_id(trip_vacancy_id)
            if not trip_vacancy:
                return False, None, "Trip vacancy not found"

            if trip_vacancy.status != "open":
                return False, None, "Trip vacancy is not active"

            if trip_vacancy.requester_id == offerer_id:
                return False, None, "You cannot make an offer for your own trip vacancy"

            existing = await self.offer_repo.check_existing_offer(trip_vacancy_id, offerer_id)
            if existing:
                return False, None, "You already have an active offer for this trip vacancy"

            offer = await self.offer_repo.create(offerer_id=offerer_id, **offer_data)
            return True, offer, None
        except Exception as e:
            return False, None, f"Failed to create offer: {str(e)}"

    # ── READ ────────────────────────────────────────────────────────────

    async def get_offer_by_id(
        self, offer_id: int, user_id: int
    ) -> Tuple[bool, Optional[Offer], Optional[str]]:
        try:
            offer = await self.offer_repo.get_by_id(offer_id)
            if not offer:
                return False, None, "Offer not found"

            trip_vacancy = await self.trip_vacancy_repo.get_by_id(offer.trip_vacancy_id)

            if offer.offerer_id != user_id and (
                not trip_vacancy or trip_vacancy.requester_id != user_id
            ):
                return False, None, "You don't have permission to view this offer"

            return True, offer, None
        except Exception as e:
            return False, None, f"Failed to get offer: {str(e)}"

    async def get_my_offers(
        self, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Offer]:
        return await self.offer_repo.get_by_offerer_id(user_id, skip, limit)

    async def get_received_offers(
        self, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Offer]:
        return await self.offer_repo.get_received_offers(user_id, skip, limit)

    async def get_offers_for_trip_vacancy(
        self,
        trip_vacancy_id: int,
        requester_id: int,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[bool, Optional[List[Offer]], Optional[str]]:
        try:
            trip_vacancy = await self.trip_vacancy_repo.get_by_id(trip_vacancy_id)
            if not trip_vacancy:
                return False, None, "Trip vacancy not found"

            if trip_vacancy.requester_id != requester_id:
                return False, None, "You don't have permission to view offers for this trip vacancy"

            if status:
                offers = await self.offer_repo.get_offers_by_status(
                    trip_vacancy_id, status, skip, limit
                )
            else:
                offers = await self.offer_repo.get_by_trip_vacancy_id(
                    trip_vacancy_id, skip, limit
                )
            return True, offers, None
        except Exception as e:
            return False, None, f"Failed to get offers: {str(e)}"

    # ── UPDATE ──────────────────────────────────────────────────────────

    async def update_offer(
        self, offer_id: int, offerer_id: int, **update_data
    ) -> Tuple[bool, Optional[Offer], Optional[str]]:
        try:
            offer = await self.offer_repo.get_by_id(offer_id)
            if not offer:
                return False, None, "Offer not found"

            if offer.offerer_id != offerer_id:
                return False, None, "You don't have permission to update this offer"

            if offer.status != "pending":
                return False, None, "You can only update pending offers"

            updated_offer = await self.offer_repo.update(offer, **update_data)
            return True, updated_offer, None
        except Exception as e:
            return False, None, f"Failed to update offer: {str(e)}"

    async def update_offer_status(
        self, offer_id: int, requester_id: int, new_status: str
    ) -> Tuple[bool, Optional[Offer], Optional[str]]:
        try:
            offer = await self.offer_repo.get_by_id(offer_id)
            if not offer:
                return False, None, "Offer not found"

            trip_vacancy = await self.trip_vacancy_repo.get_by_id(offer.trip_vacancy_id)
            if not trip_vacancy:
                return False, None, "Trip vacancy not found"

            if trip_vacancy.requester_id != requester_id:
                return False, None, "Only the trip vacancy requester can change offer status"

            if offer.status != "pending":
                return False, None, "Only pending offers can be accepted or rejected"

            if new_status not in ("accepted", "rejected"):
                return False, None, "Invalid status. Use 'accepted' or 'rejected'"

            if new_status == "accepted":
                if trip_vacancy.people_joined >= trip_vacancy.people_needed:
                    return False, None, "Trip vacancy is already full"

                new_joined = trip_vacancy.people_joined + 1
                new_vacancy_status = (
                    "matched" if new_joined >= trip_vacancy.people_needed else trip_vacancy.status
                )

                await self.trip_vacancy_repo.update(
                    trip_vacancy.id,
                    people_joined=new_joined,
                    status=new_vacancy_status,
                )

                # Add offerer to the trip chat group
                chat_group = await self.chat_group_repo.get_by_trip_vacancy_id(trip_vacancy.id)
                if chat_group:
                    is_member = await self.chat_member_repo.is_member(
                        chat_group.id, offer.offerer_id
                    )
                    if not is_member:
                        await self.chat_member_repo.create(chat_group.id, offer.offerer_id)

            updated_offer = await self.offer_repo.update_status(
                offer, new_status, reviewed_at=datetime.now(timezone.utc)
            )
            return True, updated_offer, None
        except Exception as e:
            return False, None, f"Failed to update offer status: {str(e)}"

    # ── CANCEL ──────────────────────────────────────────────────────────

    async def cancel_offer(
        self, offer_id: int, offerer_id: int
    ) -> Tuple[bool, Optional[Offer], Optional[str]]:
        try:
            offer = await self.offer_repo.get_by_id(offer_id)
            if not offer:
                return False, None, "Offer not found"

            if offer.offerer_id != offerer_id:
                return False, None, "You don't have permission to cancel this offer"

            if offer.status != "pending":
                return False, None, "You can only cancel pending offers"

            updated_offer = await self.offer_repo.update_status(
                offer, "cancelled", reviewed_at=datetime.now(timezone.utc)
            )
            return True, updated_offer, None
        except Exception as e:
            return False, None, f"Failed to cancel offer: {str(e)}"

    # ── DELETE ──────────────────────────────────────────────────────────

    async def delete_offer(
        self, offer_id: int, user_id: int
    ) -> Tuple[bool, Optional[str]]:
        try:
            offer = await self.offer_repo.get_by_id(offer_id)
            if not offer:
                return False, "Offer not found"

            if offer.offerer_id != user_id:
                return False, "You don't have permission to delete this offer"

            if offer.status not in ("cancelled", "rejected"):
                return False, "You can only delete cancelled or rejected offers"

            await self.offer_repo.delete(offer)
            return True, None
        except Exception as e:
            return False, f"Failed to delete offer: {str(e)}"
