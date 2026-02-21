"""
XAPPY Compliance API Endpoints

Compliance records and reminder management.
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta
import hashlib

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.compliance import (
    ComplianceRecord, ComplianceReminder,
    ComplianceType, ComplianceStatus, ReminderStatus,
    DEFAULT_VALIDITY, REMINDER_SCHEDULE
)
from app.models.property import Property
from app.api.v1.deps import (
    get_current_active_user,
    require_property_manager,
    require_landlord,
)

router = APIRouter()


# Pydantic schemas
class ComplianceCreate(BaseModel):
    property_id: UUID
    compliance_type: ComplianceType
    certificate_number: Optional[str] = None
    issuing_body: Optional[str] = None
    inspector_name: Optional[str] = None
    inspector_registration: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    findings: Optional[str] = None
    cost: Optional[int] = None
    supplier_name: Optional[str] = None


class ComplianceUpdate(BaseModel):
    certificate_number: Optional[str] = None
    issuing_body: Optional[str] = None
    inspector_name: Optional[str] = None
    inspector_registration: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    findings: Optional[str] = None
    remedial_actions: Optional[List[dict]] = None
    cost: Optional[int] = None
    internal_notes: Optional[str] = None


class EvidenceUploadRequest(BaseModel):
    evidence_url: str
    evidence_hash: str


class ComplianceResponse(BaseModel):
    id: UUID
    reference: str
    property_id: UUID
    compliance_type: ComplianceType
    status: ComplianceStatus
    certificate_number: Optional[str]
    issuing_body: Optional[str]
    inspector_name: Optional[str]
    issue_date: Optional[datetime]
    expiry_date: Optional[datetime]
    next_due_date: Optional[datetime]
    evidence_url: Optional[str]
    verified: bool
    verified_at: Optional[datetime]
    findings: Optional[str]
    has_remedial_actions: bool
    remedial_completed: bool
    cost: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class ComplianceDashboardResponse(BaseModel):
    total_records: int
    valid: int
    expiring_soon: int
    expired: int
    pending: int
    by_type: dict
    upcoming_renewals: List[ComplianceResponse]


class ReminderResponse(BaseModel):
    id: UUID
    compliance_record_id: UUID
    days_before_expiry: int
    reminder_type: str
    scheduled_date: datetime
    status: ReminderStatus
    sent_at: Optional[datetime]
    acknowledged_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


async def generate_compliance_reference(db: AsyncSession) -> str:
    """Generate unique compliance reference"""
    result = await db.execute(select(func.count(ComplianceRecord.id)))
    count = result.scalar() or 0
    return f"XP-CMP-{count + 1:05d}"


def calculate_status(expiry_date: Optional[datetime]) -> ComplianceStatus:
    """Calculate compliance status based on expiry date"""
    if not expiry_date:
        return ComplianceStatus.PENDING

    now = datetime.utcnow()
    if expiry_date.replace(tzinfo=None) < now:
        return ComplianceStatus.EXPIRED
    elif expiry_date.replace(tzinfo=None) < now + timedelta(days=30):
        return ComplianceStatus.EXPIRING_SOON
    else:
        return ComplianceStatus.VALID


async def create_reminders(
    db: AsyncSession,
    record: ComplianceRecord,
):
    """Create reminder schedule for a compliance record"""
    if not record.expiry_date:
        return

    for days in REMINDER_SCHEDULE:
        reminder_date = record.expiry_date - timedelta(days=days)

        # Determine reminder type
        if days == 30:
            reminder_type = "internal"
        elif days == 14:
            reminder_type = "landlord"
        elif days == 7:
            reminder_type = "escalation"
        else:
            reminder_type = "overdue"

        reminder = ComplianceReminder(
            compliance_record_id=record.id,
            days_before_expiry=days,
            reminder_type=reminder_type,
            scheduled_date=reminder_date,
            status=ReminderStatus.PENDING,
        )
        db.add(reminder)


@router.post("", response_model=ComplianceResponse, status_code=status.HTTP_201_CREATED)
async def create_compliance(
    data: ComplianceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Create a new compliance record."""
    # Verify property exists
    property_result = await db.execute(
        select(Property).where(Property.id == data.property_id)
    )
    if not property_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )

    reference = await generate_compliance_reference(db)

    # Calculate next due date based on validity period
    next_due = None
    if data.expiry_date:
        next_due = data.expiry_date
    elif data.issue_date:
        validity_months = DEFAULT_VALIDITY.get(data.compliance_type, 12)
        next_due = data.issue_date + timedelta(days=validity_months * 30)

    # Determine status
    status_value = calculate_status(data.expiry_date)

    record = ComplianceRecord(
        reference=reference,
        property_id=data.property_id,
        compliance_type=data.compliance_type,
        status=status_value,
        certificate_number=data.certificate_number,
        issuing_body=data.issuing_body,
        inspector_name=data.inspector_name,
        inspector_registration=data.inspector_registration,
        issue_date=data.issue_date,
        expiry_date=data.expiry_date,
        next_due_date=next_due,
        findings=data.findings,
        cost=data.cost,
        supplier_name=data.supplier_name,
        record_hash="",  # Will be computed
    )

    # Compute hash
    record.record_hash = record.compute_hash()

    db.add(record)
    await db.flush()

    # Create reminders
    await create_reminders(db, record)

    await db.commit()
    await db.refresh(record)

    return record


