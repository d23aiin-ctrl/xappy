"""
XAPPY AI Spill Report Details Model

Environmental spill/release reporting.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Float, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .report import Report


class SpillType(str, enum.Enum):
    """Types of spills/releases"""
    CRUDE_OIL = "crude_oil"
    REFINED_OIL = "refined_oil"
    DIESEL = "diesel"
    GASOLINE = "gasoline"
    HYDRAULIC_FLUID = "hydraulic_fluid"
    LUBRICANT = "lubricant"
    CHEMICAL = "chemical"
    PRODUCED_WATER = "produced_water"
    COOLING_WATER = "cooling_water"
    PROCESS_FLUID = "process_fluid"
    GAS_RELEASE = "gas_release"
    OTHER = "other"


class SpillReportDetails(Base):
    """
    Extended details for environmental spill reports.
    """
    __tablename__ = "spill_report_details"

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

    # Spill identification
    spill_type: Mapped[SpillType] = mapped_column(
        Enum(SpillType),
        nullable=False,
        index=True
    )
    material_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Specific material name"
    )
    material_msds_number: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="MSDS/SDS reference number"
    )

    # Quantity
    estimated_volume_liters: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Estimated volume in liters"
    )
    volume_uncertainty: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Uncertainty range (e.g., '10-20 liters')"
    )

    # Source
    source_description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Source of the spill"
    )
    source_equipment: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    cause_if_known: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # Containment
    contained: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Is the spill contained"
    )
    containment_method: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="How was it contained (bund, absorbent, etc.)"
    )
    spill_ongoing: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Is the spill still ongoing"
    )
    source_isolated: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True
    )

    # Environmental impact
    reached_water: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Did spill reach water bodies"
    )
    water_body_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    reached_soil: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Did spill reach unpaved soil"
    )
    affected_area_sqm: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Affected area in square meters"
    )
    wildlife_affected: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True
    )

    # Cleanup
    cleanup_initiated: Mapped[bool] = mapped_column(Boolean, default=False)
    cleanup_method: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    cleanup_contractor: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    estimated_cleanup_time: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    waste_disposal_method: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )

    # Regulatory
    regulatory_threshold_exceeded: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Does this exceed regulatory reporting threshold"
    )
    reportable_quantity_liters: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Regulatory reportable quantity"
    )
    authorities_notified: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {authority, notified_at, reference, notified_by}"
    )

    # Impact description
    environmental_impact_description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    # Photo evidence
    spill_photos: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of photo URLs"
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
    report: Mapped["Report"] = relationship("Report", back_populates="spill_report_details")

    def __repr__(self) -> str:
        return f"<SpillReportDetails {self.spill_type.value} - {self.estimated_volume_liters}L>"
