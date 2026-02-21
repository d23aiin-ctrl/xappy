"""
XAPPY Tenant API Endpoints

Tenant management and pipeline operations.
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, Field, EmailStr

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.tenant import Tenant, TenantPipelineStage, TenantPipelineHistory, TenantStatus
from app.api.v1.deps import (
    get_current_active_user,
    require_property_manager,
    require_landlord,
    require_agent,
)

router = APIRouter()


# Pydantic schemas
class TenantBase(BaseModel):
    email: EmailStr
    phone_number: Optional[str] = Field(None, max_length=20)
    full_name: str = Field(..., max_length=255)
    date_of_birth: Optional[datetime] = None
    nationality: Optional[str] = Field(None, max_length=100)
    current_address: Optional[str] = None
    current_postcode: Optional[str] = Field(None, max_length=20)
    employment_status: Optional[str] = None
    employer_name: Optional[str] = None
    job_title: Optional[str] = None
    annual_income: Optional[int] = None
    source: Optional[str] = None


class TenantCreate(TenantBase):
    interested_property_id: Optional[UUID] = None
    gdpr_consent: bool = False
    marketing_consent: bool = False


class TenantUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    nationality: Optional[str] = None
    current_address: Optional[str] = None
    current_postcode: Optional[str] = None
    employment_status: Optional[str] = None
    employer_name: Optional[str] = None
    job_title: Optional[str] = None
    annual_income: Optional[int] = None
    has_guarantor: Optional[bool] = None
    guarantor_name: Optional[str] = None
    guarantor_email: Optional[str] = None
    guarantor_phone: Optional[str] = None
    internal_notes: Optional[str] = None


class PipelineAdvanceRequest(BaseModel):
    notes: Optional[str] = None


class PipelineOverrideRequest(BaseModel):
    target_stage: TenantPipelineStage
    override_reason: str = Field(..., min_length=10)
    notes: Optional[str] = None


class TenantResponse(TenantBase):
    id: UUID
    reference: str
    user_id: Optional[UUID]
    status: TenantStatus
    pipeline_stage: TenantPipelineStage
    pipeline_stage_updated_at: datetime
    interested_property_id: Optional[UUID]
    gdpr_consent: bool
    gdpr_consent_at: Optional[datetime]
    has_guarantor: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PipelineHistoryResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    from_stage: Optional[TenantPipelineStage]
    to_stage: TenantPipelineStage
    triggered_by: str
    triggered_by_user_id: Optional[UUID]
    override_reason: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TenantListResponse(BaseModel):
    items: List[TenantResponse]
    total: int
    skip: int
    limit: int


# Pipeline stage transitions (allowed transitions)
STAGE_TRANSITIONS = {
    TenantPipelineStage.ENQUIRY: [
        TenantPipelineStage.VIEWING_SCHEDULED,
        TenantPipelineStage.WITHDRAWN,
        TenantPipelineStage.REJECTED,
    ],
    TenantPipelineStage.VIEWING_SCHEDULED: [
        TenantPipelineStage.VIEWING_COMPLETED,
        TenantPipelineStage.WITHDRAWN,
        TenantPipelineStage.REJECTED,
    ],
    TenantPipelineStage.VIEWING_COMPLETED: [
        TenantPipelineStage.APPLICATION_STARTED,
        TenantPipelineStage.WITHDRAWN,
        TenantPipelineStage.REJECTED,
    ],
    TenantPipelineStage.APPLICATION_STARTED: [
        TenantPipelineStage.QUALIFICATION_PENDING,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.QUALIFICATION_PENDING: [
        TenantPipelineStage.QUALIFICATION_REVIEW,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.QUALIFICATION_REVIEW: [
        TenantPipelineStage.QUALIFIED,
        TenantPipelineStage.NOT_QUALIFIED,
    ],
    TenantPipelineStage.QUALIFIED: [
        TenantPipelineStage.DOCUMENTS_REQUESTED,
        TenantPipelineStage.WITHDRAWN,
        TenantPipelineStage.REJECTED,
    ],
    TenantPipelineStage.DOCUMENTS_REQUESTED: [
        TenantPipelineStage.DOCUMENTS_SUBMITTED,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.DOCUMENTS_SUBMITTED: [
        TenantPipelineStage.DOCUMENTS_VERIFIED,
        TenantPipelineStage.DOCUMENTS_REQUESTED,  # Request more
        TenantPipelineStage.REJECTED,
    ],
    TenantPipelineStage.DOCUMENTS_VERIFIED: [
        TenantPipelineStage.HOLDING_DEPOSIT_REQUESTED,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.HOLDING_DEPOSIT_REQUESTED: [
        TenantPipelineStage.HOLDING_DEPOSIT_PAID,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.HOLDING_DEPOSIT_PAID: [
        TenantPipelineStage.REFERENCING,
    ],
    TenantPipelineStage.REFERENCING: [
        TenantPipelineStage.REFERENCING_PASSED,
        TenantPipelineStage.REFERENCING_FAILED,
    ],
    TenantPipelineStage.REFERENCING_PASSED: [
        TenantPipelineStage.CONTRACT_GENERATED,
    ],
    TenantPipelineStage.CONTRACT_GENERATED: [
        TenantPipelineStage.CONTRACT_SENT,
    ],
    TenantPipelineStage.CONTRACT_SENT: [
        TenantPipelineStage.CONTRACT_SIGNED,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.CONTRACT_SIGNED: [
        TenantPipelineStage.MOVE_IN_SCHEDULED,
    ],
    TenantPipelineStage.MOVE_IN_SCHEDULED: [
        TenantPipelineStage.TENANCY_STARTED,
    ],
}


async def generate_tenant_reference(db: AsyncSession) -> str:
    """Generate unique tenant reference"""
    result = await db.execute(select(func.count(Tenant.id)))
    count = result.scalar() or 0
    return f"XP-TEN-{count + 1:05d}"


async def record_pipeline_transition(
    db: AsyncSession,
    tenant: Tenant,
    from_stage: Optional[TenantPipelineStage],
    to_stage: TenantPipelineStage,
    triggered_by: str,
    user: User,
    override_reason: Optional[str] = None,
    notes: Optional[str] = None,
):
    """Record a pipeline stage transition"""
    history = TenantPipelineHistory(
        tenant_id=tenant.id,
        from_stage=from_stage,
        to_stage=to_stage,
        triggered_by=triggered_by,
        triggered_by_user_id=user.id,
        override_reason=override_reason,
        notes=notes,
    )
    db.add(history)


@router.post("", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    data: TenantCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """Create a new tenant profile."""
    # Check for existing tenant with same email
    existing = await db.execute(
        select(Tenant).where(Tenant.email == data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant with this email already exists"
        )

    reference = await generate_tenant_reference(db)

    tenant = Tenant(
        reference=reference,
        email=data.email,
        phone_number=data.phone_number,
        full_name=data.full_name,
        date_of_birth=data.date_of_birth,
        nationality=data.nationality,
        current_address=data.current_address,
        current_postcode=data.current_postcode,
        employment_status=data.employment_status,
        employer_name=data.employer_name,
        job_title=data.job_title,
        annual_income=data.annual_income,
        source=data.source,
        interested_property_id=data.interested_property_id,
        gdpr_consent=data.gdpr_consent,
        gdpr_consent_at=datetime.utcnow() if data.gdpr_consent else None,
        marketing_consent=data.marketing_consent,
        pipeline_stage=TenantPipelineStage.ENQUIRY,
        status=TenantStatus.PROSPECT,
    )

    db.add(tenant)
    await db.commit()

    # Record initial pipeline entry
    await record_pipeline_transition(
        db, tenant, None, TenantPipelineStage.ENQUIRY, "auto", current_user
    )
    await db.commit()
    await db.refresh(tenant)

    return tenant


@router.get("", response_model=TenantListResponse)
async def list_tenants(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[TenantStatus] = None,
    pipeline_stage: Optional[TenantPipelineStage] = None,
    property_id: Optional[UUID] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """List tenants with filtering."""
    query = select(Tenant)

    if status:
        query = query.where(Tenant.status == status)
    if pipeline_stage:
        query = query.where(Tenant.pipeline_stage == pipeline_stage)
    if property_id:
        query = query.where(Tenant.interested_property_id == property_id)
    if search:
        query = query.where(
            Tenant.full_name.ilike(f"%{search}%") |
            Tenant.email.ilike(f"%{search}%") |
            Tenant.reference.ilike(f"%{search}%")
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination
    query = query.order_by(Tenant.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    tenants = result.scalars().all()

    return TenantListResponse(
        items=tenants,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/pipeline", response_model=dict)
async def get_pipeline_view(
    property_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """
    Get tenants grouped by pipeline stage for Kanban view.
    """
    query = select(Tenant).where(
        Tenant.status == TenantStatus.PROSPECT
    )

    if property_id:
        query = query.where(Tenant.interested_property_id == property_id)

    result = await db.execute(query)
    tenants = result.scalars().all()

    # Group by stage
    pipeline = {}
    for stage in TenantPipelineStage:
        pipeline[stage.value] = []

    for tenant in tenants:
        pipeline[tenant.pipeline_stage.value].append({
            "id": str(tenant.id),
            "reference": tenant.reference,
            "full_name": tenant.full_name,
            "email": tenant.email,
            "property_id": str(tenant.interested_property_id) if tenant.interested_property_id else None,
            "stage_updated_at": tenant.pipeline_stage_updated_at.isoformat(),
        })

    return pipeline


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """Get a specific tenant by ID."""
    result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )

    return tenant


@router.put("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: UUID,
    data: TenantUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """Update a tenant's details."""
    result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tenant, field, value)

    await db.commit()
    await db.refresh(tenant)

    return tenant


