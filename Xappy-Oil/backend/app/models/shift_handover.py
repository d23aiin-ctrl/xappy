"""
XAPPY AI Shift Handover Details Model

Voice-to-structured shift handover summaries.
"""

import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .report import Report
    from .user import User


class ShiftHandoverDetails(Base):
    """
    Extended details for shift handover reports.

    Captures voice recording and structured summary.
    """
    __tablename__ = "shift_handover_details"

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

    # Shift information
    outgoing_shift: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        comment="Outgoing shift (A, B, C, D, Day, Night)"
    )
    incoming_shift: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        comment="Incoming shift"
    )
    outgoing_supervisor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    incoming_supervisor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    handover_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    # Voice recording
    voice_recording_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="URL to stored voice recording"
    )
    voice_duration_seconds: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    transcription: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Full transcription of voice recording"
    )
    transcription_confidence: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Confidence score of transcription"
    )
    transcription_language: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True
    )

    # Structured summary (extracted from voice or text)
    safety_status_summary: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Overall safety status"
    )
    active_permits: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {ptw_number, type, work_description, status, expires_at}"
    )
    ongoing_work: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {description, location, crew_size, expected_completion}"
    )
    equipment_status: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {equipment_id, name, status, notes}"
    )
    pending_issues: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {issue, priority, action_required}"
    )
    completed_tasks: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of tasks completed during shift"
    )
    handover_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Additional notes for incoming shift"
    )

    # Process status
    production_status: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Production/process status summary"
    )
    key_parameters: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Key process parameters {parameter: value}"
    )

    # Acknowledgment
    acknowledged_by_incoming: Mapped[bool] = mapped_column(default=False)
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
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

    # Relationships
    report: Mapped["Report"] = relationship("Report", back_populates="shift_handover_details")
    outgoing_supervisor: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[outgoing_supervisor_id]
    )
    incoming_supervisor: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[incoming_supervisor_id]
    )

    def __repr__(self) -> str:
        return f"<ShiftHandoverDetails {self.outgoing_shift} -> {self.incoming_shift}>"
