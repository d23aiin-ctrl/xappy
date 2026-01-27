"""
XAPPY AI User Endpoints

User profile management.
"""

from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.user import User, UserRole, UserStatus
from app.api.v1.deps import get_current_active_user, require_admin

router = APIRouter()


# Schemas
class UserResponse(BaseModel):
    """User response schema"""
    id: str
    badge_number: Optional[str]
    phone_number: str
    email: Optional[str]
    full_name: str
    role: str
    status: str
    site_id: Optional[str]
    department: Optional[str]
    job_title: Optional[str]
    contractor_company: Optional[str]
    shift_pattern: Optional[str]
    preferred_language: str

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    """User update request"""
    full_name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    preferred_language: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class PaginatedResponse(BaseModel):
    """Paginated response"""
    items: List[UserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
):
    """Get current user's profile"""
    return UserResponse(
        id=str(current_user.id),
        badge_number=current_user.badge_number,
        phone_number=current_user.phone_number,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        status=current_user.status.value,
        site_id=str(current_user.site_id) if current_user.site_id else None,
        department=current_user.department,
        job_title=current_user.job_title,
        contractor_company=current_user.contractor_company,
        shift_pattern=current_user.shift_pattern,
        preferred_language=current_user.preferred_language,
    )


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    request: UserUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile"""
    # Update allowed fields
    if request.full_name is not None:
        current_user.full_name = request.full_name
    if request.email is not None:
        current_user.email = request.email
    if request.department is not None:
        current_user.department = request.department
    if request.job_title is not None:
        current_user.job_title = request.job_title
    if request.preferred_language is not None:
        current_user.preferred_language = request.preferred_language
    if request.emergency_contact_name is not None:
        current_user.emergency_contact_name = request.emergency_contact_name
    if request.emergency_contact_phone is not None:
        current_user.emergency_contact_phone = request.emergency_contact_phone

    await db.commit()
    await db.refresh(current_user)

    return UserResponse(
        id=str(current_user.id),
        badge_number=current_user.badge_number,
        phone_number=current_user.phone_number,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        status=current_user.status.value,
        site_id=str(current_user.site_id) if current_user.site_id else None,
        department=current_user.department,
        job_title=current_user.job_title,
        contractor_company=current_user.contractor_company,
        shift_pattern=current_user.shift_pattern,
        preferred_language=current_user.preferred_language,
    )


@router.get("", response_model=PaginatedResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    status: Optional[str] = None,
    site_id: Optional[UUID] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)"""
    query = select(User)

    # Apply filters
    if role:
        query = query.where(User.role == UserRole(role))
    if status:
        query = query.where(User.status == UserStatus(status))
    if site_id:
        query = query.where(User.site_id == site_id)
    if search:
        query = query.where(
            (User.full_name.ilike(f"%{search}%")) |
            (User.badge_number.ilike(f"%{search}%")) |
            (User.phone_number.ilike(f"%{search}%"))
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(User.created_at.desc())

    result = await db.execute(query)
    users = result.scalars().all()

    return PaginatedResponse(
        items=[
            UserResponse(
                id=str(u.id),
                badge_number=u.badge_number,
                phone_number=u.phone_number,
                email=u.email,
                full_name=u.full_name,
                role=u.role.value,
                status=u.status.value,
                site_id=str(u.site_id) if u.site_id else None,
                department=u.department,
                job_title=u.job_title,
                contractor_company=u.contractor_company,
                shift_pattern=u.shift_pattern,
                preferred_language=u.preferred_language,
            )
            for u in users
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get user by ID (admin only)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse(
        id=str(user.id),
        badge_number=user.badge_number,
        phone_number=user.phone_number,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        status=user.status.value,
        site_id=str(user.site_id) if user.site_id else None,
        department=user.department,
        job_title=user.job_title,
        contractor_company=user.contractor_company,
        shift_pattern=user.shift_pattern,
        preferred_language=user.preferred_language,
    )
