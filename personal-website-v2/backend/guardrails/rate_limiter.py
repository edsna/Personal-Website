"""Rate limiting for chatbot API"""

import redis.asyncio as redis
from datetime import datetime, timedelta
from typing import Tuple, Dict
import structlog
import os

logger = structlog.get_logger()

# Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
MAX_TOKENS_PER_DAY = int(os.getenv("MAX_TOKENS_PER_DAY", "50"))
MAX_REQUESTS_PER_MINUTE = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "3"))
MAX_MESSAGES_PER_DAY = int(os.getenv("MAX_MESSAGES_PER_DAY", "10"))


def get_client_ip(request) -> str:
    """Extract client IP from request"""
    # Check for X-Forwarded-For header (behind proxy/load balancer)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    # Check for X-Real-IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fallback to direct client IP
    return request.client.host


class RateLimiter:
    """Redis-based rate limiter for chatbot"""

    def __init__(self):
        self.redis_client = None
        self._initialized = False

    async def _get_redis(self) -> redis.Redis:
        """Get or create Redis connection"""
        if not self.redis_client:
            try:
                self.redis_client = await redis.from_url(
                    REDIS_URL,
                    encoding="utf-8",
                    decode_responses=True,
                )
                self._initialized = True
                logger.info("redis_connected", url=REDIS_URL)
            except Exception as e:
                logger.error("redis_connection_failed", error=str(e))
                # Fallback to in-memory dict for development
                self.redis_client = {}
                self._initialized = False

        return self.redis_client

    async def check_rate_limit(self, ip_address: str) -> Tuple[bool, int, str]:
        """
        Check if request is within rate limits

        Returns:
            (is_allowed, tokens_remaining, reason)
        """
        try:
            redis_client = await self._get_redis()

            # Keys for different rate limits
            tokens_key = f"tokens:{ip_address}:{datetime.now().date()}"
            requests_minute_key = f"requests_minute:{ip_address}:{datetime.now().strftime('%Y-%m-%d-%H-%M')}"
            messages_day_key = f"messages:{ip_address}:{datetime.now().date()}"

            # Check tokens per day
            tokens_used = int(await redis_client.get(tokens_key) or 0)
            tokens_remaining = MAX_TOKENS_PER_DAY - tokens_used

            if tokens_used >= MAX_TOKENS_PER_DAY:
                return False, 0, "Daily token limit exceeded"

            # Check requests per minute
            requests_this_minute = int(await redis_client.get(requests_minute_key) or 0)

            if requests_this_minute >= MAX_REQUESTS_PER_MINUTE:
                return False, tokens_remaining, "Too many requests per minute"

            # Check messages per day
            messages_today = int(await redis_client.get(messages_day_key) or 0)

            if messages_today >= MAX_MESSAGES_PER_DAY:
                return False, tokens_remaining, "Daily message limit exceeded"

            # Increment request counter
            await redis_client.incr(requests_minute_key)
            await redis_client.expire(requests_minute_key, 60)

            # Increment message counter
            await redis_client.incr(messages_day_key)
            await redis_client.expire(messages_day_key, 86400)  # 24 hours

            return True, tokens_remaining, "OK"

        except Exception as e:
            logger.error("rate_limit_check_failed", error=str(e))
            # Fail open in case of Redis errors
            return True, MAX_TOKENS_PER_DAY, "OK"

    async def record_usage(self, ip_address: str, tokens_used: int):
        """Record token usage for an IP address"""
        try:
            redis_client = await self._get_redis()

            tokens_key = f"tokens:{ip_address}:{datetime.now().date()}"

            # Increment token count
            await redis_client.incrby(tokens_key, tokens_used)
            await redis_client.expire(tokens_key, 86400)  # 24 hours

            logger.info(
                "usage_recorded",
                ip=ip_address,
                tokens=tokens_used,
            )

        except Exception as e:
            logger.error("record_usage_failed", error=str(e))

    async def get_usage(self, ip_address: str) -> Dict:
        """Get current usage statistics for an IP"""
        try:
            redis_client = await self._get_redis()

            tokens_key = f"tokens:{ip_address}:{datetime.now().date()}"
            messages_day_key = f"messages:{ip_address}:{datetime.now().date()}"
            requests_minute_key = f"requests_minute:{ip_address}:{datetime.now().strftime('%Y-%m-%d-%H-%M')}"

            tokens_used = int(await redis_client.get(tokens_key) or 0)
            messages_today = int(await redis_client.get(messages_day_key) or 0)
            requests_this_minute = int(await redis_client.get(requests_minute_key) or 0)

            return {
                "tokens_used": tokens_used,
                "tokens_remaining": MAX_TOKENS_PER_DAY - tokens_used,
                "requests_today": messages_today,
                "requests_this_minute": requests_this_minute,
                "is_rate_limited": (
                    tokens_used >= MAX_TOKENS_PER_DAY
                    or messages_today >= MAX_MESSAGES_PER_DAY
                    or requests_this_minute >= MAX_REQUESTS_PER_MINUTE
                ),
            }

        except Exception as e:
            logger.error("get_usage_failed", error=str(e))
            return {
                "tokens_used": 0,
                "tokens_remaining": MAX_TOKENS_PER_DAY,
                "requests_today": 0,
                "requests_this_minute": 0,
                "is_rate_limited": False,
            }

    async def reset_usage(self, ip_address: str):
        """Reset usage for an IP (for testing)"""
        try:
            redis_client = await self._get_redis()

            tokens_key = f"tokens:{ip_address}:{datetime.now().date()}"
            messages_day_key = f"messages:{ip_address}:{datetime.now().date()}"
            requests_minute_key = f"requests_minute:{ip_address}:{datetime.now().strftime('%Y-%m-%d-%H-%M')}"

            await redis_client.delete(tokens_key)
            await redis_client.delete(messages_day_key)
            await redis_client.delete(requests_minute_key)

            logger.info("usage_reset", ip=ip_address)

        except Exception as e:
            logger.error("reset_usage_failed", error=str(e))
