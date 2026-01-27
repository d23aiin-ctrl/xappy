"""
XAPPY AI Site and Area Models

Facilities, sites, and areas within the Oil & Gas operations.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import String, Boolean, DateTime, Enum, Index, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base


class SiteType(str, enum.Enum):
    """Type of Oil & Gas facility"""
    REFINERY = "refinery"
    PRODUCTION_PLATFORM = "production_platform"
    PIPELINE_STATION = "pipeline_station"
    TERMINAL = "terminal"
    DRILLING_RIG = "drilling_rig"
    PROCESSING_PLANT = "processing_plant"
    STORAGE_FACILITY = "storage_facility"
    DISTRIBUTION_CENTER = "distribution_center"
    OFFSHORE_PLATFORM = "offshore_platform"


class HazardClassification(str, enum.Enum):
    """Hazardous area classification per IEC 60079"""
    ZONE_0 = "zone_0"   # Continuous presence of explosive gas
    ZONE_1 = "zone_1"   # Likely to occur in normal operation
    ZONE_2 = "zone_2"   # Not likely to occur, if so for short period
    SAFE = "safe"       # Non-hazardous area


class Site(Base):
    """
    Site/Facility model.

    Represents an Oil & Gas installation (refinery, platform, etc.)
    """
    __tablename__ = "sites"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Identification
    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique site code (e.g., REF-MUM-01)"
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    site_type: Mapped[SiteType] = mapped_column(
        Enum(SiteType),
        nullable=False,
        index=True
    )

    # Location
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="India")
    coordinates: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="GPS coordinates {lat, lng}"
    )
    timezone: Mapped[str] = mapped_column(String(50), default="Asia/Kolkata")

    # Operations
    operating_company: Mapped[str] = mapped_column(String(255), nullable=False)
    license_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Contacts
    site_manager_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    site_manager_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    emergency_contacts: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {name, role, phone, available_24x7}"
    )

    # Capacity & Info
    employee_count: Mapped[Optional[int]] = mapped_column(nullable=True)
    contractor_count: Mapped[Optional[int]] = mapped_column(nullable=True)
    processing_capacity: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    # Metadata
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
    users: Mapped[List["User"]] = relationship("User", back_populates="site")
    areas: Mapped[List["Area"]] = relationship("Area", back_populates="site", cascade="all, delete-orphan")
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="site")

    def __repr__(self) -> str:
        return f"<Site {self.code}: {self.name}>"


class Area(Base):
    """
    Area model - specific zones/units within a site.

    Examples: Process Unit (CDU-1), Tank Farm, Control Room, etc.
    """
    __tablename__ = "areas"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Parent site
    site_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sites.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Identification
    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Area code (e.g., CDU-1, TANK-FARM)"
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    area_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Type: process_unit, storage, utilities, office, etc."
    )

    # Hazard classification
    hazard_classification: Mapped[HazardClassification] = mapped_column(
        Enum(HazardClassification),
        default=HazardClassification.SAFE,
        nullable=False
    )

    # Location within site
    building: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    floor_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Metadata
    equipment_list: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of major equipment in this area"
    )
    special_hazards: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of special hazards (H2S, high pressure, etc.)"
    )
    ppe_requirements: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Required PPE for this area"
    )

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
    site: Mapped["Site"] = relationship("Site", back_populates="areas")
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="area")

    __table_args__ = (
        Index("ix_areas_site_code", "site_id", "code", unique=True),
    )

    def __repr__(self) -> str:
        return f"<Area {self.code}: {self.name}>"
