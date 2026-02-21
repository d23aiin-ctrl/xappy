"""
XAPPY Maintenance API Endpoints

Issue reporting and job management.
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.maintenance import (
    MaintenanceIssue, MaintenanceJob,
    IssueCategory, IssuePriority, IssueStatus, JobStatus, SLA_TARGETS
)
from app.models.tenant import Tenant
from app.api.v1.deps import (
    get_current_active_user,
    require_property_manager,
    require_landlord,
    require_tenant,
    require_supplier,
)

router = APIRouter()


# Pydantic schemas
class IssueCreate(BaseModel):
    property_id: UUID
    tenancy_id: Optional[UUID] = None
    title: str = Field(..., max_length=255)
    description: str
    category: IssueCategory
    priority: IssuePriority = IssuePriority.MEDIUM
    location_in_property: Optional[str] = None
    location_details: Optional[str] = None
    evidence_urls: Optional[List[dict]] = None
    access_instructions: Optional[str] = None
    preferred_times: Optional[dict] = None


class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[IssueCategory] = None
    priority: Optional[IssuePriority] = None
    status: Optional[IssueStatus] = None
    location_in_property: Optional[str] = None
    access_instructions: Optional[str] = None
    internal_notes: Optional[str] = None


class AcknowledgeRequest(BaseModel):
    notes: Optional[str] = None


class AssignJobRequest(BaseModel):
    supplier_id: UUID
    description: str
    instructions: Optional[str] = None
    required_skills: Optional[List[str]] = None
    scheduled_date: Optional[datetime] = None
    scheduled_time_slot: Optional[str] = None
    estimated_duration_hours: Optional[int] = None
    estimated_labour_cost: Optional[Decimal] = None
    estimated_materials_cost: Optional[Decimal] = None


class JobUpdateRequest(BaseModel):
    status: Optional[JobStatus] = None
    scheduled_date: Optional[datetime] = None
    scheduled_time_slot: Optional[str] = None
    before_photos: Optional[List[dict]] = None
    after_photos: Optional[List[dict]] = None
    completion_notes: Optional[str] = None
    actual_labour_cost: Optional[Decimal] = None
    actual_materials_cost: Optional[Decimal] = None
    parts_ordered: Optional[List[dict]] = None
    supplier_notes: Optional[str] = None
    decline_reason: Optional[str] = None


class IssueResponse(BaseModel):
    id: UUID
    reference: str
    property_id: UUID
    tenancy_id: Optional[UUID]
    reported_by_id: Optional[UUID]
    title: str
    description: str
    category: IssueCategory
    priority: IssuePriority
    status: IssueStatus
    location_in_property: Optional[str]
    evidence_urls: Optional[List[dict]]
    sla_target_hours: int
    sla_deadline: datetime
    sla_breached: bool
    acknowledged_at: Optional[datetime]
    completed_at: Optional[datetime]
    escalated: bool
    reported_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class JobResponse(BaseModel):
    id: UUID
    reference: str
    issue_id: UUID
    supplier_id: Optional[UUID]
    status: JobStatus
    description: str
    instructions: Optional[str]
    scheduled_date: Optional[datetime]
    scheduled_time_slot: Optional[str]
    estimated_total: Optional[Decimal]
    actual_total: Optional[Decimal]
    before_photos: Optional[List[dict]]
    after_photos: Optional[List[dict]]
    completion_notes: Optional[str]
    accepted_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class IssueListResponse(BaseModel):
    items: List[IssueResponse]
    total: int
    skip: int
    limit: int


async def generate_issue_reference(db: AsyncSession) -> str:
    """Generate unique issue reference"""
    result = await db.execute(select(func.count(MaintenanceIssue.id)))
    count = result.scalar() or 0
    return f"XP-ISS-{count + 1:05d}"


async def generate_job_reference(db: AsyncSession) -> str:
    """Generate unique job reference"""
    result = await db.execute(select(func.count(MaintenanceJob.id)))
    count = result.scalar() or 0
    return f"XP-JOB-{count + 1:05d}"


@router.post("/issues", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
async def create_issue(
    data: IssueCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Report a maintenance issue.

    Can be reported by tenant, landlord, or property manager.
    """
    reference = await generate_issue_reference(db)

    # Calculate SLA deadline
    sla_hours = SLA_TARGETS.get(data.priority, 72)
    sla_deadline = datetime.utcnow() + timedelta(hours=sla_hours)

    issue = MaintenanceIssue(
        reference=reference,
        property_id=data.property_id,
        tenancy_id=data.tenancy_id,
        reported_by_id=current_user.id,
        title=data.title,
        description=data.description,
        category=data.category,
        priority=data.priority,
        status=IssueStatus.REPORTED,
        location_in_property=data.location_in_property,
        location_details=data.location_details,
        evidence_urls=data.evidence_urls,
        sla_target_hours=sla_hours,
        sla_deadline=sla_deadline,
        access_instructions=data.access_instructions,
        preferred_times=data.preferred_times,
    )

    db.add(issue)
    await db.commit()
    await db.refresh(issue)

    return issue


