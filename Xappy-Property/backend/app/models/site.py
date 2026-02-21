"""
XAPPY Property Site and Area Models

Sites, projects, and areas within Property Development operations.
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
    """Type of property development project"""
    RESIDENTIAL_SOCIETY = "residential_society"
    RESIDENTIAL_VILLA = "residential_villa"
    COMMERCIAL_OFFICE = "commercial_office"
    COMMERCIAL_MALL = "commercial_mall"
    MIXED_USE = "mixed_use"
    HOSPITALITY = "hospitality"


class AreaClassification(str, enum.Enum):
    """Area classification for property development sites"""
    RESIDENTIAL = "residential"               # Residential units/towers
    COMMERCIAL = "commercial"                 # Commercial spaces
    AMENITY = "amenity"                       # Clubhouse, pool, gym
    PARKING = "parking"                       # Basement/multi-level parking
    EXTERNAL = "external"                     # Landscaping, external areas
    CONSTRUCTION_ZONE = "construction_zone"   # Active construction area
    STORAGE_AREA = "storage_area"             # Material storage
    OFFICE_AREA = "office_area"               # Site offices
    COMMON_AREA = "common_area"               # Common/public areas
    RESTRICTED = "restricted"                 # Restricted access area


class Site(Base):
    """
    Site/Project model.

    Represents a property development project (residential, commercial, etc.)
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
        comment="Unique project code (e.g., PRJ-MUM-01)"
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

    # Project Info
    developer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    rera_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Contacts
    project_manager_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    project_manager_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    emergency_contacts: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {name, role, phone, available_24x7}"
    )

    # Capacity & Info
    total_units: Mapped[Optional[int]] = mapped_column(nullable=True)
    total_floors: Mapped[Optional[int]] = mapped_column(nullable=True)
    total_towers: Mapped[Optional[int]] = mapped_column(nullable=True)
    employee_count: Mapped[Optional[int]] = mapped_column(nullable=True)
    contractor_count: Mapped[Optional[int]] = mapped_column(nullable=True)

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
    Area model - specific zones/units within a project site.

    Examples: Tower A, Block B, Basement, Podium, etc.
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
        comment="Area code (e.g., TOWER-A, BLOCK-1)"
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    area_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Type: tower, block, basement, podium, amenities, etc."
    )

    # Area classification
    area_classification: Mapped[AreaClassification] = mapped_column(
        Enum(AreaClassification),
        default=AreaClassification.CONSTRUCTION_ZONE,
        nullable=False
    )

    # Location within site
    building: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    floor_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Metadata
    unit_count: Mapped[Optional[int]] = mapped_column(nullable=True)
    floor_count: Mapped[Optional[int]] = mapped_column(nullable=True)
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
