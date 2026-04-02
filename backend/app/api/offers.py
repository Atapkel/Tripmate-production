from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.users import User
from app.schemas.common import MessageResponse
from app.schemas.trips import (
    OfferCreateRequest,
    OfferResponse,
    OfferStatusUpdateRequest,
    OfferUpdateRequest,
    OfferWithTripResponse,
)
from app.services.offer_service import OfferService

router = APIRouter(prefix="/offers", tags=["Offers"])


@router.post("", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    request: OfferCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OfferService(db)
    success, offer, error = await service.create_offer(
        offerer_id=current_user.id, **request.model_dump()
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return offer


@router.get("/me", response_model=List[OfferResponse])
async def get_my_offers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OfferService(db)
    return await service.get_my_offers(current_user.id, skip, limit)


@router.get("/received", response_model=List[OfferWithTripResponse])
async def get_received_offers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OfferService(db)
    return await service.get_received_offers(current_user.id, skip, limit)


@router.get("/trip/{trip_id}", response_model=List[OfferResponse])
async def get_offers_for_trip(
    trip_id: int,
    offer_status: Optional[str] = Query(
        None, alias="status", pattern="^(pending|accepted|rejected|cancelled)$"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OfferService(db)
    success, offers, error = await service.get_offers_for_trip_vacancy(
        trip_vacancy_id=trip_id,
        requester_id=current_user.id,
        status=offer_status,
        skip=skip,
        limit=limit,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=error)

    return offers


@router.get("/{offer_id}", response_model=OfferResponse)
async def get_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OfferService(db)
    success, offer, error = await service.get_offer_by_id(offer_id, current_user.id)
    if not success:
        code = status.HTTP_404_NOT_FOUND if error == "Offer not found" else status.HTTP_403_FORBIDDEN
        raise HTTPException(status_code=code, detail=error)

    return offer


@router.patch("/{offer_id}", response_model=OfferResponse)
async def update_offer(
    offer_id: int,
    request: OfferUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    service = OfferService(db)
    success, offer, error = await service.update_offer(
        offer_id=offer_id, offerer_id=current_user.id, **update_data
    )
    if not success:
        code = status.HTTP_404_NOT_FOUND if error == "Offer not found" else status.HTTP_403_FORBIDDEN
        raise HTTPException(status_code=code, detail=error)

    return offer


@router.patch("/{offer_id}/status", response_model=OfferResponse)
async def update_offer_status(
    offer_id: int,
    request: OfferStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OfferService(db)
    success, offer, error = await service.update_offer_status(
        offer_id=offer_id, requester_id=current_user.id, new_status=request.status
    )
    if not success:
        code = (
            status.HTTP_404_NOT_FOUND
            if error in ("Offer not found", "Trip vacancy not found")
            else status.HTTP_403_FORBIDDEN
        )
        raise HTTPException(status_code=code, detail=error)

    return offer


@router.post("/{offer_id}/cancel", response_model=OfferResponse)
async def cancel_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OfferService(db)
    success, offer, error = await service.cancel_offer(
        offer_id=offer_id, offerer_id=current_user.id
    )
    if not success:
        code = status.HTTP_404_NOT_FOUND if error == "Offer not found" else status.HTTP_403_FORBIDDEN
        raise HTTPException(status_code=code, detail=error)

    return offer


@router.delete("/{offer_id}", response_model=MessageResponse)
async def delete_offer(
    offer_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OfferService(db)
    success, error = await service.delete_offer(offer_id, current_user.id)
    if not success:
        code = status.HTTP_404_NOT_FOUND if error == "Offer not found" else status.HTTP_403_FORBIDDEN
        raise HTTPException(status_code=code, detail=error)

    return {"message": "Offer deleted successfully"}
