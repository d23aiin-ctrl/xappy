"""
XAPPY Property Defect/Snag Report Details Model

Extended details for defect and snag reports.
"""

import enum
import uuid
from datetime import datetime, date
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, Boolean, DateTime, Date, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .report import Report


class DefectCategory(str, enum.Enum):
    """Categories of defects/snags"""
    STRUCTURAL = "structural"
    WATERPROOFING = "waterproofing"
    ELECTRICAL = "electrical"
    PLUMBING = "plumbing"
    FINISHING = "finishing"
    CARPENTRY = "carpentry"
    HVAC = "hvac"
    FIRE_SAFETY = "fire_safety"
    PAINTING = "painting"
    FLOORING = "flooring"
    GLAZING = "glazing"
    OTHER = "other"


class DefectPriority(str, enum.Enum):
    """Priority levels for defects"""
    CRITICAL = "critical"   # Immediate action required
    HIGH = "high"           # Urgent - within 24-48 hours
    MEDIUM = "medium"       # Within 7 days
    LOW = "low"             # Can be scheduled


class DefectStatus(str, enum.Enum):
    """Status of defect resolution"""
    OPEN = "open"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    PENDING_VERIFICATION = "pending_verification"
    CLOSED = "closed"
    DEFERRED = "deferred"


class DefectReportDetails(Base):
    """
    Extended details for defect/snag reports.

    Tracks defects found during construction or pre-handover inspections.
    """
    __tablename__ = "defect_report_details"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Link to base report
    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    # Defect classification
    category: Mapped[DefectCategory] = mapped_column(
        Enum(DefectCategory),
        nullable=False,
        index=True
    )
    priority: Mapped[DefectPriority] = mapped_column(
        Enum(DefectPriority),
        default=DefectPriority.MEDIUM,
        nullable=False,
        index=True
    )
    defect_status: Mapped[DefectStatus] = mapped_column(
        Enum(DefectStatus),
        default=DefectStatus.OPEN,
        nullable=False,
        index=True
    )

    # Location details
    building_block: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Building block or tower identifier"
    )
    floor_level: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Floor level"
    )
    unit_number: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Unit/apartment number"
    )
    room_area: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Specific room or area (e.g., Master Bedroom, Kitchen)"
    )

    # Defect details
    defect_description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed description of the defect"
    )
    root_cause: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Root cause analysis if known"
    )

    # Responsibility
    contractor_responsible: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Contractor company responsible for the work"
    )
    assigned_to_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Timeline
    target_completion_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Target date for defect resolution"
    )
    actual_completion_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Actual date when defect was resolved"
    )
    days_open: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Number of days the defect has been open"
    )

    # Resolution
    resolution_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Notes on how the defect was resolved"
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

    # Cost tracking
    estimated_cost: Mapped[Optional[float]] = mapped_column(
        nullable=True,
        comment="Estimated cost to fix the defect"
    )
    actual_cost: Mapped[Optional[float]] = mapped_column(
        nullable=True,
        comment="Actual cost incurred"
    )

    # Related defects
    is_recurring: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Is this a recurring defect?"
    )
    related_defect_ids: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of related defect report IDs"
    )

    # Additional metadata
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

    # Relationship
    report: Mapped["Report"] = relationship("Report", back_populates="defect_report_details")

    def __repr__(self) -> str:
        return f"<DefectReportDetails {self.category.value} - {self.priority.value} - {self.defect_status.value}>"
