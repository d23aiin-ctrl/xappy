"""
XAPPY AI Authentication Endpoints

Badge/PIN and OTP-based authentication.
"""

from datetime import datetime, timezone
import hmac
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.redis import get_redis
from app.models.user import User, UserStatus
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_otp,
    hash_otp,
)
from app.core.config import settings

router = APIRouter()


# Request/Response schemas
class BadgeLoginRequest(BaseModel):
    """Badge + PIN login request"""
    badge_number: str = Field(..., min_length=1, max_length=50)
    pin: str = Field(..., min_length=4, max_length=10)


class OTPSendRequest(BaseModel):
    """OTP send request"""
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")


class OTPVerifyRequest(BaseModel):
    """OTP verify request"""
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")
    otp: str = Field(..., min_length=4, max_length=10)


class TokenRefreshRequest(BaseModel):
    """Token refresh request"""
    refresh_token: str


class TokenResponse(BaseModel):
    """Token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Optional[dict] = None


class MessageResponse(BaseModel):
    """Simple message response"""
    success: bool
    message: str


@router.post("/badge-login", response_model=TokenResponse)
async def badge_login(
    request: BadgeLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Login with badge number and PIN.

    Primary authentication method for field workers.
    """
    # Find user by badge number
    result = await db.execute(
        select(User).where(User.badge_number == request.badge_number)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid badge number or PIN",
        )

    # Verify PIN
    if not user.pin_hash or not verify_password(request.pin, user.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid badge number or PIN",
        )

    # Check user status
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active",
        )

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    # Generate tokens
    access_token = create_access_token(
        subject=str(user.id),
        role=user.role.value,
    )
    refresh_token = create_refresh_token(
        subject=str(user.id),
        role=user.role.value,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=30 * 60,  # 30 minutes
        user={
            "id": str(user.id),
            "badge_number": user.badge_number,
            "full_name": user.full_name,
            "role": user.role.value,
        },
    )


@router.post("/otp/send", response_model=MessageResponse)
async def send_otp(
    request: OTPSendRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Send OTP to phone number.

    Creates user if not exists.
    """
    # Normalize phone number
    phone = request.phone_number
    if not phone.startswith("+"):
        phone = "+91" + phone  # Default to India

    # Find or create user
    result = await db.execute(
        select(User).where(User.phone_number == phone)
    )
    user = result.scalar_one_or_none()

    # Generate OTP
    if settings.is_development and settings.DEMO_OTP_ENABLED:
        otp = settings.DEMO_OTP_CODE
    else:
        otp = generate_otp()

    # Store OTP in Redis with expiry and attempt counter
    if not (settings.is_development and settings.DEMO_OTP_ENABLED):
        try:
            redis = get_redis()
            otp_hash = hash_otp(otp, phone)
            ttl_seconds = settings.OTP_EXPIRY_MINUTES * 60
            await redis.set(f"otp:{phone}", otp_hash, ex=ttl_seconds)
            await redis.set(f"otp_attempts:{phone}", 0, ex=ttl_seconds)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="OTP service unavailable",
            ) from e

    # TODO: Send OTP via SMS service

    # Log send event without sensitive data
    import structlog
    logger = structlog.get_logger()
    masked_phone = f"{phone[:-2]}**" if len(phone) > 2 else "**"
    logger.info("OTP generated", phone=masked_phone)

    demo_suffix = ""
    if settings.is_development and settings.DEMO_OTP_ENABLED:
        demo_suffix = f" (demo code: {otp})"
    return MessageResponse(
        success=True,
        message=f"OTP sent to {phone}{demo_suffix}",
    )


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(
    request: OTPVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Verify OTP and return tokens.
    """
    # Normalize phone number
    phone = request.phone_number
    if not phone.startswith("+"):
        phone = "+91" + phone

    if len(request.otp) != settings.OTP_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP",
        )
    if settings.is_development and settings.DEMO_OTP_ENABLED:
        if request.otp != settings.DEMO_OTP_CODE:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP",
            )
    else:
        try:
            redis = get_redis()
            otp_key = f"otp:{phone}"
            attempts_key = f"otp_attempts:{phone}"
            stored_hash = await redis.get(otp_key)
            if not stored_hash:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired OTP",
                )

            attempts = int(await redis.get(attempts_key) or 0)
            if attempts >= settings.OTP_MAX_ATTEMPTS:
                await redis.delete(otp_key, attempts_key)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="OTP attempts exceeded",
                )

            provided_hash = hash_otp(request.otp, phone)
            if not hmac.compare_digest(stored_hash, provided_hash):
                await redis.incr(attempts_key)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired OTP",
                )
            await redis.delete(otp_key, attempts_key)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="OTP service unavailable",
            ) from e

    # Find or create user
    result = await db.execute(
        select(User).where(User.phone_number == phone)
    )
    user = result.scalar_one_or_none()

    if not user:
        # Create new user
        user = User(
            phone_number=phone,
            full_name="New User",
            phone_verified=True,
            status=UserStatus.ACTIVE,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    user.phone_verified = True
    await db.commit()

    # Generate tokens
    access_token = create_access_token(
        subject=str(user.id),
        role=user.role.value,
    )
    refresh_token = create_refresh_token(
        subject=str(user.id),
        role=user.role.value,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=30 * 60,
        user={
            "id": str(user.id),
            "phone_number": user.phone_number,
            "full_name": user.full_name,
            "role": user.role.value,
        },
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: TokenRefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Refresh access token using refresh token.
    """
    # Verify refresh token
    payload = verify_token(request.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = payload.get("sub")
    role = payload.get("role")

    # Verify user still exists and is active
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Generate new tokens
    access_token = create_access_token(
        subject=str(user.id),
        role=user.role.value,
    )
    new_refresh_token = create_refresh_token(
        subject=str(user.id),
        role=user.role.value,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=30 * 60,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout():
    """
    Logout user.

    TODO: Add token to blacklist in Redis.
    """
    return MessageResponse(
        success=True,
        message="Logged out successfully",
    )
