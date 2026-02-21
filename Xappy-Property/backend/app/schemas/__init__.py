"""
Pydantic schemas for XAPPY AI API
"""
from .auth import (
    BadgeLoginRequest,
    OTPSendRequest,
    OTPVerifyRequest,
    TokenResponse,
    RefreshTokenRequest,
)
from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
)
from .site import (
    SiteBase,
    SiteCreate,
    SiteResponse,
    AreaBase,
    AreaCreate,
    AreaResponse,
)
from .report import (
    ReportBase,
    ReportCreate,
    ReportUpdate,
    ReportResponse,
    ReportListResponse,
    ReportAcknowledge,
    ReportClose,
)
from .near_miss import (
    NearMissCreate,
    NearMissDetailsResponse,
    NearMissReportResponse,
)
from .common import (
    PaginatedResponse,
    MessageResponse,
    ErrorResponse,
)

__all__ = [
    # Auth
    "BadgeLoginRequest",
    "OTPSendRequest",
    "OTPVerifyRequest",
    "TokenResponse",
    "RefreshTokenRequest",
    # User
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserListResponse",
    # Site
    "SiteBase",
    "SiteCreate",
    "SiteResponse",
    "AreaBase",
    "AreaCreate",
    "AreaResponse",
    # Report
    "ReportBase",
    "ReportCreate",
    "ReportUpdate",
    "ReportResponse",
    "ReportListResponse",
    "ReportAcknowledge",
    "ReportClose",
    # Near-Miss
    "NearMissCreate",
    "NearMissDetailsResponse",
    "NearMissReportResponse",
    # Common
    "PaginatedResponse",
    "MessageResponse",
    "ErrorResponse",
]
