"""
XAPPY AI Near-Miss Endpoints

Near-miss incident reporting.
"""

from datetime import datetime, timezone
import hashlib
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.report import Report, ReportType, ReportStatus, REPORT_TYPE_PREFIX
from app.models.near_miss import NearMissDetails, NearMissCategory, PotentialSeverity
from app.models.audit_trail import AuditAction
from app.models.user import User
from app.api.v1.deps import get_current_active_user
from app.services.audit import create_audit_entry

router = APIRouter()


# Schemas
class NearMissCreateRequest(BaseModel):
    """Near-miss report creation request"""
    title: str = Field(..., min_length=5, max_length=500)
    description: str = Field(..., min_length=10)
    category: NearMissCategory
    potential_severity: PotentialSeverity = PotentialSeverity.MEDIUM
    occurred_at: datetime
    location_description: Optional[str] = None
    gps_coordinates: Optional[dict] = None
    site_id: Optional[UUID] = None
    area_id: Optional[UUID] = None
    people_in_area: Optional[int] = None
    work_being_performed: Optional[str] = None
    immediate_actions_taken: Optional[str] = None
    equipment_involved: Optional[List[dict]] = None
    environmental_conditions: Optional[dict] = None
    contributing_factors: Optional[List[str]] = None
    suggested_preventive_actions: Optional[str] = None


class NearMissResponse(BaseModel):
    """Near-miss report response"""
    id: str
    reference_number: str
    title: str
    description: str
    status: str
    category: str
    potential_severity: str
    reported_at: datetime
    occurred_at: datetime
    reporter_name: Optional[str]
    site_name: Optional[str]
    location_description: Optional[str]
    people_in_area: Optional[int]
    immediate_actions_taken: Optional[str]
    attachment_count: int


class PaginatedNearMissResponse(BaseModel):
    """Paginated near-miss reports"""
    items: List[NearMissResponse]
    total: int
    page: int
    page_size: int


async def generate_reference_number(
    db: AsyncSession,
    report_type: ReportType,
) -> str:
    """Generate unique reference number: XP-{TYPE}-{YYYYMMDD}-{SEQUENCE}"""
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    prefix = f"XP-{REPORT_TYPE_PREFIX[report_type]}-{today}"

    lock_key = int.from_bytes(hashlib.sha256(prefix.encode()).digest()[:8], "big", signed=True)
    await db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": lock_key})

    # Find last sequence for today
    result = await db.execute(
        select(func.count())
        .select_from(Report)
        .where(Report.reference_number.like(f"{prefix}-%"))
    )
    count = result.scalar() or 0
    sequence = count + 1

    return f"{prefix}-{sequence:04d}"


@router.post("", response_model=NearMissResponse)
async def create_near_miss(
    request: NearMissCreateRequest,
    http_request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new near-miss report.

    This is the primary endpoint for workers to report near-miss incidents.
    """
    # Generate reference number
    reference_number = await generate_reference_number(db, ReportType.NEAR_MISS)

    # Use user's site if not provided
    site_id = request.site_id or current_user.site_id

    # Create base report
    report = Report(
        reference_number=reference_number,
        report_type=ReportType.NEAR_MISS,
        reporter_id=current_user.id,
        site_id=site_id,
        area_id=request.area_id,
        title=request.title,
        description=request.description,
        location_description=request.location_description,
        gps_coordinates=request.gps_coordinates,
        occurred_at=request.occurred_at,
        reported_at=datetime.now(timezone.utc),
        submitted_at=datetime.now(timezone.utc),
        status=ReportStatus.SUBMITTED,
        source="web",
    )
    db.add(report)
    await db.flush()  # Get the ID

    # Create near-miss details
    near_miss = NearMissDetails(
        report_id=report.id,
        category=request.category,
        potential_severity=request.potential_severity,
        people_in_area=request.people_in_area,
        work_being_performed=request.work_being_performed,
        immediate_actions_taken=request.immediate_actions_taken,
        equipment_involved=request.equipment_involved,
        environmental_conditions=request.environmental_conditions,
        contributing_factors=request.contributing_factors,
        suggested_preventive_actions=request.suggested_preventive_actions,
    )
    db.add(near_miss)

    await create_audit_entry(
        db=db,
        report=report,
        action=AuditAction.SUBMITTED,
        actor=current_user,
        field_changed="status",
        old_value=None,
        new_value={"status": report.status.value},
        notes="Near-miss report submitted",
        source=report.source,
        request_id=getattr(http_request.state, "request_id", None) if http_request else None,
        ip_address=getattr(http_request.state, "client_ip", None) if http_request else None,
        user_agent=http_request.headers.get("user-agent") if http_request else None,
    )

    await db.commit()

    # Reload with relationships
    query = (
        select(Report)
        .where(Report.id == report.id)
        .options(selectinload(Report.site))
    )
    result = await db.execute(query)
    report = result.scalar_one()
    await db.refresh(near_miss)

    return NearMissResponse(
        id=str(report.id),
        reference_number=report.reference_number,
        title=report.title,
        description=report.description,
        status=report.status.value,
        category=near_miss.category.value,
        potential_severity=near_miss.potential_severity.value,
        reported_at=report.reported_at,
        occurred_at=report.occurred_at,
        reporter_name=current_user.full_name,
        site_name=report.site.name if report.site else None,
        location_description=report.location_description,
        people_in_area=near_miss.people_in_area,
        immediate_actions_taken=near_miss.immediate_actions_taken,
        attachment_count=0,
    )


@router.get("/{report_id}", response_model=NearMissResponse)
async def get_near_miss(
    report_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a near-miss report by ID"""
    query = (
        select(Report, NearMissDetails)
        .join(NearMissDetails, Report.id == NearMissDetails.report_id)
        .where(Report.id == report_id)
        .where(Report.report_type == ReportType.NEAR_MISS)
        .options(selectinload(Report.site))
        .options(selectinload(Report.reporter))
    )
    result = await db.execute(query)
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Near-miss report not found",
        )

    report, near_miss = row
    if not current_user.is_supervisor_or_above and report.reporter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    if current_user.site_id and not current_user.is_admin:
        if report.site_id and report.site_id != current_user.site_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    return NearMissResponse(
        id=str(report.id),
        reference_number=report.reference_number,
        title=report.title,
        description=report.description,
        status=report.status.value,
        category=near_miss.category.value,
        potential_severity=near_miss.potential_severity.value,
        reported_at=report.reported_at,
        occurred_at=report.occurred_at,
        reporter_name=report.reporter.full_name if report.reporter else None,
        site_name=report.site.name if report.site else None,
        location_description=report.location_description,
        people_in_area=near_miss.people_in_area,
        immediate_actions_taken=near_miss.immediate_actions_taken,
        attachment_count=report.attachment_count,
    )


