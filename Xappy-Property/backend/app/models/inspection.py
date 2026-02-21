"""
XAPPY Property Inspection Details Model

Site inspection and quality audit logging.
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
    from .user import User


class InspectionType(str, enum.Enum):
    """Types of property development inspections"""
    FOUNDATION_INSPECTION = "foundation_inspection"
    STRUCTURAL_INSPECTION = "structural_inspection"
    MEP_INSPECTION = "mep_inspection"
    QUALITY_AUDIT = "quality_audit"
    PRE_HANDOVER = "pre_handover"
    RERA_COMPLIANCE = "rera_compliance"
    SAFETY_INSPECTION = "safety_inspection"
    FINISHING_INSPECTION = "finishing_inspection"
    OTHER = "other"


class FindingSeverity(str, enum.Enum):
    """Severity of inspection findings"""
    CRITICAL = "critical"     # Immediate action required
    MAJOR = "major"           # Action within 24-48 hours
    MINOR = "minor"           # Action within 7 days
    OBSERVATION = "observation"  # For information/improvement


class InspectionDetails(Base):
    """
    Extended details for inspection/walkdown logs.
    """
    __tablename__ = "inspection_details"

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

    # Inspection details
    inspection_type: Mapped[InspectionType] = mapped_column(
        Enum(InspectionType),
        nullable=False,
        index=True
    )
    checklist_template_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Reference to checklist template used"
    )
    inspection_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )
    start_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    end_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    duration_minutes: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )

    # Areas covered
    areas_covered: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of area codes/names inspected"
    )

    # Findings
    findings: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {finding, severity, location, equipment, photo_url, recommendation}"
    )
    findings_count: Mapped[int] = mapped_column(
        Integer,
        default=0
    )
    critical_findings_count: Mapped[int] = mapped_column(
        Integer,
        default=0
    )
    major_findings_count: Mapped[int] = mapped_column(
        Integer,
        default=0
    )
    minor_findings_count: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    # Observations (non-issue items)
    observations: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of general observations"
    )
    positive_observations: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of positive observations (good practices)"
    )

    # Checklist items (if using structured checklist)
    checklist_items: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {item, category, status: pass/fail/na, notes}"
    )
    checklist_pass_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    checklist_fail_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    checklist_na_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Recommendations and follow-up
    recommendations: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of recommendations"
    )
    follow_up_required: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )
    follow_up_deadline: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True
    )
    follow_up_assigned_to: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )

    # Team
    inspection_team: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {name, badge, role}"
    )

    # Summary
    overall_condition: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Overall rating: satisfactory, needs_improvement, unsatisfactory"
    )
    summary_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
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
    report: Mapped["Report"] = relationship("Report", back_populates="inspection_details")

    def __repr__(self) -> str:
        return f"<InspectionDetails {self.inspection_type.value} - {self.findings_count} findings>"