@router.get("/issues", response_model=IssueListResponse)
async def list_issues(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[IssueStatus] = None,
    priority: Optional[IssuePriority] = None,
    category: Optional[IssueCategory] = None,
    property_id: Optional[UUID] = None,
    sla_breached: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """List maintenance issues with filtering."""
    query = select(MaintenanceIssue)

    # Role-based filtering
    if current_user.role == UserRole.TENANT:
        # Tenants see only their reported issues
        query = query.where(MaintenanceIssue.reported_by_id == current_user.id)

    if status:
        query = query.where(MaintenanceIssue.status == status)
    if priority:
        query = query.where(MaintenanceIssue.priority == priority)
    if category:
        query = query.where(MaintenanceIssue.category == category)
    if property_id:
        query = query.where(MaintenanceIssue.property_id == property_id)
    if sla_breached is not None:
        query = query.where(MaintenanceIssue.sla_breached == sla_breached)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Apply pagination
    query = query.order_by(
        MaintenanceIssue.priority.desc(),
        MaintenanceIssue.reported_at.desc()
    ).offset(skip).limit(limit)

    result = await db.execute(query)
    issues = result.scalars().all()

    return IssueListResponse(
        items=issues,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/issues/{issue_id}", response_model=IssueResponse)
async def get_issue(
    issue_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific issue."""
    result = await db.execute(
        select(MaintenanceIssue).where(MaintenanceIssue.id == issue_id)
    )
    issue = result.scalar_one_or_none()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    return issue


@router.post("/issues/{issue_id}/acknowledge", response_model=IssueResponse)
async def acknowledge_issue(
    issue_id: UUID,
    data: AcknowledgeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Acknowledge a reported issue."""
    result = await db.execute(
        select(MaintenanceIssue).where(MaintenanceIssue.id == issue_id)
    )
    issue = result.scalar_one_or_none()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    if issue.status != IssueStatus.REPORTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Issue has already been acknowledged"
        )

    issue.status = IssueStatus.ACKNOWLEDGED
    issue.acknowledged_by_id = current_user.id
    issue.acknowledged_at = datetime.utcnow()

    if data.notes:
        issue.internal_notes = data.notes

    await db.commit()
    await db.refresh(issue)

    return issue


@router.post("/issues/{issue_id}/assign", response_model=JobResponse)
async def assign_issue(
    issue_id: UUID,
    data: AssignJobRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """Assign an issue to a supplier by creating a job."""
    result = await db.execute(
        select(MaintenanceIssue).where(MaintenanceIssue.id == issue_id)
    )
    issue = result.scalar_one_or_none()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )

    reference = await generate_job_reference(db)

    # Calculate estimated total
    estimated_total = None
    if data.estimated_labour_cost or data.estimated_materials_cost:
        estimated_total = (data.estimated_labour_cost or Decimal(0)) + (data.estimated_materials_cost or Decimal(0))

    job = MaintenanceJob(
        reference=reference,
        issue_id=issue_id,
        supplier_id=data.supplier_id,
        assigned_by_id=current_user.id,
        status=JobStatus.SENT_TO_SUPPLIER,
        description=data.description,
        instructions=data.instructions,
        required_skills=data.required_skills,
        scheduled_date=data.scheduled_date,
        scheduled_time_slot=data.scheduled_time_slot,
        estimated_duration_hours=data.estimated_duration_hours,
        estimated_labour_cost=data.estimated_labour_cost,
        estimated_materials_cost=data.estimated_materials_cost,
        estimated_total=estimated_total,
    )

    db.add(job)

    # Update issue status
    issue.status = IssueStatus.ASSIGNED

    await db.commit()
    await db.refresh(job)

    return job


@router.get("/jobs", response_model=List[JobResponse])
async def list_jobs(
    status: Optional[JobStatus] = None,
    supplier_id: Optional[UUID] = None,
    issue_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List maintenance jobs."""
    query = select(MaintenanceJob)

    # Suppliers only see their own jobs
    if current_user.role == UserRole.SUPPLIER:
        # Get supplier profile
        from app.models.supplier import Supplier
        supplier_result = await db.execute(
            select(Supplier).where(Supplier.user_id == current_user.id)
        )
        supplier = supplier_result.scalar_one_or_none()
        if supplier:
            query = query.where(MaintenanceJob.supplier_id == supplier.id)
        else:
            return []

    if status:
        query = query.where(MaintenanceJob.status == status)
    if supplier_id:
        query = query.where(MaintenanceJob.supplier_id == supplier_id)
    if issue_id:
        query = query.where(MaintenanceJob.issue_id == issue_id)

    result = await db.execute(query.order_by(MaintenanceJob.created_at.desc()))
    return result.scalars().all()


@router.put("/jobs/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: UUID,
    data: JobUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update a maintenance job."""
    result = await db.execute(
        select(MaintenanceJob).where(MaintenanceJob.id == job_id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    update_data = data.model_dump(exclude_unset=True)

    # Handle status transitions
    if 'status' in update_data:
        new_status = update_data['status']

        if new_status == JobStatus.ACCEPTED:
            job.accepted_at = datetime.utcnow()
        elif new_status == JobStatus.DECLINED:
            if not data.decline_reason:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Decline reason is required"
                )
        elif new_status == JobStatus.WORK_IN_PROGRESS:
            job.started_at = datetime.utcnow()
        elif new_status == JobStatus.COMPLETED:
            job.completed_at = datetime.utcnow()

            # Calculate actual total
            if job.actual_labour_cost or job.actual_materials_cost:
                job.actual_total = (job.actual_labour_cost or Decimal(0)) + (job.actual_materials_cost or Decimal(0))

            # Update issue status
            issue_result = await db.execute(
                select(MaintenanceIssue).where(MaintenanceIssue.id == job.issue_id)
            )
            issue = issue_result.scalar_one_or_none()
            if issue:
                issue.status = IssueStatus.COMPLETED
                issue.completed_at = datetime.utcnow()

    for field, value in update_data.items():
        setattr(job, field, value)

    await db.commit()
    await db.refresh(job)

    return job


@router.post("/jobs/{job_id}/evidence", response_model=JobResponse)
async def add_job_evidence(
    job_id: UUID,
    evidence_type: str = Query(..., pattern="^(before|after)$"),
    photos: List[dict] = [],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_supplier),
):
    """Add before/after photos to a job."""
    result = await db.execute(
        select(MaintenanceJob).where(MaintenanceJob.id == job_id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    if evidence_type == "before":
        existing = job.before_photos or []
        job.before_photos = existing + photos
    else:
        existing = job.after_photos or []
        job.after_photos = existing + photos

    await db.commit()
    await db.refresh(job)

    return job


@router.post("/jobs/{job_id}/complete", response_model=JobResponse)
async def complete_job(
    job_id: UUID,
    completion_notes: str,
    actual_labour_cost: Optional[Decimal] = None,
    actual_materials_cost: Optional[Decimal] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_supplier),
):
    """Mark a job as completed."""
    result = await db.execute(
        select(MaintenanceJob).where(MaintenanceJob.id == job_id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    if job.status not in [JobStatus.WORK_IN_PROGRESS, JobStatus.ON_SITE, JobStatus.AWAITING_PARTS]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete job in status: {job.status.value}"
        )

    job.status = JobStatus.COMPLETED
    job.completed_at = datetime.utcnow()
    job.completion_notes = completion_notes
    job.actual_labour_cost = actual_labour_cost
    job.actual_materials_cost = actual_materials_cost

    if actual_labour_cost or actual_materials_cost:
        job.actual_total = (actual_labour_cost or Decimal(0)) + (actual_materials_cost or Decimal(0))

    # Update issue
    issue_result = await db.execute(
        select(MaintenanceIssue).where(MaintenanceIssue.id == job.issue_id)
    )
    issue = issue_result.scalar_one_or_none()
    if issue:
        issue.status = IssueStatus.COMPLETED
        issue.completed_at = datetime.utcnow()

    await db.commit()
    await db.refresh(job)

    return job
