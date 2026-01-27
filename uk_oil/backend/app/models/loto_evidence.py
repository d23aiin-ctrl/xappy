"""
XAPPY AI LOTO (Lockout/Tagout) Evidence Details Model

Evidence capture for isolation verification.
"""

import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .report import Report


class LOTOEvidenceDetails(Base):
    """
    Extended details for LOTO (Lockout/Tagout) evidence.

    Captures isolation verification evidence with photos.
    """
    __tablename__ = "loto_evidence_details"

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

    # LOTO reference
    loto_number: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        index=True,
        comment="LOTO reference number if applicable"
    )
    related_ptw_number: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Related PTW number"
    )

    # Equipment being isolated
    equipment_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Equipment tag/ID"
    )
    equipment_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Equipment name/description"
    )
    equipment_location: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )

    # Energy sources
    energy_sources: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {type: electrical/pneumatic/hydraulic/etc, location, isolated}"
    )

    # Isolation points
    isolation_points: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {point_id, tag_number, location, locked_by, lock_number, photo_url}"
    )

    # Locks and tags applied
    locks_applied: Mapped[int] = mapped_column(
        Integer,
        default=0,
        comment="Number of locks applied"
    )
    tags_applied: Mapped[int] = mapped_column(
        Integer,
        default=0,
        comment="Number of tags applied"
    )
    lock_numbers: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of lock numbers used"
    )

    # Verification
    verification_method: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Method used: try_start, meter_reading, visual, bleed_down"
    )
    verification_result: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Result of verification test"
    )
    zero_energy_confirmed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Zero energy state confirmed"
    )
    verified_by: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Photo evidence
    lock_tag_photos: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of photo URLs showing locks and tags"
    )
    isolation_point_photos: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of photos of isolation points"
    )

    # Removal (if this is a LOTO removal record)
    is_removal: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="True if this is a LOTO removal record"
    )
    removal_authorized_by: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    removal_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    all_personnel_cleared: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True
    )

    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    report: Mapped["Report"] = relationship("Report", back_populates="loto_evidence_details")

    def __repr__(self) -> str:
        return f"<LOTOEvidenceDetails {self.equipment_name} - {self.locks_applied} locks>"