@router.get("", response_model=List[ComplianceResponse])
async def list_compliance(
    property_id: Optional[UUID] = None,
    compliance_type: Optional[ComplianceType] = None,
    status: Optional[ComplianceStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """List compliance records."""
    query = select(ComplianceRecord)

    # Role-based filtering for landlords
    if current_user.role == UserRole.LANDLORD:
        # Get landlord's properties
        props_query = select(Property.id).where(Property.landlord_id == current_user.id)
        props_result = await db.execute(props_query)
        property_ids = [p[0] for p in props_result.all()]
        query = query.where(ComplianceRecord.property_id.in_(property_ids))

    if property_id:
        query = query.where(ComplianceRecord.property_id == property_id)
    if compliance_type:
        query = query.where(ComplianceRecord.compliance_type == compliance_type)
    if status:
        query = query.where(ComplianceRecord.status == status)

    result = await db.execute(query.order_by(ComplianceRecord.expiry_date.asc()))
    return result.scalars().all()


@router.get("/dashboard", response_model=ComplianceDashboardResponse)
async def get_compliance_dashboard(
    property_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Get compliance dashboard overview."""
    query = select(ComplianceRecord)

    # Role-based filtering
    if current_user.role == UserRole.LANDLORD:
        props_query = select(Property.id).where(Property.landlord_id == current_user.id)
        props_result = await db.execute(props_query)
        property_ids = [p[0] for p in props_result.all()]
        query = query.where(ComplianceRecord.property_id.in_(property_ids))

    if property_id:
        query = query.where(ComplianceRecord.property_id == property_id)

    result = await db.execute(query)
    records = result.scalars().all()

    # Update statuses (in case they've changed)
    for record in records:
        record.status = calculate_status(record.expiry_date)

    # Calculate counts
    valid = sum(1 for r in records if r.status == ComplianceStatus.VALID)
    expiring = sum(1 for r in records if r.status == ComplianceStatus.EXPIRING_SOON)
    expired = sum(1 for r in records if r.status == ComplianceStatus.EXPIRED)
    pending = sum(1 for r in records if r.status == ComplianceStatus.PENDING)

    # Group by type
    by_type = {}
    for r in records:
        type_key = r.compliance_type.value
        if type_key not in by_type:
            by_type[type_key] = {"valid": 0, "expiring": 0, "expired": 0, "pending": 0}
        by_type[type_key][r.status.value if r.status.value in by_type[type_key] else "pending"] += 1

    # Get upcoming renewals (next 60 days)
    upcoming = [
        r for r in records
        if r.expiry_date and r.expiry_date.replace(tzinfo=None) <= datetime.utcnow() + timedelta(days=60)
        and r.status != ComplianceStatus.EXPIRED
    ]
    upcoming.sort(key=lambda x: x.expiry_date)

    return ComplianceDashboardResponse(
        total_records=len(records),
        valid=valid,
        expiring_soon=expiring,
        expired=expired,
        pending=pending,
        by_type=by_type,
        upcoming_renewals=upcoming[:10],
    )


@router.get("/due-soon", response_model=List[ComplianceResponse])
async def get_due_soon(
    days: int = Query(default=30, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Get compliance records expiring within specified days."""
    cutoff = datetime.utcnow() + timedelta(days=days)

    query = select(ComplianceRecord).where(
        ComplianceRecord.expiry_date <= cutoff,
        ComplianceRecord.status != ComplianceStatus.EXPIRED
    )

    # Role-based filtering
    if current_user.role == UserRole.LANDLORD:
        props_query = select(Property.id).where(Property.landlord_id == current_user.id)
        props_result = await db.execute(props_query)
        property_ids = [p[0] for p in props_result.all()]
        query = query.where(ComplianceRecord.property_id.in_(property_ids))

    result = await db.execute(query.order_by(ComplianceRecord.expiry_date.asc()))
    return result.scalars().all()


@router.get("/{compliance_id}", response_model=ComplianceResponse)
async def get_compliance(
    compliance_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Get a specific compliance record."""
    result = await db.execute(
        select(ComplianceRecord).where(ComplianceRecord.id == compliance_id)
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compliance record not found"
        )

    return record


@router.put("/{compliance_id}", response_model=ComplianceResponse)
async def update_compliance(
    compliance_id: UUID,
    data: ComplianceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Update a compliance record."""
    result = await db.execute(
        select(ComplianceRecord).where(ComplianceRecord.id == compliance_id)
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compliance record not found"
        )

    update_data = data.model_dump(exclude_unset=True)

    # Track if remedial actions updated
    if 'remedial_actions' in update_data:
        record.has_remedial_actions = bool(update_data['remedial_actions'])
        # Check if all completed
        actions = update_data['remedial_actions'] or []
        record.remedial_completed = all(a.get('completed', False) for a in actions)

    for field, value in update_data.items():
        setattr(record, field, value)

    # Update status if expiry changed
    if 'expiry_date' in update_data:
        record.status = calculate_status(record.expiry_date)
        record.next_due_date = record.expiry_date

    # Update hash
    record.record_hash = record.compute_hash()

    await db.commit()
    await db.refresh(record)

    return record


@router.post("/{compliance_id}/upload-evidence", response_model=ComplianceResponse)
async def upload_evidence(
    compliance_id: UUID,
    data: EvidenceUploadRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """
    Upload evidence document for a compliance record.

    Evidence hash is stored for tamper resistance.
    """
    result = await db.execute(
        select(ComplianceRecord).where(ComplianceRecord.id == compliance_id)
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compliance record not found"
        )

    record.evidence_url = data.evidence_url
    record.evidence_hash = data.evidence_hash
    record.evidence_uploaded_at = datetime.utcnow()
    record.evidence_uploaded_by_id = current_user.id

    # Update record hash
    record.record_hash = record.compute_hash()

    await db.commit()
    await db.refresh(record)

    return record


@router.post("/{compliance_id}/verify", response_model=ComplianceResponse)
async def verify_compliance(
    compliance_id: UUID,
    verification_notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """Verify a compliance record."""
    result = await db.execute(
        select(ComplianceRecord).where(ComplianceRecord.id == compliance_id)
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compliance record not found"
        )

    record.verified = True
    record.verified_at = datetime.utcnow()
    record.verified_by_id = current_user.id
    record.verification_notes = verification_notes

    # Update status to valid if has valid expiry
    if record.expiry_date and record.expiry_date.replace(tzinfo=None) > datetime.utcnow():
        record.status = calculate_status(record.expiry_date)

    await db.commit()
    await db.refresh(record)

    return record
