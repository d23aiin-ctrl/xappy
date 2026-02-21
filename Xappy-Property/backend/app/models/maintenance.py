"""
XAPPY Maintenance Model

Issue reporting and maintenance job tracking.
"""

import enum
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import (
    String, Boolean, DateTime, Enum, Index, ForeignKey, Text, Integer, Numeric
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .user import User
    from .property import Property
    from .tenancy import Tenancy
    from .supplier import Supplier
    from .job_cost import JobCost


class IssueCategory(str, enum.Enum):
    """Maintenance issue categories"""
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    HEATING = "heating"
    APPLIANCES = "appliances"
    STRUCTURAL = "structural"
    WINDOWS_DOORS = "windows_doors"
    ROOFING = "roofing"
    DAMP_MOULD = "damp_mould"
    PEST_CONTROL = "pest_control"
    GARDEN_EXTERIOR = "garden_exterior"
    SECURITY = "security"
    FIRE_SAFETY = "fire_safety"
    GAS = "gas"
    CLEANING = "cleaning"
    GENERAL = "general"
    OTHER = "other"


class IssuePriority(str, enum.Enum):
    """
    Issue priority levels with SLA targets.

    SLA Configuration:
    - CRITICAL: 4 hours
    - HIGH: 24 hours
    - MEDIUM: 3 days (72 hours)
    - LOW: 7 days (168 hours)
    """
    CRITICAL = "critical"   # Emergency - immediate response needed
    HIGH = "high"           # Urgent - same day
    MEDIUM = "medium"       # Standard - within 3 days
    LOW = "low"             # Non-urgent - within 7 days


# SLA targets in hours
SLA_TARGETS = {
    IssuePriority.CRITICAL: 4,
    IssuePriority.HIGH: 24,
    IssuePriority.MEDIUM: 72,
    IssuePriority.LOW: 168,
}


class IssueStatus(str, enum.Enum):
    """Maintenance issue status"""
    REPORTED = "reported"               # Just reported
    ACKNOWLEDGED = "acknowledged"       # PM/landlord acknowledged
    ASSESSING = "assessing"             # Assessing the issue
    AWAITING_APPROVAL = "awaiting_approval"  # Needs landlord approval
    APPROVED = "approved"               # Approved for work
    ASSIGNED = "assigned"               # Assigned to supplier
    SCHEDULED = "scheduled"             # Work scheduled
    IN_PROGRESS = "in_progress"         # Work ongoing
    COMPLETED = "completed"             # Work completed
    VERIFIED = "verified"               # Verified by tenant/PM
    CLOSED = "closed"                   # Issue closed
    ON_HOLD = "on_hold"                 # On hold (waiting parts, etc.)
    CANCELLED = "cancelled"             # Cancelled


class JobStatus(str, enum.Enum):
    """Maintenance job status"""
    CREATED = "created"
    SENT_TO_SUPPLIER = "sent_to_supplier"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    SCHEDULED = "scheduled"
    EN_ROUTE = "en_route"
    ON_SITE = "on_site"
    WORK_IN_PROGRESS = "work_in_progress"
    PARTS_ORDERED = "parts_ordered"
    AWAITING_PARTS = "awaiting_parts"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class MaintenanceIssue(Base):
    """
    Maintenance issue reported by tenant or identified by PM/landlord.

    Features:
    - SLA tracking with escalation
    - Photo/video evidence
    - Priority-based routing
    - Approval workflows
    """
    __tablename__ = "maintenance_issues"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Reference
    reference: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
        comment="Issue reference (e.g., XP-ISS-001)"
    )

    # Links
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    tenancy_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenancies.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    reported_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Issue details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[IssueCategory] = mapped_column(
        Enum(IssueCategory),
        nullable=False,
        index=True
    )
    priority: Mapped[IssuePriority] = mapped_column(
        Enum(IssuePriority),
        default=IssuePriority.MEDIUM,
        nullable=False,
        index=True
    )
    status: Mapped[IssueStatus] = mapped_column(
        Enum(IssueStatus),
        default=IssueStatus.REPORTED,
        nullable=False,
        index=True
    )

    # Location within property
    location_in_property: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="kitchen, bathroom, bedroom_1, etc."
    )
    location_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Evidence (photos/videos)
    evidence_urls: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {url, type, description, uploaded_at}"
    )

    # SLA tracking
    sla_target_hours: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="SLA target in hours"
    )
    sla_deadline: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )
    sla_breached: Mapped[bool] = mapped_column(Boolean, default=False)
    sla_breached_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Acknowledgement
    acknowledged_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Approval (if needed)
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=False)
    approval_threshold: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="Cost threshold requiring landlord approval"
    )
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    approval_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Completion
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    verified_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    verification_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tenant_satisfaction: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="1-5 rating from tenant"
    )

    # Escalation
    escalated: Mapped[bool] = mapped_column(Boolean, default=False)
    escalation_level: Mapped[int] = mapped_column(Integer, default=0)
    escalated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    escalation_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Access
    access_instructions: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="How to access the property"
    )
    preferred_times: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Tenant's preferred appointment times"
    )

    # Notes
    internal_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Metadata
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Timestamps
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    rental_property: Mapped["Property"] = relationship(
        "Property",
        back_populates="maintenance_issues"
    )
    tenancy: Mapped[Optional["Tenancy"]] = relationship(
        "Tenancy",
        back_populates="maintenance_issues"
    )
    reported_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[reported_by_id],
        backref="reported_issues"
    )
    acknowledged_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[acknowledged_by_id],
        backref="acknowledged_issues"
    )
    approved_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[approved_by_id],
        backref="approved_issues"
    )
    verified_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[verified_by_id],
        backref="verified_issues"
    )
    jobs: Mapped[List["MaintenanceJob"]] = relationship(
        "MaintenanceJob",
        back_populates="issue",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_issues_property_status", "property_id", "status"),
        Index("ix_issues_priority_status", "priority", "status"),
        Index("ix_issues_sla_deadline", "sla_deadline"),
        Index("ix_issues_category", "category"),
    )

    def __repr__(self) -> str:
        return f"<MaintenanceIssue {self.reference}: {self.title[:30]}>"

    @property
    def is_overdue(self) -> bool:
        """Check if issue is past SLA deadline"""
        return datetime.now(self.sla_deadline.tzinfo) > self.sla_deadline

    @property
    def time_to_sla(self) -> Optional[timedelta]:
        """Time remaining until SLA deadline"""
        if self.status in [IssueStatus.CLOSED, IssueStatus.COMPLETED, IssueStatus.CANCELLED]:
            return None
        return self.sla_deadline - datetime.now(self.sla_deadline.tzinfo)


