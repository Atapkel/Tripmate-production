from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.users import User
from app.schemas.recommendation import PlaceRecommendationsSchema, TripPlanResponse
from app.services.trip_plan_service import TripPlanService

router = APIRouter(prefix="/trips", tags=["Trip Plans"])


@router.get("/me/plans", response_model=List[TripPlanResponse])
async def get_my_plans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripPlanService(db)
    return await service.get_user_plans(current_user.id)


@router.post("/{trip_id}/generate-plan", response_model=PlaceRecommendationsSchema)
async def generate_plan(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripPlanService(db)
    success, plan, error = await service.generate_plan(
        trip_vacancy_id=trip_id, user_id=current_user.id
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return plan


@router.get("/{trip_id}/plan", response_model=TripPlanResponse)
async def get_trip_plan(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TripPlanService(db)
    success, plan, error = await service.get_trip_plan(
        trip_vacancy_id=trip_id, user_id=current_user.id
    )
    if not success:
        if error in ("Trip vacancy not found", "Trip plan not found"):
            code = status.HTTP_404_NOT_FOUND
        elif error == "You don't have permission to view this trip plan":
            code = status.HTTP_403_FORBIDDEN
        else:
            code = status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=code, detail=error)

    return plan
