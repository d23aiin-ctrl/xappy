"""
XAPPY AI Security Utilities

JWT token handling, password hashing, and OTP generation.
"""

import secrets
import string
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.hash import bcrypt

from .config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    if not hashed_password:
        return False
    if hashed_password.startswith("$2"):
        return bcrypt.verify(plain_password, hashed_password)
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    try:
        return bcrypt.hash(password)
    except Exception:
        # Fallback for environments missing bcrypt backend.
        return hashlib.sha256(password.encode()).hexdigest()


def create_access_token(
    subject: str,
    role: str,
    additional_claims: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT access token"""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access",
        "role": role,
        "iat": datetime.now(timezone.utc),
    }

    if additional_claims:
        to_encode.update(additional_claims)

    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    subject: str,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT refresh token"""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh",
        "role": role,
        "iat": datetime.now(timezone.utc),
    }

    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
    """
    Verify a JWT token and return its payload.

    Args:
        token: The JWT token to verify
        token_type: Expected token type ("access" or "refresh")

    Returns:
        Token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )

        # Verify token type
        if payload.get("type") != token_type:
            return None

        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(
            timezone.utc
        ):
            return None

        return payload

    except JWTError:
        return None


def generate_otp(length: Optional[int] = None) -> str:
    """Generate a numeric OTP"""
    otp_length = length or settings.OTP_LENGTH
    return "".join(secrets.choice(string.digits) for _ in range(otp_length))


def hash_otp(otp: str, phone_number: str) -> str:
    """Hash OTP with a per-recipient salt for storage."""
    key = settings.SECRET_KEY.encode()
    msg = f"{phone_number}:{otp}".encode()
    return hmac.new(key, msg, hashlib.sha256).hexdigest()


def generate_secure_token(length: int = 32) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)


def generate_pin(length: int = 4) -> str:
    """Generate a numeric PIN for badge login"""
    return "".join(secrets.choice(string.digits) for _ in range(length))
