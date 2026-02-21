"""
XAPPY Supplier API Endpoints

Supplier management and skill-based matching.
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from pydantic import BaseModel, Field, EmailStr

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.supplier import Supplier, SupplierStatus, SupplierType
from app.models.maintenance import IssueCategory
from app.api.v1.deps import (
    get_current_active_user,
    require_property_manager,
    require_supplier,
)

router = APIRouter()


# Pydantic schemas
class SupplierCreate(BaseModel):
    supplier_type: SupplierType = SupplierType.INDIVIDUAL
    business_name: str = Field(..., max_length=255)
    trading_name: Optional[str] = None
    contact_name: str = Field(..., max_length=255)
    email: EmailStr
    phone_number: str = Field(..., max_length=20)
    address_line_1: str = Field(..., max_length=255)
    address_line_2: Optional[str] = None
    city: str = Field(..., max_length=100)
    county: Optional[str] = None
    postcode: str = Field(..., max_length=20)
    service_radius_miles: int = Field(default=25, ge=1, le=100)
    skills: List[str] = []
    primary_trade: str
    hourly_rate: Optional[Decimal] = None
    call_out_fee: Optional[Decimal] = None
    accepts_emergency: bool = False


class SupplierUpdate(BaseModel):
    business_name: Optional[str] = None
    trading_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    service_radius_miles: Optional[int] = None
    skills: Optional[List[str]] = None
    hourly_rate: Optional[Decimal] = None
    call_out_fee: Optional[Decimal] = None
    accepts_emergency: Optional[bool] = None
    emergency_available: Optional[bool] = None
    availability: Optional[dict] = None
    status: Optional[SupplierStatus] = None


class SupplierVerifyRequest(BaseModel):
    public_liability_insurance: bool = False
    public_liability_amount: Optional[Decimal] = None
    public_liability_expiry: Optional[datetime] = None
    gas_safe_registered: bool = False
    gas_safe_number: Optional[str] = None
    gas_safe_expiry: Optional[datetime] = None
    niceic_registered: bool = False
    niceic_number: Optional[str] = None


class SupplierMatchRequest(BaseModel):
    category: IssueCategory
    postcode: str
    is_emergency: bool = False
    required_skills: Optional[List[str]] = None


class SupplierResponse(BaseModel):
    id: UUID
    reference: str
    user_id: Optional[UUID]
    supplier_type: SupplierType
    status: SupplierStatus
    business_name: str
    trading_name: Optional[str]
    contact_name: str
    email: str
    phone_number: str
    city: str
    postcode: str
    service_radius_miles: int
    skills: List[str]
    primary_trade: str
    hourly_rate: Optional[Decimal]
    call_out_fee: Optional[Decimal]
    accepts_emergency: bool
    emergency_available: bool
    verified: bool
    gas_safe_registered: bool
    niceic_registered: bool
    total_jobs_completed: int
    average_rating: Optional[Decimal]
    created_at: datetime

    class Config:
        from_attributes = True


class SupplierMatchResponse(BaseModel):
    suppliers: List[SupplierResponse]
    match_criteria: dict


async def generate_supplier_reference(db: AsyncSession) -> str:
    """Generate unique supplier reference"""
    result = await db.execute(select(func.count(Supplier.id)))
    count = result.scalar() or 0
    return f"XP-SUP-{count + 1:05d}"


# Map issue categories to trades/skills
CATEGORY_TO_SKILLS = {
    IssueCategory.PLUMBING: ["plumbing", "plumber"],
    IssueCategory.ELECTRICAL: ["electrical", "electrician"],
    IssueCategory.HEATING: ["heating", "boiler", "gas", "hvac"],
    IssueCategory.APPLIANCES: ["appliances", "electrical", "general"],
    IssueCategory.STRUCTURAL: ["building", "structural", "construction"],
    IssueCategory.WINDOWS_DOORS: ["glazing", "carpentry", "joinery"],
    IssueCategory.ROOFING: ["roofing", "roofer"],
    IssueCategory.DAMP_MOULD: ["damp", "mould", "ventilation"],
    IssueCategory.PEST_CONTROL: ["pest_control", "pest"],
    IssueCategory.GARDEN_EXTERIOR: ["gardening", "landscaping", "exterior"],
    IssueCategory.SECURITY: ["security", "locksmith", "alarm"],
    IssueCategory.FIRE_SAFETY: ["fire_safety", "electrical"],
    IssueCategory.GAS: ["gas", "gas_safe", "heating"],
    IssueCategory.CLEANING: ["cleaning", "cleaner"],
    IssueCategory.GENERAL: ["handyman", "general", "maintenance"],
}


@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    data: SupplierCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """Create a new supplier."""
    # Check for existing email
    existing = await db.execute(
        select(Supplier).where(Supplier.email == data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supplier with this email already exists"
        )

    reference = await generate_supplier_reference(db)

    supplier = Supplier(
        reference=reference,
        supplier_type=data.supplier_type,
        status=SupplierStatus.PENDING_APPROVAL,
        business_name=data.business_name,
        trading_name=data.trading_name,
        contact_name=data.contact_name,
        email=data.email,
        phone_number=data.phone_number,
        address_line_1=data.address_line_1,
        address_line_2=data.address_line_2,
        city=data.city,
        county=data.county,
        postcode=data.postcode,
        service_radius_miles=data.service_radius_miles,
        skills=data.skills,
        primary_trade=data.primary_trade,
        hourly_rate=data.hourly_rate,
        call_out_fee=data.call_out_fee,
        accepts_emergency=data.accepts_emergency,
    )

    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)

    return supplier


@router.get("", response_model=List[SupplierResponse])
async def list_suppliers(
    status: Optional[SupplierStatus] = None,
    primary_trade: Optional[str] = None,
    city: Optional[str] = None,
    verified: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """List suppliers with filtering."""
    query = select(Supplier)

    if status:
        query = query.where(Supplier.status == status)
    if primary_trade:
        query = query.where(Supplier.primary_trade == primary_trade)
    if city:
        query = query.where(Supplier.city.ilike(f"%{city}%"))
    if verified is not None:
        query = query.where(Supplier.verified == verified)

    result = await db.execute(query.order_by(Supplier.created_at.desc()))
    return result.scalars().all()


@router.get("/match", response_model=SupplierMatchResponse)
async def match_suppliers(
    category: IssueCategory,
    postcode: str,
    is_emergency: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """
    Find matching suppliers based on skills and location.

    Uses skill-based routing to find appropriate suppliers.
    """
    # Get required skills for category
    required_skills = CATEGORY_TO_SKILLS.get(category, ["general"])

    # Build query
    query = select(Supplier).where(
        Supplier.status == SupplierStatus.ACTIVE,
        Supplier.verified == True
    )

    # Filter by emergency availability if needed
    if is_emergency:
        query = query.where(
            Supplier.accepts_emergency == True,
            Supplier.emergency_available == True
        )

    # Get postcode prefix for area matching
    postcode_prefix = postcode.split()[0] if ' ' in postcode else postcode[:3]

    result = await db.execute(query)
    all_suppliers = result.scalars().all()

    # Score and filter suppliers
    matched_suppliers = []
    for supplier in all_suppliers:
        score = 0

        # Check skills match
        supplier_skills = [s.lower() for s in supplier.skills]
        skill_match = any(skill.lower() in supplier_skills for skill in required_skills)

        if not skill_match:
            continue

        score += 10  # Base score for skill match

        # Check primary trade match
        if supplier.primary_trade.lower() in [s.lower() for s in required_skills]:
            score += 5

        # Check postcode/area match (simplified)
        if supplier.postcode.startswith(postcode_prefix):
            score += 10

        # Boost by rating
        if supplier.average_rating:
            score += float(supplier.average_rating) * 2

        # Boost by completion rate
        if supplier.total_jobs_completed > 10:
            score += 5

        matched_suppliers.append((supplier, score))

    # Sort by score
    matched_suppliers.sort(key=lambda x: x[1], reverse=True)

    return SupplierMatchResponse(
        suppliers=[s[0] for s in matched_suppliers[:10]],
        match_criteria={
            "category": category.value,
            "required_skills": required_skills,
            "postcode": postcode,
            "is_emergency": is_emergency,
            "results_count": len(matched_suppliers),
        }
    )


@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific supplier."""
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id)
    )
    supplier = result.scalar_one_or_none()

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )

    return supplier


