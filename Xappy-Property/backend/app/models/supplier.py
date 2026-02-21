"""
XAPPY Supplier Model

Maintenance suppliers and contractors.
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
    from .maintenance import MaintenanceJob


class SupplierStatus(str, enum.Enum):
    """Supplier account status"""
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"
    BLACKLISTED = "blacklisted"


class SupplierType(str, enum.Enum):
    """Type of supplier"""
    INDIVIDUAL = "individual"       # Self-employed tradesperson
    COMPANY = "company"             # Registered company
    AGENCY = "agency"               # Multi-trade agency


class Supplier(Base):
    """
    Maintenance supplier model.

    Suppliers can be matched to jobs based on:
    - Skills/trade categories
    - Location/service area
    - Availability
    - Rating/performance
    - Cost
    """
    __tablename__ = "suppliers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Link to user account (supplier portal access)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True
    )

    # Reference
    reference: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
        comment="Supplier reference (e.g., XP-SUP-001)"
    )

    # Basic info
    supplier_type: Mapped[SupplierType] = mapped_column(
        Enum(SupplierType),
        default=SupplierType.INDIVIDUAL,
        nullable=False
    )
    status: Mapped[SupplierStatus] = mapped_column(
        Enum(SupplierStatus),
        default=SupplierStatus.PENDING_APPROVAL,
        nullable=False,
        index=True
    )

    # Contact
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    trading_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    secondary_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Address
    address_line_1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line_2: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    county: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    postcode: Mapped[str] = mapped_column(String(20), nullable=False, index=True)

    # Service area
    service_radius_miles: Mapped[int] = mapped_column(
        Integer,
        default=25,
        comment="Maximum travel distance in miles"
    )
    service_postcodes: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of postcode prefixes they cover"
    )
    coordinates: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Base location {lat, lng}"
    )

    # Skills/trades
    skills: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        comment="Array of skill/trade tags"
    )
    primary_trade: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Main trade category"
    )
    certifications: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {name, number, expiry_date, verified}"
    )

    # Business details
    company_number: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Companies House registration number"
    )
    vat_registered: Mapped[bool] = mapped_column(Boolean, default=False)
    vat_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Insurance
    public_liability_insurance: Mapped[bool] = mapped_column(Boolean, default=False)
    public_liability_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2),
        nullable=True,
        comment="Coverage amount"
    )
    public_liability_expiry: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    employers_liability_insurance: Mapped[bool] = mapped_column(Boolean, default=False)
    employers_liability_expiry: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    professional_indemnity_insurance: Mapped[bool] = mapped_column(Boolean, default=False)
    professional_indemnity_expiry: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Gas Safe (for gas engineers)
    gas_safe_registered: Mapped[bool] = mapped_column(Boolean, default=False)
    gas_safe_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    gas_safe_expiry: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # NICEIC/Electrical
    niceic_registered: Mapped[bool] = mapped_column(Boolean, default=False)
    niceic_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Pricing
    hourly_rate: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )
    call_out_fee: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )
    emergency_rate_multiplier: Mapped[Decimal] = mapped_column(
        Numeric(3, 2),
        default=Decimal("1.5"),
        comment="Multiplier for emergency callouts"
    )
    accepts_card: Mapped[bool] = mapped_column(Boolean, default=True)
    accepts_invoice: Mapped[bool] = mapped_column(Boolean, default=True)
    payment_terms_days: Mapped[int] = mapped_column(
        Integer,
        default=30,
        comment="Standard payment terms in days"
    )

    # Availability
    availability: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Weekly availability schedule"
    )
    accepts_emergency: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Available for emergency callouts"
    )
    emergency_available: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Currently available for emergencies"
    )

    # Performance metrics
    total_jobs_completed: Mapped[int] = mapped_column(Integer, default=0)
    total_jobs_declined: Mapped[int] = mapped_column(Integer, default=0)
    average_rating: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(3, 2),
        nullable=True,
        comment="Average rating 1.00-5.00"
    )
    on_time_percentage: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        nullable=True,
        comment="Percentage of jobs completed on time"
    )
    first_fix_rate: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 2),
        nullable=True,
        comment="Percentage fixed on first visit"
    )

    # Verification
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    verified_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # Documents
    documents: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {type, url, verified, expiry_date}"
    )

    # Bank details (for payments)
    bank_account_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bank_sort_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    bank_account_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Notes
    internal_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    public_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    user: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[user_id],
        backref="supplier_profile"
    )
    verified_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[verified_by_id],
        backref="verified_suppliers"
    )
    jobs: Mapped[List["MaintenanceJob"]] = relationship(
        "MaintenanceJob",
        back_populates="supplier"
    )

    __table_args__ = (
        Index("ix_suppliers_status_trade", "status", "primary_trade"),
        # Note: postcode index is already created via index=True on the column
    )

    def __repr__(self) -> str:
        return f"<Supplier {self.reference}: {self.business_name}>"

    @property
    def is_active(self) -> bool:
        """Check if supplier is active and can receive jobs"""
        return self.status == SupplierStatus.ACTIVE

    @property
    def has_valid_insurance(self) -> bool:
        """Check if public liability insurance is valid"""
        if not self.public_liability_insurance:
            return False
        if self.public_liability_expiry:
            return datetime.now(self.public_liability_expiry.tzinfo) < self.public_liability_expiry
        return True

    @property
    def acceptance_rate(self) -> Optional[float]:
        """Calculate job acceptance rate"""
        total = self.total_jobs_completed + self.total_jobs_declined
        if total > 0:
            return (self.total_jobs_completed / total) * 100
        return None
