"""
XAPPY AI Near-Miss Report Details Model

Extended details for near-miss incident reports.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .report import Report


class NearMissCategory(str, enum.Enum):
    """Categories of near-miss incidents"""
    SLIP_TRIP_FALL = "slip_trip_fall"
    FALLING_OBJECT = "falling_object"
    DROPPED_OBJECT = "dropped_object"
    EQUIPMENT_MALFUNCTION = "equipment_malfunction"
    PRESSURE_RELEASE = "pressure_release"
    ELECTRICAL = "electrical"
    FIRE_POTENTIAL = "fire_potential"
    EXPLOSION_POTENTIAL = "explosion_potential"
    CHEMICAL_EXPOSURE = "chemical_exposure"
    GAS_LEAK = "gas_leak"
    CONFINED_SPACE = "confined_space"
    VEHICLE = "vehicle"
    LIFTING = "lifting"
    WORKING_AT_HEIGHT = "working_at_height"
    ERGONOMIC = "ergonomic"
    HOUSEKEEPING = "housekeeping"
    PPE_ISSUE = "ppe_issue"
    PROCEDURE_VIOLATION = "procedure_violation"
    COMMUNICATION = "communication"
    OTHER = "other"


class PotentialSeverity(str, enum.Enum):
    """Potential severity if the near-miss had resulted in an incident"""
    LOW = "low"                 # Minor injury possible
    MEDIUM = "medium"           # Moderate injury possible
    HIGH = "high"               # Serious injury possible
    CATASTROPHIC = "catastrophic"  # Fatality or major accident possible


class NearMissDetails(Base):
    """
    Extended details for near-miss reports.

    Linked to base Report via one-to-one relationship.
    """
    __tablename__ = "near_miss_details"

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
    category: Mapped[NearMissCategory] = mapped_column(
        Enum(NearMissCategory),
        nullable=False,
        index=True
    )
    potential_severity: Mapped[PotentialSeverity] = mapped_column(
        Enum(PotentialSeverity),
        default=PotentialSeverity.MEDIUM,
        nullable=False
    )

    # Context
    people_in_area: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Number of people in the area when near-miss occurred"
    )
    work_being_performed: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="What work was being performed at the time"
    )

    # Immediate response
    immediate_actions_taken: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="What actions were taken immediately"
    )
    area_secured: Mapped[Optional[bool]] = mapped_column(
        nullable=True,
        comment="Was the area secured after the near-miss"
    )

    # Equipment involved
    equipment_involved: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {equipment_id, equipment_type, equipment_name}"
    )

    # Environmental conditions
    environmental_conditions: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="{weather, lighting, noise_level, temperature, visibility}"
    )

    # Contributing factors
    contributing_factors: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of contributing factors"
    )

    # Preventive measures
    suggested_preventive_actions: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Worker's suggested preventive measures"
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
    report: Mapped["Report"] = relationship("Report", back_populates="near_miss_details")

    def __repr__(self) -> str:
        return f"<NearMissDetails {self.category.value} - {self.potential_severity.value}>"
