"""
XAPPY Property API Endpoints

CRUD operations for rental properties.
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.property import Property, PropertyType, PropertyStatus, FurnishingType
from app.api.v1.deps import (
    get_current_active_user,
    require_property_manager,
    require_landlord,
)

router = APIRouter()


# Pydantic schemas
class PropertyBase(BaseModel):
    property_type: PropertyType
    address_line_1: str = Field(..., max_length=255)
    address_line_2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., max_length=100)
    county: Optional[str] = Field(None, max_length=100)
    postcode: str = Field(..., max_length=20)
    country: str = Field(default="United Kingdom", max_length=100)
    bedrooms: int = Field(default=1, ge=0)
    bathrooms: int = Field(default=1, ge=0)
    reception_rooms: int = Field(default=1, ge=0)
    floor_area_sqft: Optional[int] = Field(None, ge=0)
    furnishing: FurnishingType = FurnishingType.UNFURNISHED
    has_parking: bool = False
    has_garden: bool = False
    has_balcony: bool = False
    pets_allowed: bool = False
    smoking_allowed: bool = False
    is_hmo: bool = False
    rent_amount: Decimal = Field(..., gt=0)
    deposit_weeks: int = Field(default=5, ge=1, le=5)
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    minimum_tenancy_months: int = Field(default=6, ge=1)
    maximum_tenancy_months: Optional[int] = Field(None, ge=1)


class PropertyCreate(PropertyBase):
    landlord_id: Optional[UUID] = None  # If not provided, use current user


class PropertyUpdate(BaseModel):
    property_type: Optional[PropertyType] = None
    status: Optional[PropertyStatus] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    county: Optional[str] = None
    postcode: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    reception_rooms: Optional[int] = None
    floor_area_sqft: Optional[int] = None
    furnishing: Optional[FurnishingType] = None
    has_parking: Optional[bool] = None
    has_garden: Optional[bool] = None
    has_balcony: Optional[bool] = None
    pets_allowed: Optional[bool] = None
    smoking_allowed: Optional[bool] = None
    rent_amount: Optional[Decimal] = None
    deposit_weeks: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    available_from: Optional[datetime] = None
    epc_rating: Optional[str] = None
    photos: Optional[List[dict]] = None
    property_manager_id: Optional[UUID] = None


class PropertyResponse(PropertyBase):
    id: UUID
    reference: str
    status: PropertyStatus
    landlord_id: UUID
    property_manager_id: Optional[UUID]
    available_from: Optional[datetime]
    epc_rating: Optional[str]
    photos: Optional[List[dict]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PropertyListResponse(BaseModel):
    items: List[PropertyResponse]
    total: int
    skip: int
    limit: int


async def generate_property_reference(db: AsyncSession) -> str:
    """Generate unique property reference"""
    result = await db.execute(
        select(func.count(Property.id))
    )
    count = result.scalar() or 0
    return f"XP-PROP-{count + 1:05d}"


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    data: PropertyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """
    Create a new property.

    - Landlords can create properties for themselves
    - Property managers can create properties for any landlord
    """
    # Determine landlord
    if data.landlord_id:
        if current_user.role not in [UserRole.PROPERTY_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only property managers can create properties for other landlords"
            )
        landlord_id = data.landlord_id
    else:
        landlord_id = current_user.id

    # Generate reference
    reference = await generate_property_reference(db)

    # Calculate deposit and holding deposit
    weekly_rent = (data.rent_amount * 12) / 52
    deposit_amount = weekly_rent * data.deposit_weeks
    holding_deposit = weekly_rent  # Max 1 week

    property_data = data.model_dump(exclude={"landlord_id"})
    property_obj = Property(
        **property_data,
        reference=reference,
        landlord_id=landlord_id,
        property_manager_id=current_user.id if current_user.role == UserRole.PROPERTY_MANAGER else None,
        deposit_amount=deposit_amount,
        holding_deposit_amount=holding_deposit,
        status=PropertyStatus.AVAILABLE,
    )

    db.add(property_obj)
    await db.commit()
    await db.refresh(property_obj)

    return property_obj


@router.get("", response_model=PropertyListResponse)
async def list_properties(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[PropertyStatus] = None,
    property_type: Optional[PropertyType] = None,
    city: Optional[str] = None,
    postcode: Optional[str] = None,
    min_bedrooms: Optional[int] = None,
    max_rent: Optional[Decimal] = None,
    landlord_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """
    List properties with filtering.

    - Landlords see only their own properties
    - Property managers see all assigned properties
    - Admins see all properties
    """
    query = select(Property)

    # Role-based filtering
    if current_user.role == UserRole.LANDLORD:
        query = query.where(Property.landlord_id == current_user.id)
    elif current_user.role == UserRole.PROPERTY_MANAGER:
        query = query.where(
            or_(
                Property.property_manager_id == current_user.id,
                Property.landlord_id == current_user.id
            )
        )
    elif landlord_id:
        query = query.where(Property.landlord_id == landlord_id)

    # Apply filters
    if status:
        query = query.where(Property.status == status)
    if property_type:
        query = query.where(Property.property_type == property_type)
    if city:
        query = query.where(Property.city.ilike(f"%{city}%"))
    if postcode:
        query = query.where(Property.postcode.ilike(f"{postcode}%"))
    if min_bedrooms:
        query = query.where(Property.bedrooms >= min_bedrooms)
    if max_rent:
        query = query.where(Property.rent_amount <= max_rent)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination
    query = query.order_by(Property.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    properties = result.scalars().all()

    return PropertyListResponse(
        items=properties,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Get a specific property by ID."""
    result = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    property_obj = result.scalar_one_or_none()

    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )

    # Check access
    if current_user.role == UserRole.LANDLORD and property_obj.landlord_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this property"
        )

    return property_obj


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: UUID,
    data: PropertyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Update a property."""
    result = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    property_obj = result.scalar_one_or_none()

    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )

    # Check access
    if current_user.role == UserRole.LANDLORD and property_obj.landlord_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this property"
        )

    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property_obj, field, value)

    # Recalculate deposit if rent or weeks changed
    if "rent_amount" in update_data or "deposit_weeks" in update_data:
        weekly_rent = (property_obj.rent_amount * 12) / 52
        property_obj.deposit_amount = weekly_rent * property_obj.deposit_weeks
        property_obj.holding_deposit_amount = weekly_rent

    await db.commit()
    await db.refresh(property_obj)

    return property_obj


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """
    Delete a property.

    Only property managers and admins can delete properties.
    Properties with active tenancies cannot be deleted.
    """
    result = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    property_obj = result.scalar_one_or_none()

    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )

    # Check for active tenancies
    if property_obj.tenancies:
        active_tenancies = [t for t in property_obj.tenancies if t.status in ["active", "periodic"]]
        if active_tenancies:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete property with active tenancies"
            )

    await db.delete(property_obj)
    await db.commit()


@router.post("/{property_id}/photos", response_model=PropertyResponse)
async def add_property_photos(
    property_id: UUID,
    photos: List[dict],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Add photos to a property."""
    result = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    property_obj = result.scalar_one_or_none()

    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )

    # Check access
    if current_user.role == UserRole.LANDLORD and property_obj.landlord_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this property"
        )

    # Append photos
    existing_photos = property_obj.photos or []
    property_obj.photos = existing_photos + photos

    await db.commit()
    await db.refresh(property_obj)

    return property_obj
