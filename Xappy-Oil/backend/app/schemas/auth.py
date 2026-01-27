"""
Authentication schemas
"""
from typing import Optional
from pydantic import BaseModel, Field
from .user import UserResponse


class BadgeLoginRequest(BaseModel):
    """Badge + PIN login request"""
    badge_number: str = Field(..., min_length=1, max_length=50)
    pin: str = Field(..., min_length=4, max_length=10)


class OTPSendRequest(BaseModel):
    """OTP send request"""
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")


class OTPSendResponse(BaseModel):
    """OTP send response"""
    message: str
    expires_in: int = 600  # 10 minutes


class OTPVerifyRequest(BaseModel):
    """OTP verification request"""
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")
    otp: str = Field(..., min_length=6, max_length=6)


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    """Token refresh request"""
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    """Token refresh response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
