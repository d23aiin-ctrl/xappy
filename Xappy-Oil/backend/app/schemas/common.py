"""
Common schemas used across the application
"""
from typing import TypeVar, Generic, List, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper"""
    items: List[T]
    total: int
    skip: int
    limit: int


class MessageResponse(BaseModel):
    """Simple message response"""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str
    error_code: Optional[str] = None
    extra: Optional[dict] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    database: str
    redis: str
