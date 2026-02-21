"""
Error Handler Middleware

Custom exception classes and handlers for XAPPY AI.
"""

from typing import Optional

import structlog
from fastapi import Request
from fastapi.responses import JSONResponse

from .request_context import get_request_id


class XappyException(Exception):
    """Base exception for XAPPY AI"""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: Optional[str] = None,
        details: Optional[dict] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or "INTERNAL_ERROR"
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(XappyException):
    """Validation error"""

    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
            details=details,
        )


class AuthenticationError(XappyException):
    """Authentication error"""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR",
        )


class AuthorizationError(XappyException):
    """Authorization error"""

    def __init__(self, message: str = "Access denied"):
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR",
        )


class NotFoundError(XappyException):
    """Resource not found error"""

    def __init__(self, resource: str = "Resource", identifier: Optional[str] = None):
        message = f"{resource} not found"
        if identifier:
            message = f"{resource} with ID '{identifier}' not found"
        super().__init__(
            message=message,
            status_code=404,
            error_code="NOT_FOUND",
        )


class RateLimitError(XappyException):
    """Rate limit exceeded error"""

    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(
            message=message,
            status_code=429,
            error_code="RATE_LIMIT_EXCEEDED",
        )


class ServiceUnavailableError(XappyException):
    """External service unavailable"""

    def __init__(self, service: str = "External service"):
        super().__init__(
            message=f"{service} is temporarily unavailable",
            status_code=503,
            error_code="SERVICE_UNAVAILABLE",
        )


async def http_exception_handler(request: Request, exc: XappyException) -> JSONResponse:
    """Handle XappyException and return structured response"""
    logger = structlog.get_logger()

    # Log the error
    logger.warning(
        "handled_exception",
        request_id=get_request_id(),
        error_code=exc.error_code,
        message=exc.message,
        status_code=exc.status_code,
        path=request.url.path,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details,
            },
            "request_id": get_request_id(),
        },
    )
