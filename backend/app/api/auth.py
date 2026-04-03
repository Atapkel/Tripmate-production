import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.api.dependencies import get_current_user, security
from app.core.config import config
from app.core.database import get_db
from app.core.security import create_access_token, verify_refresh_token
from app.models.users import User
from app.schemas.auth import (
    AuthResponse,
    EmailVerificationRequest,
    PasswordChange,
    PasswordResetRequest,
    PasswordResetVerify,
    RefreshTokenRequest,
    RegisterResponse,
    ResendVerificationRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── Registration & Login ───────────────────────────────────────────────

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    success, user, _, error = await auth_service.register(
        email=request.email,
        password=request.password,
        role=request.role,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {
        "user": user,
        "message": "Registration successful. Please check your email for the verification code.",
    }


@router.post("/login", response_model=AuthResponse)
async def login(
    request: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    success, tokens, user, error = await auth_service.login(
        email=request.email,
        password=request.password,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error,
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "token_type": "bearer",
        "user": user,
    }


@router.post("/logout", response_model=MessageResponse)
async def logout(
    current_user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    success, error = await auth_service.logout(credentials.credentials)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Logged out successfully"}


# ── Token ──────────────────────────────────────────────────────────────

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    is_valid, payload = verify_refresh_token(request.refresh_token)
    if not is_valid or not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    auth_service = AuthService(db)
    user = await auth_service.get_current_user(int(payload["sub"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "access_token": access_token,
        "refresh_token": request.refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ── Email Verification ─────────────────────────────────────────────────

@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    request: EmailVerificationRequest,
    db: AsyncSession = Depends(get_db),
):
    logger.info("POST /verify-email called — user_id=%s, code=%s", request.user_id, request.verification_code)
    auth_service = AuthService(db)
    success, error = await auth_service.verify_email(
        user_id=request.user_id,
        verification_code=request.verification_code,
    )
    if not success:
        logger.warning("Email verification failed — user_id=%s, error=%s", request.user_id, error)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    logger.info("Email verification succeeded — user_id=%s", request.user_id)
    return {"message": "Email verified successfully"}


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    request: ResendVerificationRequest,
    db: AsyncSession = Depends(get_db),
):
    logger.info("POST /resend-verification called — user_id=%s", request.user_id)
    auth_service = AuthService(db)
    success, _, error = await auth_service.resend_verification_code(user_id=request.user_id)
    if not success:
        logger.warning("Resend verification failed — user_id=%s, error=%s", request.user_id, error)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    logger.info("Resend verification succeeded — user_id=%s", request.user_id)
    return {"message": "Verification code sent successfully"}


# ── Password ───────────────────────────────────────────────────────────

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    await auth_service.request_password_reset(request.email)
    return {"message": "If the email exists, a password reset code has been sent"}


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    request: PasswordResetVerify,
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    success, error = await auth_service.reset_password(
        token=request.token,
        new_password=request.new_password,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Password has been reset successfully"}


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    request: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    success, error = await auth_service.change_password(
        user_id=current_user.id,
        current_password=request.current_password,
        new_password=request.new_password,
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return {"message": "Password changed successfully"}
