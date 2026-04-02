from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.users import User
from app.schemas.common import MessageResponse
from app.schemas.profiles import (
    ProfileCreateRequest,
    ProfileDetailResponse,
    ProfileResponse,
    ProfileUpdateRequest,
)
from app.services.file_service import delete_file, save_upload, validate_image_type
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/me", tags=["Me (Current User Profile)"])

profiles_router = APIRouter(prefix="/profiles", tags=["Profiles"])


@profiles_router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    request: ProfileCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    success, profile, error = await service.create_profile(
        user_id=current_user.id, **request.model_dump()
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return profile


@profiles_router.get("/{profile_id}", response_model=ProfileDetailResponse)
async def get_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    profile = await service.get_profile_by_id(profile_id, include_relations=True)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    return profile


@router.get("", response_model=ProfileDetailResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    profile = await service.get_profile_by_user_id(current_user.id, include_relations=True)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    return profile


@router.put("", response_model=ProfileResponse)
async def update_my_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    success, profile, error = await service.update_profile_by_user_id(
        user_id=current_user.id, **request.model_dump(exclude_unset=True)
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return profile


@router.delete("", response_model=MessageResponse)
async def delete_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    success, error = await service.delete_profile_by_user_id(user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Profile deleted successfully"}


# ── Photo ──────────────────────────────────────────────────────────────


@router.post("/photo", response_model=ProfileResponse)
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        validate_image_type(file.content_type)
        file_path = await save_upload(file, "uploads/profile_photos")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except OSError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    service = ProfileService(db)

    # Delete old photo
    profile = await service.get_profile_by_user_id(current_user.id)
    if profile:
        delete_file(profile.profile_photo)

    success, updated_profile, error = await service.update_profile_by_user_id(
        user_id=current_user.id, profile_photo=str(file_path)
    )
    if not success:
        delete_file(str(file_path))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return updated_profile


@router.delete("/photo", response_model=ProfileResponse)
async def delete_profile_photo(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    profile = await service.get_profile_by_user_id(current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    delete_file(profile.profile_photo)

    success, updated_profile, error = await service.update_profile_by_user_id(
        user_id=current_user.id, profile_photo=None
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return updated_profile
