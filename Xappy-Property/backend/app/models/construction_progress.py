"""
XAPPY Property Construction Progress Details Model

Extended details for construction progress reports.
"""

import enum
import uuid
from datetime import datetime, date
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Integer, Boolean, DateTime, Date, Enum, ForeignKey, Text, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .report import Report


class ProgressStatus(str, enum.Enum):
    """Construction progress status"""
    ON_SCHEDULE = "on_schedule"
    AHEAD = "ahead"
    DELAYED = "delayed"
    CRITICAL_DELAY = "critical_delay"


class WeatherCondition(str, enum.Enum):
    """Weather conditions on site"""
    SUNNY = "sunny"
    CLOUDY = "cloudy"
    RAINY = "rainy"
    STORMY = "stormy"
    HOT = "hot"
    WINDY = "windy"


class ConstructionProgressDetails(Base):
    """
    Extended details for construction progress reports.

    Tracks daily/periodic construction progress on site.
    """
    __tablename__ = "construction_progress_details"

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

    # Location details
    building_block: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Building block or tower identifier (e.g., Tower A, Block 1)"
    )
    floor_level: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Floor level (e.g., Ground, 1st Floor, Basement)"
    )

    # Progress metrics
    planned_progress_percent: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Planned progress percentage (0-100)"
    )
    actual_progress_percent: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Actual progress percentage (0-100)"
    )
    progress_status: Mapped[ProgressStatus] = mapped_column(
        Enum(ProgressStatus),
        default=ProgressStatus.ON_SCHEDULE,
        nullable=False
    )

    # Workforce
    workers_present: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Number of workers on site"
    )
    contractors_present: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Number of contractor workers on site"
    )

    # Work activities
    activities_completed: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of activities completed today"
    )
    activities_planned: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of activities planned for next day"
    )

    # Delays and issues
    delays_if_any: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Description of any delays encountered"
    )
    delay_reason: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Primary reason for delay"
    )
    issues_faced: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of issues faced during construction"
    )

    # Weather
    weather_conditions: Mapped[Optional[WeatherCondition]] = mapped_column(
        Enum(WeatherCondition),
        nullable=True
    )
    weather_impact: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Impact of weather on construction"
    )

    # Materials
    materials_received: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of materials received {material, quantity, supplier}"
    )
    materials_used: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of materials used {material, quantity}"
    )

    # Equipment
    equipment_on_site: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of equipment on site {name, status}"
    )

    # Safety
    safety_incidents: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Were there any safety incidents?"
    )
    safety_notes: Mapped[Optional[str]] = mapped_column(
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
    report: Mapped["Report"] = relationship("Report", back_populates="construction_progress_details")

    def __repr__(self) -> str:
        return f"<ConstructionProgressDetails {self.building_block} - {self.actual_progress_percent}%>"