class MaintenanceJob(Base):
    """
    Individual maintenance job assigned to a supplier.

    An issue may have multiple jobs (multiple suppliers, follow-ups, etc.)
    """
    __tablename__ = "maintenance_jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Reference
    reference: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
        comment="Job reference (e.g., XP-JOB-001)"
    )

    # Links
    issue_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("maintenance_issues.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    supplier_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("suppliers.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    assigned_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # Status
    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus),
        default=JobStatus.CREATED,
        nullable=False,
        index=True
    )

    # Job details
    description: Mapped[str] = mapped_column(Text, nullable=False)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    required_skills: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of required skill tags"
    )

    # Scheduling
    scheduled_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    scheduled_time_slot: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="morning, afternoon, evening, all_day"
    )
    estimated_duration_hours: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Tracking
    accepted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Work evidence
    before_photos: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of photo URLs taken before work"
    )
    after_photos: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of photo URLs taken after work"
    )
    completion_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Cost estimate
    estimated_labour_cost: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )
    estimated_materials_cost: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )
    estimated_total: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )

    # Actual cost (filled after completion)
    actual_labour_cost: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )
    actual_materials_cost: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )
    actual_total: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )

    # Parts ordered
    parts_ordered: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {part, quantity, cost, supplier, eta}"
    )

    # Decline reason
    decline_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Failure details
    failed: Mapped[bool] = mapped_column(Boolean, default=False)
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    requires_follow_up: Mapped[bool] = mapped_column(Boolean, default=False)
    follow_up_job_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("maintenance_jobs.id", ondelete="SET NULL"),
        nullable=True
    )

    # Notes
    supplier_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Notes from supplier"
    )
    internal_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Internal PM/landlord notes"
    )

    # Metadata
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    issue: Mapped["MaintenanceIssue"] = relationship(
        "MaintenanceIssue",
        back_populates="jobs"
    )
    supplier: Mapped[Optional["Supplier"]] = relationship(
        "Supplier",
        back_populates="jobs"
    )
    assigned_by: Mapped[Optional["User"]] = relationship(
        "User",
        backref="assigned_jobs"
    )
    follow_up_job: Mapped[Optional["MaintenanceJob"]] = relationship(
        "MaintenanceJob",
        remote_side="MaintenanceJob.id",
        backref="original_job"
    )
    costs: Mapped[List["JobCost"]] = relationship(
        "JobCost",
        back_populates="job",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_jobs_issue_status", "issue_id", "status"),
        Index("ix_jobs_supplier_status", "supplier_id", "status"),
        Index("ix_jobs_scheduled", "scheduled_date"),
    )

    def __repr__(self) -> str:
        return f"<MaintenanceJob {self.reference}: {self.status.value}>"

    @property
    def cost_variance(self) -> Optional[Decimal]:
        """Calculate variance between estimated and actual cost"""
        if self.estimated_total and self.actual_total:
            return self.actual_total - self.estimated_total
        return None