@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: UUID,
    data: SupplierUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a supplier."""
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id)
    )
    supplier = result.scalar_one_or_none()

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )

    # Suppliers can only update their own profile
    if current_user.role == UserRole.SUPPLIER and supplier.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile"
        )

    # Status changes require PM or above
    if data.status and current_user.role not in [UserRole.PROPERTY_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only property managers can change supplier status"
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(supplier, field, value)

    await db.commit()
    await db.refresh(supplier)

    return supplier


@router.post("/{supplier_id}/verify", response_model=SupplierResponse)
async def verify_supplier(
    supplier_id: UUID,
    data: SupplierVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """Verify a supplier and update their certifications."""
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id)
    )
    supplier = result.scalar_one_or_none()

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )

    supplier.public_liability_insurance = data.public_liability_insurance
    supplier.public_liability_amount = data.public_liability_amount
    supplier.public_liability_expiry = data.public_liability_expiry
    supplier.gas_safe_registered = data.gas_safe_registered
    supplier.gas_safe_number = data.gas_safe_number
    supplier.gas_safe_expiry = data.gas_safe_expiry
    supplier.niceic_registered = data.niceic_registered
    supplier.niceic_number = data.niceic_number

    supplier.verified = True
    supplier.verified_at = datetime.utcnow()
    supplier.verified_by_id = current_user.id
    supplier.status = SupplierStatus.ACTIVE

    await db.commit()
    await db.refresh(supplier)

    return supplier
