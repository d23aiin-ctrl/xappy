"""
XAPPY Property Base Report Model

Base model for all construction and compliance reports.
Uses single-table inheritance pattern with joined tables for type-specific details.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import (
    String, Boolean, DateTime, Enum, Index, ForeignKey, Text, Integer
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .user import User
    from .site import Site, Area
    from .media_attachment import MediaAttachment
    from .audit_trail import AuditTrail
    from .conversation import Conversation


class ReportType(str, enum.Enum):
    """Types of construction/compliance reports"""
    CONSTRUCTION_PROGRESS = "construction_progress"
    DEFECT_SNAG = "defect_snag"
    SAFETY_INCIDENT = "safety_incident"
    SITE_INSPECTION = "site_inspection"
    DAILY_PROGRESS_LOG = "daily_progress_log"
    SHIFT_HANDOVER = "shift_handover"
    TOOLBOX_TALK = "toolbox_talk"


class ReportStatus(str, enum.Enum):
    """Report status workflow"""
    DRAFT = "draft"               # Being collected via chat
    SUBMITTED = "submitted"       # Submitted by worker
    ACKNOWLEDGED = "acknowledged" # Acknowledged by supervisor
    UNDER_REVIEW = "under_review" # Under investigation/review
    CLOSED = "closed"             # Closed/completed
    ARCHIVED = "archived"         # Archived for compliance


class ReportSource(str, enum.Enum):
    """Report source types"""
    WEB = "web"
    MOBILE = "mobile"
    API = "api"


# Reference number prefixes by report type
REPORT_TYPE_PREFIX = {
    ReportType.CONSTRUCTION_PROGRESS: "CP",
    ReportType.DEFECT_SNAG: "DS",
    ReportType.SAFETY_INCIDENT: "SI",
    ReportType.SITE_INSPECTION: "IN",
    ReportType.DAILY_PROGRESS_LOG: "DL",
    ReportType.SHIFT_HANDOVER: "SH",
    ReportType.TOOLBOX_TALK: "TT",
}


class Report(Base):
    """
    Base Report model for all construction and compliance reports.

    Reference number format: XP-{TYPE}-{YYYYMMDD}-{SEQUENCE}
    Example: XP-CP-20260102-0001 (Construction Progress)
    """
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Reference number (human-readable unique identifier)
    reference_number: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        index=True,
        nullable=False,
        comment="Format: XP-{TYPE}-{YYYYMMDD}-{SEQUENCE}"
    )

    # Report type
    report_type: Mapped[ReportType] = mapped_column(
        Enum(ReportType),
        nullable=False,
        index=True
    )

    # Who reported
    reporter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,  # Allow null for imported historical data
        index=True
    )

    # Where (Site & Area)
    site_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sites.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    area_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("areas.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # When
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="When the report was submitted"
    )
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="When the event/observation occurred"
    )

    # Core content (common to all report types)
    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        comment="Brief title/summary"
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Detailed description (may be translated)"
    )
    description_original: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Original description in source language"
    )
    original_language: Mapped[str] = mapped_column(
        String(10),
        default="en",
        comment="Language of original input"
    )

    # Location details
    location_description: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="Human-readable location description"
    )
    gps_coordinates: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="GPS coordinates {lat, lng}"
    )

    # Status tracking
    status: Mapped[ReportStatus] = mapped_column(
        Enum(ReportStatus),
        default=ReportStatus.SUBMITTED,
        nullable=False,
        index=True
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    acknowledged_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    closed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    closed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # AI processing
    ai_classification: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="AI classification {category, confidence, suggestions}"
    )
    ai_summary: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="AI-generated summary"
    )
    ai_keywords: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Extracted keywords for search"
    )

    # Source tracking
    source: Mapped[str] = mapped_column(
        String(50),
        default="web",
        comment="Source: web, mobile, api"
    )
    source_message_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Original message ID from source platform"
    )
    conversation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="SET NULL"),
        nullable=True,
        comment="Linked conversation if created via chat"
    )

    # Attachment count (denormalized for performance)
    attachment_count: Mapped[int] = mapped_column(Integer, default=0)

    # Metadata
    extra_data: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Additional structured data"
    )

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
    reporter: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="reports",
        foreign_keys=[reporter_id]
    )
    acknowledged_by: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="acknowledged_reports",
        foreign_keys=[acknowledged_by_id]
    )
    site: Mapped[Optional["Site"]] = relationship("Site", back_populates="reports")
    area: Mapped[Optional["Area"]] = relationship("Area", back_populates="reports")
    attachments: Mapped[List["MediaAttachment"]] = relationship(
        "MediaAttachment",
        back_populates="report",
        cascade="all, delete-orphan"
    )
    audit_entries: Mapped[List["AuditTrail"]] = relationship(
        "AuditTrail",
        back_populates="report",
        cascade="all, delete-orphan"
    )
    conversation: Mapped[Optional["Conversation"]] = relationship(
        "Conversation",
        back_populates="reports"
    )

    # Type-specific details (one-to-one relationships)
    construction_progress_details: Mapped[Optional["ConstructionProgressDetails"]] = relationship(
        "ConstructionProgressDetails",
        back_populates="report",
        uselist=False,
        cascade="all, delete-orphan"
    )
    defect_report_details: Mapped[Optional["DefectReportDetails"]] = relationship(
        "DefectReportDetails",
        back_populates="report",
        uselist=False,
        cascade="all, delete-orphan"
    )
    incident_details: Mapped[Optional["IncidentDetails"]] = relationship(
        "IncidentDetails",
        back_populates="report",
        uselist=False,
        cascade="all, delete-orphan"
    )
    shift_handover_details: Mapped[Optional["ShiftHandoverDetails"]] = relationship(
        "ShiftHandoverDetails",
        back_populates="report",
        uselist=False,
        cascade="all, delete-orphan"
    )
    toolbox_talk_details: Mapped[Optional["ToolboxTalkDetails"]] = relationship(
        "ToolboxTalkDetails",
        back_populates="report",
        uselist=False,
        cascade="all, delete-orphan"
    )
    inspection_details: Mapped[Optional["InspectionDetails"]] = relationship(
        "InspectionDetails",
        back_populates="report",
        uselist=False,
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_reports_site_type_status", "site_id", "report_type", "status"),
        Index("ix_reports_reporter_date", "reporter_id", "reported_at"),
        Index("ix_reports_occurred_at", "occurred_at"),
        Index("ix_reports_type_date", "report_type", "reported_at"),
    )

    def __repr__(self) -> str:
        return f"<Report {self.reference_number} ({self.report_type.value})>"


# Import type-specific models to resolve forward references
from .construction_progress import ConstructionProgressDetails
from .defect_report import DefectReportDetails
from .incident import IncidentDetails
from .shift_handover import ShiftHandoverDetails
from .toolbox_talk import ToolboxTalkDetails
from .inspection import InspectionDetails
