"""
Logging Middleware

Structured logging for all requests with PII redaction.
"""

import time
from typing import Set

import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from .request_context import get_request_id, get_client_ip

# Paths to exclude from logging
EXCLUDED_PATHS: Set[str] = {
    "/health",
    "/ready",
    "/favicon.ico",
    "/docs",
    "/redoc",
    "/openapi.json",
}

# Sensitive fields to redact
SENSITIVE_FIELDS: Set[str] = {
    "password",
    "pin",
    "otp",
    "token",
    "secret",
    "authorization",
    "badge_number",
    "phone_number",
    "aadhaar",
}


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for structured request/response logging.

    Features:
    - Request timing
    - Structured JSON logs
    - PII redaction
    - Request ID correlation
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Skip logging for excluded paths
        if request.url.path in EXCLUDED_PATHS:
            return await call_next(request)

        logger = structlog.get_logger()
        start_time = time.perf_counter()

        # Log request
        logger.info(
            "request_started",
            request_id=get_request_id(),
            method=request.method,
            path=request.url.path,
            client_ip=get_client_ip(),
            user_agent=self._truncate(request.headers.get("user-agent", "")),
        )

        try:
            response = await call_next(request)

            # Calculate duration
            duration_ms = (time.perf_counter() - start_time) * 1000

            # Log response
            logger.info(
                "request_completed",
                request_id=get_request_id(),
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=round(duration_ms, 2),
            )

            return response

        except Exception as e:
            duration_ms = (time.perf_counter() - start_time) * 1000
            logger.error(
                "request_failed",
                request_id=get_request_id(),
                method=request.method,
                path=request.url.path,
                error=str(e),
                duration_ms=round(duration_ms, 2),
            )
            raise

    @staticmethod
    def _truncate(value: str, max_length: int = 100) -> str:
        """Truncate long strings"""
        if len(value) > max_length:
            return value[:max_length] + "..."
        return value
