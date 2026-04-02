import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import config

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def _create_token(data: Dict[str, Any], expires_delta: timedelta, token_type: str) -> str:
    to_encode = data.copy()
    to_encode.update({
        "exp": datetime.now(timezone.utc) + expires_delta,
        "type": token_type,
        "jti": str(uuid.uuid4()),
    })
    return jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    delta = expires_delta or timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _create_token(data, delta, token_type="access")


def create_refresh_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    delta = expires_delta or timedelta(days=config.REFRESH_TOKEN_EXPIRE_DAYS)
    return _create_token(data, delta, token_type="refresh")


def create_token_pair(data: Dict[str, Any]) -> Dict[str, str]:
    return {
        "access_token": create_access_token(data),
        "refresh_token": create_refresh_token(data),
    }


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_access_token(token: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
    payload = decode_access_token(token)
    if payload is None or payload.get("type") != "access":
        return False, None
    return True, payload


def verify_refresh_token(token: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
    payload = decode_access_token(token)
    if payload is None or payload.get("type") != "refresh":
        return False, None
    return True, payload
