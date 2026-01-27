"""
Request Context Middleware

Adds unique request ID and extracts client information.
"""

import uuid
from contextvars import ContextVar
from typing import Optional

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

# Context variables for request-scoped data
request_id_var: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
client_ip_var: ContextVar[Optional[str]] = ContextVar("client_ip", default=None)


def get_request_id() -> Optional[str]:
    """Get current request ID"""
    return request_id_var.get()


def get_client_ip() -> Optional[str]:
    """Get current client IP"""
    return client_ip_var.get()


class RequestContextMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add request context.

    - Generates unique request ID
    - Extracts client IP (handles X-Forwarded-For)
    - Adds request ID to response headers
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Generate or get request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request_id_var.set(request_id)

        # Extract client IP
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        client_ip_var.set(client_ip)

        # Store in request state for access in endpoints
        request.state.request_id = request_id
        request.state.client_ip = client_ip

        # Process request
        response = await call_next(request)

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        return response
