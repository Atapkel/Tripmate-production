import asyncio
import logging
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import config
from app.core.redis_client import get_redis_client
from app.core.security import (
    create_token_pair,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from app.models.users import User
from app.repositories.user_repository import UserRepository
from app.services.email_service import email_service

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.redis = get_redis_client()

    # ── REGISTER ────────────────────────────────────────────────────────

    async def register(
        self, email: str, password: str, role: str = "user"
    ) -> Tuple[bool, Optional[User], Optional[str], Optional[str]]:
        if await self.user_repo.exists_by_email(email):
            return False, None, None, "Email already registered"

        hashed_password = await asyncio.to_thread(get_password_hash, password)
        try:
            user = await self.user_repo.create(
                email=email, password=hashed_password, role=role
            )
            verification_code = await self._generate_verification_code(user.id, user.email)
            sent = await self._send_verification_email(user.id, user.email, verification_code)
            if not sent:
                logger.warning("Verification email could not be sent to %s", email)
            return True, user, verification_code, None
        except Exception as e:
            logger.error("Registration failed: %s", e)
            return False, None, None, f"Registration failed: {str(e)}"

    # ── LOGIN ───────────────────────────────────────────────────────────

    async def login(
        self, email: str, password: str
    ) -> Tuple[bool, Optional[dict], Optional[User], Optional[str]]:
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password):
            return False, None, None, "Invalid email or password"

        if not user.is_active:
            return False, None, None, "Account is deactivated"

        tokens = create_token_pair(data={"sub": str(user.id), "email": user.email})
        return True, tokens, user, None

    # ── PASSWORD RESET ──────────────────────────────────────────────────

    async def request_password_reset(
        self, email: str
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        user = await self.user_repo.get_by_email(email)
        if not user:
            # Return True to prevent email enumeration
            return True, None, None

        reset_token = str(uuid.uuid4())
        await self.redis.set(
            f"reset_token:{reset_token}",
            {"user_id": user.id, "email": email},
            expire=3600,
        )

        reset_link = f"{config.FRONTEND_URL_RESET}/reset-password?token={reset_token}"

        try:
            await email_service.send_password_reset_email(email, reset_link)
        except Exception as e:
            logger.error("Failed to send password reset email: %s", e)

        return True, reset_token, None

    async def reset_password(
        self, token: str, new_password: str
    ) -> Tuple[bool, Optional[str]]:
        token_data = await self.redis.get(f"reset_token:{token}")
        if not token_data:
            return False, "Invalid or expired reset link"

        user_id = token_data.get("user_id")
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            return False, "User not found"

        hashed_password = get_password_hash(new_password)
        updated = await self.user_repo.update_password(user.id, hashed_password)
        if not updated:
            return False, "Failed to update password"

        await self.redis.delete(f"reset_token:{token}")
        return True, None

    # ── EMAIL VERIFICATION ──────────────────────────────────────────────

    async def verify_email(
        self, user_id: int, verification_code: str
    ) -> Tuple[bool, Optional[str]]:
        verification_data = await self.redis.get(f"verification_code:{user_id}")
        if not verification_data:
            return False, "No verification code found. Please request a new one"

        expires_at = datetime.fromisoformat(verification_data["expires_at"]).replace(
            tzinfo=timezone.utc
        )
        if datetime.now(timezone.utc) > expires_at:
            await self.redis.delete(f"verification_code:{user_id}")
            return False, "Verification code has expired. Please request a new one"

        if verification_data["attempts"] >= verification_data["max_attempts"]:
            await self.redis.delete(f"verification_code:{user_id}")
            return False, "Maximum verification attempts exceeded. Please request a new code"

        verification_data["attempts"] += 1

        if verification_data["code"] != verification_code:
            await self.redis.set(
                f"verification_code:{user_id}", verification_data, expire=3600
            )
            remaining = verification_data["max_attempts"] - verification_data["attempts"]
            return False, f"Invalid verification code. {remaining} attempts remaining"

        user = await self.user_repo.verify_user(user_id)
        if not user:
            return False, "User not found"

        await self.redis.delete(f"verification_code:{user_id}")

        await self._send_welcome_email(user.email)

        return True, None

    async def resend_verification_code(
        self, user_id: int
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            return False, None, "User not found"

        if user.is_verified:
            return False, None, "Email already verified"

        existing = await self.redis.get(f"verification_code:{user_id}")
        if existing:
            created_at = datetime.fromisoformat(existing["created_at"])
            elapsed = datetime.now(timezone.utc) - created_at.replace(tzinfo=timezone.utc)
            if elapsed < timedelta(minutes=1):
                return False, None, "Please wait before requesting a new code"

        code = await self._generate_verification_code(user_id, user.email)
        await self._send_verification_email(user_id, user.email, code)
        return True, code, None

    # ── PASSWORD CHANGE ─────────────────────────────────────────────────

    async def change_password(
        self, user_id: int, current_password: str, new_password: str
    ) -> Tuple[bool, Optional[str]]:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            return False, "User not found"

        if not verify_password(current_password, user.password):
            return False, "Current password is incorrect"

        hashed_password = get_password_hash(new_password)
        updated = await self.user_repo.update_password(user_id, hashed_password)
        if not updated:
            return False, "Failed to update password"

        return True, None

    # ── LOGOUT / TOKEN BLACKLIST ────────────────────────────────────────

    async def logout(self, token: str) -> Tuple[bool, Optional[str]]:
        payload = decode_access_token(token)
        if not payload:
            return False, "Invalid token"

        exp = payload.get("exp")
        if not exp:
            return False, "Token has no expiration"

        ttl = int(exp - datetime.now(timezone.utc).timestamp())
        if ttl <= 0:
            return True, None

        await self.redis.set(
            f"blacklist:{token}",
            {"logged_out_at": datetime.now(timezone.utc).isoformat()},
            expire=ttl,
        )
        return True, None

    async def is_token_blacklisted(self, token: str) -> bool:
        result = await self.redis.get(f"blacklist:{token}")
        return result is not None

    # ── HELPERS ─────────────────────────────────────────────────────────

    async def get_current_user(self, user_id: int) -> Optional[User]:
        return await self.user_repo.get_by_id(user_id)

    async def _generate_verification_code(self, user_id: int, email: str) -> str:
        code = self._generate_random_code()
        now = datetime.now(timezone.utc)
        await self.redis.set(
            f"verification_code:{user_id}",
            {
                "code": code,
                "email": email,
                "created_at": now.isoformat(),
                "expires_at": (now + timedelta(minutes=60)).isoformat(),
                "attempts": 0,
                "max_attempts": 5,
            },
            expire=3600,
        )
        return code

    async def _send_verification_email(
        self, user_id: int, email: str, code: str
    ) -> bool:
        try:
            await email_service.send_verification_email(email, code, user_id)
            return True
        except Exception as e:
            logger.error("Failed to send verification email: %s", e)
            return False

    async def _send_welcome_email(self, email: str) -> bool:
        try:
            await email_service.send_welcome_email(email)
            return True
        except Exception as e:
            logger.error("Failed to send welcome email: %s", e)
            return False

    @staticmethod
    def _generate_random_code() -> str:
        return f"{random.randint(1000, 9999)}"
