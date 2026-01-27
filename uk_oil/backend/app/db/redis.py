"""
XAPPY AI Redis Client

Async Redis client for OTPs and short-lived caches.
"""

from typing import Optional

import redis.asyncio as redis

from app.core.config import settings

_redis: Optional[redis.Redis] = None


def get_redis() -> redis.Redis:
    """Get or initialize the Redis client."""
    global _redis
    if _redis is None:
        _redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


async def close_redis() -> None:
    """Close the Redis client."""
    global _redis
    if _redis is not None:
        await _redis.close()
        _redis = None
