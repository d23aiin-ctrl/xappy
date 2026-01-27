"""
XAPPY AI Incident Report Details Model

Extended details for incident initial reports.
Note: This is for initial reporting only, not full investigation.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .report import Report


class IncidentType(str, enum.Enum):
    """Types of incidents"""
    INJURY = "injury"
    NEAR_MISS_ESCALATED = "near_miss_escalated"
    PROPERTY_DAMAGE = "property_damage"
    ENVIRONMENTAL = "environmental"
    PROCESS_UPSET = "process_upset"
    SECURITY = "security"
    FIRE = "fire"
    EXPLOSION = "explosion"
    VEHICLE_ACCIDENT = "vehicle_accident"
    ELECTRICAL = "electrical"
    CHEMICAL_RELEASE = "chemical_release"
    OTHER = "other"


class SeverityLevel(str, enum.Enum):
    """Actual severity of the incident"""
    FIRST_AID = "first_aid"           # First aid case only
    MEDICAL_TREATMENT = "medical_treatment"  # Medical treatment case
    RESTRICTED_WORK = "restricted_work"  # Restricted work case
    LOST_WORKDAY = "lost_workday"     # Lost workday case
    PERMANENT_DISABILITY = "permanent_disability"
    FATALITY = "fatality"
    PROPERTY_ONLY = "property_only"   # No injuries
    ENVIRONMENTAL_ONLY = "environmental_only"


class IncidentDetails(Base):
    """
    Extended details for incident initial reports.

    This captures initial report details only.
    Full investigation is out of scope.
    """
    __tablename__ = "incident_details"

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

    # Classification
    incident_type: Mapped[IncidentType] = mapped_column(
        Enum(IncidentType),
        nullable=False,
        index=True
    )
    severity_actual: Mapped[SeverityLevel] = mapped_column(
        Enum(SeverityLevel),
        nullable=False
    )

    # Injuries
    people_injured: Mapped[int] = mapped_column(Integer, default=0)
    injury_description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Brief description of injuries"
    )
    medical_attention_required: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True
    )
    hospitalization_required: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True
    )

    # What happened
    immediate_cause: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Immediate/direct cause of incident"
    )
    sequence_of_events: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Brief sequence of events"
    )

    # Emergency response
    was_emergency_response_activated: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True
    )
    emergency_services_called: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True
    )

    # Authorities
    authorities_notified: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {authority, notified_at, reference_number, notified_by}"
    )

    # Witnesses
    witnesses: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {name, badge_number, phone, statement}"
    )

    # Immediate actions
    immediate_actions_taken: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    area_secured: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True
    )
    operations_affected: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True
    )

    # Equipment/Property damage
    property_damaged: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    property_damage_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estimated_damage_cost: Mapped[Optional[float]] = mapped_column(nullable=True)

    # Note: Root cause analysis is OUT OF SCOPE - this is initial report only

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
    report: Mapped["Report"] = relationship("Report", back_populates="incident_details")

    def __repr__(self) -> str:
        return f"<IncidentDetails {self.incident_type.value} - {self.severity_actual.value}>"