@router.get("", response_model=PaginatedNearMissResponse)
async def list_near_miss(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[NearMissCategory] = None,
    severity: Optional[PotentialSeverity] = None,
    status: Optional[ReportStatus] = None,
    site_id: Optional[UUID] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List near-miss reports with filters"""
    query = (
        select(Report, NearMissDetails)
        .join(NearMissDetails, Report.id == NearMissDetails.report_id)
        .where(Report.report_type == ReportType.NEAR_MISS)
    )

    # Role-based filtering
    if not current_user.is_supervisor_or_above:
        query = query.where(Report.reporter_id == current_user.id)
    elif current_user.site_id:
        query = query.where(Report.site_id == current_user.site_id)

    # Apply filters
    if category:
        query = query.where(NearMissDetails.category == category)
    if severity:
        query = query.where(NearMissDetails.potential_severity == severity)
    if status:
        query = query.where(Report.status == status)
    if site_id:
        query = query.where(Report.site_id == site_id)
    if from_date:
        query = query.where(Report.reported_at >= from_date)
    if to_date:
        query = query.where(Report.reported_at <= to_date)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    # Paginate and eager load relationships
    offset = (page - 1) * page_size
    query = (
        query
        .options(selectinload(Report.reporter))
        .options(selectinload(Report.site))
        .offset(offset)
        .limit(page_size)
        .order_by(Report.reported_at.desc())
    )

    result = await db.execute(query)
    rows = result.all()

    return PaginatedNearMissResponse(
        items=[
            NearMissResponse(
                id=str(report.id),
                reference_number=report.reference_number,
                title=report.title,
                description=report.description,
                status=report.status.value,
                category=near_miss.category.value,
                potential_severity=near_miss.potential_severity.value,
                reported_at=report.reported_at,
                occurred_at=report.occurred_at,
                reporter_name=report.reporter.full_name if report.reporter else None,
                site_name=report.site.name if report.site else None,
                location_description=report.location_description,
                people_in_area=near_miss.people_in_area,
                immediate_actions_taken=near_miss.immediate_actions_taken,
                attachment_count=report.attachment_count,
            )
            for report, near_miss in rows
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{report_id}", response_model=NearMissResponse)
async def get_near_miss(
    report_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get near-miss report details"""
    query = (
        select(Report, NearMissDetails)
        .join(NearMissDetails, Report.id == NearMissDetails.report_id)
        .where(Report.id == report_id)
        .options(selectinload(Report.reporter))
        .options(selectinload(Report.site))
    )
    result = await db.execute(query)
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Near-miss report not found",
        )

    report, near_miss = row

    # Check access
    if not current_user.is_supervisor_or_above:
        if report.reporter_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    return NearMissResponse(
        id=str(report.id),
        reference_number=report.reference_number,
        title=report.title,
        description=report.description,
        status=report.status.value,
        category=near_miss.category.value,
        potential_severity=near_miss.potential_severity.value,
        reported_at=report.reported_at,
        occurred_at=report.occurred_at,
        reporter_name=report.reporter.full_name if report.reporter else None,
        site_name=report.site.name if report.site else None,
        location_description=report.location_description,
        people_in_area=near_miss.people_in_area,
        immediate_actions_taken=near_miss.immediate_actions_taken,
        attachment_count=report.attachment_count,
    )
