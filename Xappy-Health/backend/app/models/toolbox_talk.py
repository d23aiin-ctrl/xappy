"""
XAPPY AI Toolbox Talk Details Model

Evidence capture for toolbox/safety meetings.
"""

import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .report import Report
    from .user import User


class ToolboxTalkDetails(Base):
    """
    Extended details for toolbox talk evidence.

    Records safety meeting details with attendance.
    """
    __tablename__ = "toolbox_talk_details"

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

    # Meeting details
    topic: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        comment="Main topic of the toolbox talk"
    )
    sub_topics: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of sub-topics covered"
    )
    conducted_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    meeting_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
    duration_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Duration in minutes"
    )

    # Attendance
    attendees: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {user_id, badge_number, name, signed_at, signature_url}"
    )
    attendee_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        comment="Total number of attendees"
    )
    contractor_attendees: Mapped[int] = mapped_column(
        Integer,
        default=0,
        comment="Number of contractor attendees"
    )

    # Content
    key_points_discussed: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of key points covered"
    )
    safety_reminders: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of safety reminders given"
    )
    hazards_highlighted: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of hazards highlighted during talk"
    )

    # Interaction
    questions_raised: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {question, asked_by, answer}"
    )
    concerns_raised: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of concerns raised by attendees"
    )

    # Follow-up
    action_items: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {action, assigned_to, due_date}"
    )

    # Evidence
    presentation_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="URL to presentation/materials used"
    )
    photo_evidence_urls: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of photo URLs showing meeting"
    )
    attendance_sheet_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="URL to signed attendance sheet"
    )

    # Related work
    related_permit_number: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Related PTW number if pre-job talk"
    )
    job_description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Description of job if pre-job toolbox talk"
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
    report: Mapped["Report"] = relationship("Report", back_populates="toolbox_talk_details")
    conducted_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[conducted_by_id])

    def __repr__(self) -> str:
        return f"<ToolboxTalkDetails '{self.topic}' - {self.attendee_count} attendees>"
