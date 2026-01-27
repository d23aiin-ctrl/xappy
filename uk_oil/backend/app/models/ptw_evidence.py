"""
XAPPY AI PTW (Permit to Work) Evidence Details Model

Evidence logging for PTW - NOT approval workflow.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .report import Report


class PTWType(str, enum.Enum):
    """Types of Permit to Work"""
    HOT_WORK = "hot_work"
    COLD_WORK = "cold_work"
    CONFINED_SPACE = "confined_space"
    WORKING_AT_HEIGHT = "working_at_height"
    EXCAVATION = "excavation"
    ELECTRICAL = "electrical"
    RADIATION = "radiation"
    CRITICAL_LIFT = "critical_lift"
    BREAKING_CONTAINMENT = "breaking_containment"
    GENERAL = "general"


class PTWEvidenceDetails(Base):
    """
    Extended details for PTW evidence logging.

    IMPORTANT: This is evidence logging only - NOT approval workflow.
    No PTW approvals or rejections happen here.
    """
    __tablename__ = "ptw_evidence_details"

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

    # PTW Reference (from external system)
    ptw_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        comment="PTW reference number from permit system"
    )
    ptw_type: Mapped[PTWType] = mapped_column(
        Enum(PTWType),
        nullable=False
    )

    # Work details
    work_description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Description of work being performed"
    )
    work_location: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )

    # Pre-work verification evidence
    location_confirmed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Worker confirmed correct location"
    )
    isolations_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Required isolations verified"
    )
    isolation_points: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {point_id, type, status, verified_by}"
    )

    # Gas testing evidence
    gas_testing_required: Mapped[bool] = mapped_column(Boolean, default=False)
    gas_test_results: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {test_type, reading, limit, pass, tested_at, tested_by}"
    )

    # PPE verification
    ppe_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Required PPE verified"
    )
    ppe_items: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of required and verified PPE items"
    )

    # Pre-work checklist
    pre_work_checklist: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {item, checked, notes}"
    )
    all_precautions_in_place: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    # Crew
    crew_briefed: Mapped[bool] = mapped_column(Boolean, default=False)
    crew_members: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {name, badge, role, briefed_at}"
    )

    # Work start evidence
    work_started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Job close-out evidence
    work_completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    area_cleaned: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    isolations_removed: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    closeout_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Photo evidence
    evidence_photo_urls: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of photo URLs showing site conditions, isolations, etc."
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
    report: Mapped["Report"] = relationship("Report", back_populates="ptw_evidence_details")

    def __repr__(self) -> str:
        return f"<PTWEvidenceDetails {self.ptw_number} ({self.ptw_type.value})>"