@router.post("/{tenant_id}/pipeline/advance", response_model=TenantResponse)
async def advance_pipeline(
    tenant_id: UUID,
    data: PipelineAdvanceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """
    Advance tenant to the next logical pipeline stage.

    The next stage is determined by the allowed transitions.
    """
    result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )

    current_stage = tenant.pipeline_stage
    allowed_transitions = STAGE_TRANSITIONS.get(current_stage, [])

    if not allowed_transitions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No further transitions available from stage: {current_stage.value}"
        )

    # Get the first non-terminal transition
    next_stage = None
    for stage in allowed_transitions:
        if stage not in [TenantPipelineStage.WITHDRAWN, TenantPipelineStage.REJECTED]:
            next_stage = stage
            break

    if not next_stage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No automatic advancement available. Use override for terminal stages."
        )

    # Update tenant
    old_stage = tenant.pipeline_stage
    tenant.pipeline_stage = next_stage
    tenant.pipeline_stage_updated_at = datetime.utcnow()

    # Record history
    await record_pipeline_transition(
        db, tenant, old_stage, next_stage, "auto", current_user, notes=data.notes
    )

    await db.commit()
    await db.refresh(tenant)

    return tenant


@router.post("/{tenant_id}/pipeline/override", response_model=TenantResponse)
async def override_pipeline(
    tenant_id: UUID,
    data: PipelineOverrideRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """
    Manual override to move tenant to any pipeline stage.

    Requires property manager or above. Override reason is mandatory.
    """
    result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )

    old_stage = tenant.pipeline_stage
    tenant.pipeline_stage = data.target_stage
    tenant.pipeline_stage_updated_at = datetime.utcnow()

    # Update status if moving to terminal stage
    if data.target_stage == TenantPipelineStage.TENANCY_STARTED:
        tenant.status = TenantStatus.ACTIVE
    elif data.target_stage in [TenantPipelineStage.WITHDRAWN, TenantPipelineStage.REJECTED]:
        tenant.status = TenantStatus.PAST

    # Record history with override
    await record_pipeline_transition(
        db, tenant, old_stage, data.target_stage, "manual_override", current_user,
        override_reason=data.override_reason, notes=data.notes
    )

    await db.commit()
    await db.refresh(tenant)

    return tenant


@router.get("/{tenant_id}/pipeline/history", response_model=List[PipelineHistoryResponse])
async def get_pipeline_history(
    tenant_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_agent),
):
    """Get pipeline history for a tenant."""
    result = await db.execute(
        select(TenantPipelineHistory)
        .where(TenantPipelineHistory.tenant_id == tenant_id)
        .order_by(TenantPipelineHistory.created_at.desc())
    )
    history = result.scalars().all()

    return history
