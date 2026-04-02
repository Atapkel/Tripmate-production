import json
import logging
from typing import Any, Optional

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.config import config

logger = logging.getLogger(__name__)


class RedisClient:
    def __init__(self, redis_url: str = config.REDIS_URL):
        self._redis_url = redis_url
        self._client: Optional[Redis] = None

    @property
    def client(self) -> Redis:
        if self._client is None:
            raise RuntimeError("Redis not connected. Call connect() first.")
        return self._client

    async def connect(self) -> None:
        if self._client is None:
            self._client = Redis.from_url(
                self._redis_url, encoding="utf-8", decode_responses=True
            )

    async def disconnect(self) -> None:
        if self._client:
            await self._client.close()
            self._client = None

    async def get(self, key: str) -> Optional[Any]:
        try:
            value = await self.client.get(key)
            return json.loads(value) if value else None
        except (RedisError, json.JSONDecodeError) as e:
            logger.error("Redis GET error for key %s: %s", key, e)
            return None

    async def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        try:
            serialized = json.dumps(value)
            await self.client.set(key, serialized, ex=expire)
            return True
        except (RedisError, TypeError) as e:
            logger.error("Redis SET error for key %s: %s", key, e)
            return False

    async def delete(self, key: str) -> bool:
        try:
            await self.client.delete(key)
            return True
        except RedisError as e:
            logger.error("Redis DELETE error for key %s: %s", key, e)
            return False

    async def exists(self, key: str) -> bool:
        try:
            return await self.client.exists(key) > 0
        except RedisError as e:
            logger.error("Redis EXISTS error for key %s: %s", key, e)
            return False

    async def incr(self, key: str) -> Optional[int]:
        try:
            return await self.client.incr(key)
        except RedisError as e:
            logger.error("Redis INCR error for key %s: %s", key, e)
            return None

    async def expire(self, key: str, seconds: int) -> bool:
        try:
            await self.client.expire(key, seconds)
            return True
        except RedisError as e:
            logger.error("Redis EXPIRE error for key %s: %s", key, e)
            return False


_redis_client: Optional[RedisClient] = None


def get_redis_client() -> RedisClient:
    if _redis_client is None:
        raise RuntimeError("Redis client not initialized. Call init_redis() first.")
    return _redis_client


def init_redis(redis_url: str = config.REDIS_URL) -> RedisClient:
    global _redis_client
    _redis_client = RedisClient(redis_url)
    return _redis_client
