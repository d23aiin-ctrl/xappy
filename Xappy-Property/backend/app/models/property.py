"""
XAPPY Property Model

Rental properties managed on the platform.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import (
    String, Boolean, DateTime, Enum, Index, ForeignKey, Text, Integer, Numeric
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .user import User
    from .tenancy import Tenancy
    from .maintenance import MaintenanceIssue
    from .compliance import ComplianceRecord


class PropertyType(str, enum.Enum):
    """Type of rental property"""
    FLAT = "flat"
    HOUSE = "house"
    STUDIO = "studio"
    ROOM = "room"                    # HMO room
    BUNGALOW = "bungalow"
    MAISONETTE = "maisonette"
    COMMERCIAL = "commercial"


class PropertyStatus(str, enum.Enum):
    """Property availability status"""
    AVAILABLE = "available"           # Ready to let
    LET = "let"                       # Currently tenanted
    UNDER_OFFER = "under_offer"       # Application in progress
    UNAVAILABLE = "unavailable"       # Not being marketed
    MAINTENANCE = "maintenance"       # Under maintenance/repair


class FurnishingType(str, enum.Enum):
    """Furnishing level"""
    UNFURNISHED = "unfurnished"
    PART_FURNISHED = "part_furnished"
    FURNISHED = "furnished"


class Property(Base):
    """
    Rental property model.

    Each property belongs to a landlord and can be managed by a property manager.
    """
    __tablename__ = "properties"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Reference
    reference: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique property reference (e.g., XP-PROP-001)"
    )

    # Ownership
    landlord_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Property owner"
    )
    property_manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Assigned property manager"
    )

    # Property Details
    property_type: Mapped[PropertyType] = mapped_column(
        Enum(PropertyType),
        nullable=False,
        index=True
    )
    status: Mapped[PropertyStatus] = mapped_column(
        Enum(PropertyStatus),
        default=PropertyStatus.AVAILABLE,
        nullable=False,
        index=True
    )

    # Address
    address_line_1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line_2: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    county: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    postcode: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    country: Mapped[str] = mapped_column(String(100), default="United Kingdom")

    # Location
    coordinates: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="GPS coordinates {lat, lng}"
    )

    # Property Specs
    bedrooms: Mapped[int] = mapped_column(Integer, default=1)
    bathrooms: Mapped[int] = mapped_column(Integer, default=1)
    reception_rooms: Mapped[int] = mapped_column(Integer, default=1)
    floor_area_sqft: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    floor_level: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Floor number (0 = ground)"
    )
    total_floors: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Features
    furnishing: Mapped[FurnishingType] = mapped_column(
        Enum(FurnishingType),
        default=FurnishingType.UNFURNISHED,
        nullable=False
    )
    has_parking: Mapped[bool] = mapped_column(Boolean, default=False)
    has_garden: Mapped[bool] = mapped_column(Boolean, default=False)
    has_balcony: Mapped[bool] = mapped_column(Boolean, default=False)
    pets_allowed: Mapped[bool] = mapped_column(Boolean, default=False)
    smoking_allowed: Mapped[bool] = mapped_column(Boolean, default=False)
    is_hmo: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="House in Multiple Occupation"
    )

    # Amenities (JSONB array)
    amenities: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of amenity strings"
    )

    # Financial
    rent_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        comment="Monthly rent in GBP"
    )
    deposit_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="Security deposit amount"
    )
    deposit_weeks: Mapped[int] = mapped_column(
        Integer,
        default=5,
        comment="Deposit in weeks of rent"
    )
    holding_deposit_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="Holding deposit (max 1 week rent)"
    )

    # EPC
    epc_rating: Mapped[Optional[str]] = mapped_column(
        String(1),
        nullable=True,
        comment="Energy rating A-G"
    )
    epc_certificate_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    epc_expiry_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Marketing
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    available_from: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    minimum_tenancy_months: Mapped[int] = mapped_column(Integer, default=6)
    maximum_tenancy_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Photos (JSONB array of URLs)
    photos: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {url, caption, is_primary, order}"
    )
    floor_plan_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    virtual_tour_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

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
    landlord: Mapped["User"] = relationship(
        "User",
        foreign_keys=[landlord_id],
        backref="owned_properties"
    )
    property_manager: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[property_manager_id],
        backref="managed_properties"
    )
    tenancies: Mapped[List["Tenancy"]] = relationship(
        "Tenancy",
        back_populates="rental_property",
        cascade="all, delete-orphan"
    )
    maintenance_issues: Mapped[List["MaintenanceIssue"]] = relationship(
        "MaintenanceIssue",
        back_populates="rental_property",
        cascade="all, delete-orphan"
    )
    compliance_records: Mapped[List["ComplianceRecord"]] = relationship(
        "ComplianceRecord",
        back_populates="rental_property",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_properties_landlord_status", "landlord_id", "status"),
        Index("ix_properties_manager_status", "property_manager_id", "status"),
        Index("ix_properties_city_type", "city", "property_type"),
        # Note: postcode index is already created via index=True on the column
    )

    def __repr__(self) -> str:
        return f"<Property {self.reference}: {self.address_line_1}>"

    @property
    def full_address(self) -> str:
        """Get formatted full address"""
        parts = [self.address_line_1]
        if self.address_line_2:
            parts.append(self.address_line_2)
        parts.extend([self.city, self.postcode])
        return ", ".join(parts)

    @property
    def weekly_rent(self) -> Decimal:
        """Calculate weekly rent from monthly"""
        return (self.rent_amount * 12) / 52

    @property
    def calculated_deposit(self) -> Decimal:
        """Calculate deposit based on weeks"""
        return self.weekly_rent * self.deposit_weeks
