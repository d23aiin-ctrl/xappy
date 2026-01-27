"""
XAPPY AI Reports Endpoints

Universal report management endpoints.
"""

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.report import Report, ReportType, ReportStatus
from app.models.audit_trail import AuditAction, AuditTrail
from app.models.user import User
from app.models.site import Site, Area
from app.api.v1.deps import get_current_active_user, require_supervisor
from app.services.audit import create_audit_entry

router = APIRouter()


# Schemas
class ReportSummary(BaseModel):
    """Report summary for listings"""
    id: str
    reference_number: str
    report_type: str
    title: str
    status: str
    reported_at: datetime
    occurred_at: datetime
    reporter_name: Optional[str]
    site_name: Optional[str]
    attachment_count: int

    class Config:
        from_attributes = True


class ReportDetail(BaseModel):
    """Full report detail"""
    id: str
    reference_number: str
    report_type: str
    title: str
    description: str
    description_original: Optional[str]
    original_language: str
    status: str
    source: str
    reported_at: datetime
    occurred_at: datetime
    submitted_at: Optional[datetime]
    acknowledged_at: Optional[datetime]
    closed_at: Optional[datetime]
    reporter_id: Optional[str]
    reporter_name: Optional[str]
    site_id: Optional[str]
    site_name: Optional[str]
    area_id: Optional[str]
    area_name: Optional[str]
    location_description: Optional[str]
    gps_coordinates: Optional[dict]
    ai_classification: Optional[dict]
    ai_summary: Optional[str]
    attachment_count: int


class PaginatedReportsResponse(BaseModel):
    """Paginated reports response"""
    items: List[ReportSummary]
    total: int
    page: int
    page_size: int
    total_pages: int


class ReportStatusUpdate(BaseModel):
    """Status update request"""
    status: ReportStatus
    notes: Optional[str] = None


class ReportAcknowledgeRequest(BaseModel):
    """Report acknowledge request"""
    notes: Optional[str] = None


class ReportCloseRequest(BaseModel):
    """Report close request"""
    resolution_notes: Optional[str] = None
    notes: Optional[str] = None

    @property
    def audit_notes(self) -> Optional[str]:
        return self.resolution_notes or self.notes


class AuditEntryResponse(BaseModel):
    """Audit trail entry response"""
    id: str
    action: str
    actor_name: Optional[str]
    actor_role: Optional[str]
    field_changed: Optional[str]
    old_value: Optional[dict]
    new_value: Optional[dict]
    notes: Optional[str]
    timestamp: datetime


class ReportTimelineResponse(BaseModel):
    """Report timeline response"""
    report_id: str
    reference_number: str
    entries: List[AuditEntryResponse]


@router.get("", response_model=PaginatedReportsResponse)
async def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    report_type: Optional[ReportType] = None,
    status: Optional[ReportStatus] = None,
    site_id: Optional[UUID] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List reports with filters.

    Workers see only their own reports.
    Supervisors and above see all reports.
    """
    query = select(Report)

    # Role-based filtering
    if not current_user.is_supervisor_or_above:
        query = query.where(Report.reporter_id == current_user.id)
    elif current_user.site_id:
        # Supervisors see reports from their site
        query = query.where(Report.site_id == current_user.site_id)

    # Apply filters
    if report_type:
        query = query.where(Report.report_type == report_type)
    if status:
        query = query.where(Report.status == status)
    if site_id:
        query = query.where(Report.site_id == site_id)
    if from_date:
        query = query.where(Report.reported_at >= from_date)
    if to_date:
        query = query.where(Report.reported_at <= to_date)
    if search:
        query = query.where(
            (Report.title.ilike(f"%{search}%")) |
            (Report.reference_number.ilike(f"%{search}%")) |
            (Report.description.ilike(f"%{search}%"))
        )

    # Count total
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
    reports = result.scalars().all()

    return PaginatedReportsResponse(
        items=[
            ReportSummary(
                id=str(r.id),
                reference_number=r.reference_number,
                report_type=r.report_type.value,
                title=r.title,
                status=r.status.value,
                reported_at=r.reported_at,
                occurred_at=r.occurred_at,
                reporter_name=r.reporter.full_name if r.reporter else None,
                site_name=r.site.name if r.site else None,
                attachment_count=r.attachment_count,
            )
            for r in reports
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{report_id}", response_model=ReportDetail)
async def get_report(
    report_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get report details"""
    query = (
        select(Report)
        .where(Report.id == report_id)
        .options(selectinload(Report.reporter))
        .options(selectinload(Report.site))
        .options(selectinload(Report.area))
    )
    result = await db.execute(query)
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    # Check access
    if not current_user.is_supervisor_or_above:
        if report.reporter_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    elif current_user.site_id and not current_user.is_admin:
        if report.site_id and report.site_id != current_user.site_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    return ReportDetail(
        id=str(report.id),
        reference_number=report.reference_number,
        report_type=report.report_type.value,
        title=report.title,
        description=report.description,
        description_original=report.description_original,
        original_language=report.original_language,
        status=report.status.value,
        source=report.source,
        reported_at=report.reported_at,
        occurred_at=report.occurred_at,
        submitted_at=report.submitted_at,
        acknowledged_at=report.acknowledged_at,
        closed_at=report.closed_at,
        reporter_id=str(report.reporter_id) if report.reporter_id else None,
        reporter_name=report.reporter.full_name if report.reporter else None,
        site_id=str(report.site_id) if report.site_id else None,
        site_name=report.site.name if report.site else None,
        area_id=str(report.area_id) if report.area_id else None,
        area_name=report.area.name if report.area else None,
        location_description=report.location_description,
        gps_coordinates=report.gps_coordinates,
        ai_classification=report.ai_classification,
        ai_summary=report.ai_summary,
        attachment_count=report.attachment_count,
    )


