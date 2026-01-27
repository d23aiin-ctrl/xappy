"""
User schemas
"""
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    """Base user schema"""
    badge_number: str = Field(..., min_length=1, max_length=50)
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: str = Field(..., min_length=1, max_length=200)
    role: UserRole = UserRole.WORKER
    department: Optional[str] = None
    shift_pattern: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema"""
    pin: str = Field(..., min_length=4, max_length=10)
    site_id: Optional[UUID] = None


class UserUpdate(BaseModel):
    """User update schema"""
    full_name: Optional[str] = Field(None, min_length=1, max_length=200)
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    shift_pattern: Optional[str] = None


class UserResponse(BaseModel):
    """User response schema"""
    id: UUID
    badge_number: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    full_name: str
    role: UserRole
    status: UserStatus
    site_id: Optional[UUID] = None
    department: Optional[str] = None
    shift_pattern: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """User list response"""
    items: List[UserResponse]
    total: int
    skip: int
    limit: int
