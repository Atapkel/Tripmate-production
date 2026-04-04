from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.users import User
from app.schemas.common import MessageResponse
from app.schemas.trips import (
    TripVacancyCreateRequest,
    TripVacancyResponse,
    TripVacancyUpdateRequest,
)
from app.services.trip_vacancy_service import TripVacancyService

router = APIRouter(prefix="/trips", tags=["Trip Vacancies"])


@router.post("", response_model=TripVacancyResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    request: TripVacancyCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripVacancyService(db)
    success, trip, error = await service.create_trip_vacancy(
        requester_id=current_user.id, **request.model_dump()
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return trip


@router.get("/me", response_model=List[TripVacancyResponse])
async def get_my_trips(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripVacancyService(db)
    return await service.get_my_trip_vacancies(
        requester_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/{trip_id}", response_model=TripVacancyResponse)
async def get_trip(
    trip_id: int,
    db: AsyncSession = Depends(get_db),
):
    service = TripVacancyService(db)
    trip = await service.get_trip_vacancy_by_id(trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    return trip


@router.get("", response_model=List[TripVacancyResponse])
async def list_trips(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    destination_city: Optional[str] = None,
    destination_country: Optional[str] = None,
    trip_status: Optional[str] = Query(None, alias="status", pattern="^(open|matched|closed|cancelled)$"),
    start_date_from: Optional[date] = None,
    start_date_to: Optional[date] = None,
    min_age: Optional[int] = Query(None, ge=0, le=150),
    max_age: Optional[int] = Query(None, ge=0, le=150),
    min_budget: Optional[float] = Query(None, ge=0),
    max_budget: Optional[float] = Query(None, ge=0),
    gender_preference: Optional[str] = Query(None, pattern="^(male|female|any)$"),
    from_city: Optional[str] = None,
    from_country: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    service = TripVacancyService(db)
    return await service.get_all_trip_vacancies(
        skip=skip,
        limit=limit,
        destination_city=destination_city,
        destination_country=destination_country,
        status=trip_status,
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


@router.put("/{trip_id}", response_model=TripVacancyResponse)
async def update_trip(
    trip_id: int,
    request: TripVacancyUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripVacancyService(db)
    success, trip, error = await service.update_trip_vacancy(
        trip_vacancy_id=trip_id,
        requester_id=current_user.id,
        **request.model_dump(exclude_unset=True),
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return trip


@router.patch("/{trip_id}/status", response_model=TripVacancyResponse)
async def update_trip_status(
    trip_id: int,
    status_value: str = Query(..., alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripVacancyService(db)
    success, trip, error = await service.update_status(
        trip_vacancy_id=trip_id,
        requester_id=current_user.id,
        status=status_value,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return trip


@router.delete("/{trip_id}", response_model=MessageResponse)
async def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripVacancyService(db)
    success, error = await service.delete_trip_vacancy(
        trip_vacancy_id=trip_id, requester_id=current_user.id
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {
        "message": "Trip removed. Members can still read the chat; new messages are disabled.",
    }
