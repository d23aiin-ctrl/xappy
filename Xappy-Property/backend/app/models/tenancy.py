"""
XAPPY Tenancy Model

Active tenancy agreements between tenants and properties.
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
    from .property import Property
    from .tenant import Tenant
    from .contract import TenancyAgreement
    from .maintenance import MaintenanceIssue


class TenancyStatus(str, enum.Enum):
    """Tenancy lifecycle status"""
    DRAFT = "draft"                     # Being set up
    PENDING_START = "pending_start"     # Signed, awaiting start date
    ACTIVE = "active"                   # Currently active
    PERIODIC = "periodic"               # Rolled to periodic (month-to-month)
    NOTICE_GIVEN = "notice_given"       # Notice period active
    ENDING = "ending"                   # Within 2 weeks of end
    ENDED = "ended"                     # Completed normally
    TERMINATED = "terminated"           # Early termination
    CANCELLED = "cancelled"             # Cancelled before start


class TenancyType(str, enum.Enum):
    """Type of tenancy agreement"""
    AST = "ast"                         # Assured Shorthold Tenancy
    REGULATED = "regulated"             # Regulated tenancy
    COMPANY_LET = "company_let"         # Company let
    LODGER = "lodger"                   # Lodger agreement
    HOLIDAY_LET = "holiday_let"         # Holiday let
    LICENCE = "licence"                 # Licence to occupy


class DepositScheme(str, enum.Enum):
    """Tenancy deposit protection scheme"""
    DPS = "dps"                         # Deposit Protection Service
    TDS = "tds"                         # Tenancy Deposit Scheme
    MYDEPOSITS = "mydeposits"           # mydeposits
    NONE = "none"                       # No deposit or exempt


class Tenancy(Base):
    """
    Tenancy model - represents an active or historical tenancy.

    Links a tenant to a property for a specific period.
    """
    __tablename__ = "tenancies"

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
        comment="Unique tenancy reference (e.g., XP-TNC-001)"
    )

    # Links
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    # Tenancy type and status
    tenancy_type: Mapped[TenancyType] = mapped_column(
        Enum(TenancyType),
        default=TenancyType.AST,
        nullable=False
    )
    status: Mapped[TenancyStatus] = mapped_column(
        Enum(TenancyStatus),
        default=TenancyStatus.DRAFT,
        nullable=False,
        index=True
    )

    # Dates
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
    end_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="Fixed term end date"
    )
    actual_end_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Actual end date if different from planned"
    )
    move_in_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    move_out_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Notice
    notice_given_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    notice_given_by: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="tenant or landlord"
    )
    notice_period_months: Mapped[int] = mapped_column(
        Integer,
        default=1,
        comment="Notice period in months"
    )

    # Financial
    rent_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        comment="Monthly rent"
    )
    rent_frequency: Mapped[str] = mapped_column(
        String(20),
        default="monthly",
        comment="monthly, weekly, fortnightly"
    )
    rent_due_day: Mapped[int] = mapped_column(
        Integer,
        default=1,
        comment="Day of month rent is due"
    )
    rent_includes: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="What's included: {water: true, council_tax: false, ...}"
    )

    # Deposit
    deposit_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        comment="Security deposit amount"
    )
    deposit_scheme: Mapped[DepositScheme] = mapped_column(
        Enum(DepositScheme),
        default=DepositScheme.DPS,
        nullable=False
    )
    deposit_reference: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Deposit scheme reference number"
    )
    deposit_protected_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    deposit_prescribed_info_sent: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Prescribed info sent to tenant"
    )
    deposit_prescribed_info_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Additional occupants
    additional_occupants: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {name, relationship, is_adult}"
    )
    max_occupants: Mapped[int] = mapped_column(
        Integer,
        default=2,
        comment="Maximum allowed occupants"
    )

    # Restrictions
    pets_allowed: Mapped[bool] = mapped_column(Boolean, default=False)
    pet_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    smoking_allowed: Mapped[bool] = mapped_column(Boolean, default=False)
    subletting_allowed: Mapped[bool] = mapped_column(Boolean, default=False)

    # Renewal
    is_renewal: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Is this a renewal of a previous tenancy"
    )
    previous_tenancy_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenancies.id", ondelete="SET NULL"),
        nullable=True
    )
    auto_renew: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Auto-renew to periodic at end of fixed term"
    )

    # Break clause
    has_break_clause: Mapped[bool] = mapped_column(Boolean, default=False)
    break_clause_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    break_clause_notice_months: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )

    # Contract link
    agreement_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenancy_agreements.id", ondelete="SET NULL"),
        nullable=True
    )

    # Inventory
    inventory_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    inventory_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    checkout_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    checkout_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Metadata
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    internal_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    rental_property: Mapped["Property"] = relationship(
        "Property",
        back_populates="tenancies"
    )
    tenant: Mapped["Tenant"] = relationship(
        "Tenant",
        back_populates="tenancies"
    )
    agreement: Mapped[Optional["TenancyAgreement"]] = relationship(
        "TenancyAgreement",
        back_populates="tenancy",
        uselist=False
    )
    previous_tenancy: Mapped[Optional["Tenancy"]] = relationship(
        "Tenancy",
        remote_side="Tenancy.id",
        backref="renewal_tenancy"
    )
    maintenance_issues: Mapped[List["MaintenanceIssue"]] = relationship(
        "MaintenanceIssue",
        back_populates="tenancy",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_tenancies_property_status", "property_id", "status"),
        Index("ix_tenancies_tenant_status", "tenant_id", "status"),
        Index("ix_tenancies_dates", "start_date", "end_date"),
        # Note: status index is already created via index=True on the column
    )

    def __repr__(self) -> str:
        return f"<Tenancy {self.reference}: {self.status.value}>"

    @property
    def is_active(self) -> bool:
        """Check if tenancy is currently active"""
        return self.status in [TenancyStatus.ACTIVE, TenancyStatus.PERIODIC]

    @property
    def duration_months(self) -> int:
        """Calculate tenancy duration in months"""
        if self.start_date and self.end_date:
            delta = self.end_date - self.start_date
            return int(delta.days / 30)
        return 0

    @property
    def days_remaining(self) -> Optional[int]:
        """Days remaining in fixed term"""
        if self.end_date and self.is_active:
            delta = self.end_date - datetime.now(self.end_date.tzinfo)
            return max(0, delta.days)
        return None