@router.post("/{report_id}/acknowledge")
async def acknowledge_report(
    report_id: UUID,
    request: Request,
    payload: Optional[ReportAcknowledgeRequest] = Body(default=None),
    current_user: User = Depends(require_supervisor),
    db: AsyncSession = Depends(get_db),
):
    """Acknowledge a report (supervisor only)"""
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    if current_user.site_id and not current_user.is_admin:
        if report.site_id and report.site_id != current_user.site_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    if report.status != ReportStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report is not in submitted status",
        )

    previous_status = report.status.value
    report.status = ReportStatus.ACKNOWLEDGED
    report.acknowledged_by_id = current_user.id
    report.acknowledged_at = datetime.now(timezone.utc)

    await create_audit_entry(
        db=db,
        report=report,
        action=AuditAction.ACKNOWLEDGED,
        actor=current_user,
        field_changed="status",
        old_value={"status": previous_status},
        new_value={"status": report.status.value},
        notes=payload.notes if payload else None,
        source=report.source,
        request_id=getattr(request.state, "request_id", None) if request else None,
        ip_address=getattr(request.state, "client_ip", None) if request else None,
        user_agent=request.headers.get("user-agent") if request else None,
    )

    await db.commit()

    return {"success": True, "message": "Report acknowledged"}


@router.post("/{report_id}/close")
async def close_report(
    report_id: UUID,
    request: Request,
    payload: Optional[ReportCloseRequest] = Body(default=None),
    current_user: User = Depends(require_supervisor),
    db: AsyncSession = Depends(get_db),
):
    """Close a report (supervisor only)"""
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    if current_user.site_id and not current_user.is_admin:
        if report.site_id and report.site_id != current_user.site_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    previous_status = report.status.value
    report.status = ReportStatus.CLOSED
    report.closed_by_id = current_user.id
    report.closed_at = datetime.now(timezone.utc)

    await create_audit_entry(
        db=db,
        report=report,
        action=AuditAction.CLOSED,
        actor=current_user,
        field_changed="status",
        old_value={"status": previous_status},
        new_value={"status": report.status.value},
        notes=payload.audit_notes if payload else None,
        source=report.source,
        request_id=getattr(request.state, "request_id", None) if request else None,
        ip_address=getattr(request.state, "client_ip", None) if request else None,
        user_agent=request.headers.get("user-agent") if request else None,
    )

    await db.commit()

    return {"success": True, "message": "Report closed"}


@router.get("/{report_id}/timeline", response_model=ReportTimelineResponse)
async def get_report_timeline(
    report_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get report audit trail timeline"""
    report_result = await db.execute(select(Report).where(Report.id == report_id))
    report = report_result.scalar_one_or_none()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )

    if not current_user.is_supervisor_or_above:
        if report.reporter_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    elif current_user.site_id and not current_user.is_admin:
        if report.site_id and report.site_id != current_user.site_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )

    entries_result = await db.execute(
        select(AuditTrail)
        .where(AuditTrail.report_id == report_id)
        .order_by(AuditTrail.timestamp.asc())
    )
    entries = entries_result.scalars().all()

    return ReportTimelineResponse(
        report_id=str(report.id),
        reference_number=report.reference_number,
        entries=[
            AuditEntryResponse(
                id=str(entry.id),
                action=entry.action.value,
                actor_name=entry.actor_name,
                actor_role=entry.actor_role,
                field_changed=entry.field_changed,
                old_value=entry.old_value,
                new_value=entry.new_value,
                notes=entry.notes,
                timestamp=entry.timestamp,
            )
            for entry in entries
        ],
    )
