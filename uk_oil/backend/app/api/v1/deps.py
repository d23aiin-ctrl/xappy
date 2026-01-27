"""
XAPPY AI API Dependencies

Dependency injection for authentication, database, etc.
"""

from typing import Optional, List

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import verify_token
from app.db.session import get_db
from app.models.user import User, UserRole, UserStatus

# Security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Get current authenticated user from JWT token.
    """
    token = credentials.credentials

    # Verify token
    payload = verify_token(token, token_type="access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Get user from database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current user and verify they are active.
    """
    if current_user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active",
        )
    return current_user


def require_role(allowed_roles: List[UserRole]):
    """
    Dependency factory to require specific roles.

    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(
            user: User = Depends(require_role([UserRole.ADMIN]))
        ):
            ...
    """

    async def role_checker(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker


# Pre-configured role dependencies
require_supervisor = require_role([
    UserRole.SUPERVISOR,
    UserRole.SITE_MANAGER,
    UserRole.HSE_MANAGER,
    UserRole.HSE_OFFICER,
    UserRole.COMPLIANCE_OFFICER,
    UserRole.OPERATIONS_DIRECTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
])

require_hse = require_role([
    UserRole.HSE_MANAGER,
    UserRole.HSE_OFFICER,
    UserRole.COMPLIANCE_OFFICER,
    UserRole.OPERATIONS_DIRECTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
])

require_admin = require_role([
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
])
