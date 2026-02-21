"""
XAPPY Deposit Model

Holding deposits for tenant applications.
"""

import enum
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, TYPE_CHECKING

from sqlalchemy import (
    String, Boolean, DateTime, Enum, Index, ForeignKey, Text, Numeric
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .user import User
    from .tenant import Tenant
    from .property import Property


class HoldingDepositStatus(str, enum.Enum):
    """Holding deposit status"""
    REQUESTED = "requested"       # Request sent to tenant
    PENDING = "pending"           # Awaiting payment
    PAID = "paid"                 # Payment received
    APPLIED = "applied"           # Applied to security deposit
    REFUNDED = "refunded"         # Refunded to tenant
    FORFEITED = "forfeited"       # Forfeited (deadline passed/false info)
    CANCELLED = "cancelled"       # Cancelled before payment
    EXPIRED = "expired"           # Request expired


class PaymentMethod(str, enum.Enum):
    """Payment methods"""
    BANK_TRANSFER = "bank_transfer"
    CARD = "card"
    CASH = "cash"
    CHEQUE = "cheque"
    DIRECT_DEBIT = "direct_debit"


class HoldingDeposit(Base):
    """
    Holding deposit model.

    Under UK law (Tenant Fees Act 2019):
    - Max 1 week's rent
    - Must be refunded within 7 days if landlord withdraws
    - Can be forfeited if tenant withdraws/fails referencing
    - Deadline period max 15 days (or longer if agreed)
    """
    __tablename__ = "holding_deposits"

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
        comment="Unique deposit reference (e.g., XP-HD-001)"
    )

    # Links
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    # Amount
    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        comment="Holding deposit amount (max 1 week rent)"
    )
    weekly_rent: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        comment="Weekly rent at time of request"
    )

    # Status
    status: Mapped[HoldingDepositStatus] = mapped_column(
        Enum(HoldingDepositStatus),
        default=HoldingDepositStatus.REQUESTED,
        nullable=False,
        index=True
    )

    # Deadline
    deadline_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="Deadline for tenancy agreement (max 15 days default)"
    )
    deadline_extended: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Deadline was extended by agreement"
    )
    original_deadline: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Original deadline if extended"
    )
    extension_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Payment details
    payment_method: Mapped[Optional[PaymentMethod]] = mapped_column(
        Enum(PaymentMethod),
        nullable=True
    )
    payment_reference: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Bank reference/transaction ID"
    )
    paid_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Bank details sent
    bank_details_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    bank_details_sent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Refund details
    refund_reason: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="landlord_withdrew, tenant_failed_referencing, etc."
    )
    refund_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )
    refunded_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    refund_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Forfeiture details
    forfeiture_reason: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="tenant_withdrew, false_information, failed_referencing, missed_deadline"
    )
    forfeiture_explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    forfeited_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Applied to security deposit
    applied_to_security_deposit: Mapped[bool] = mapped_column(Boolean, default=False)
    applied_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Created by
    requested_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    processed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="User who marked paid/refunded/forfeited"
    )

    # Notes
    internal_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Metadata
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Timestamps
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
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
    tenant: Mapped["Tenant"] = relationship(
        "Tenant",
        back_populates="holding_deposits"
    )
    rental_property: Mapped["Property"] = relationship(
        "Property",
        backref="holding_deposits"
    )
    requested_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[requested_by_id],
        backref="requested_deposits"
    )
    processed_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[processed_by_id],
        backref="processed_deposits"
    )

    __table_args__ = (
        Index("ix_deposits_tenant_status", "tenant_id", "status"),
        Index("ix_deposits_property_status", "property_id", "status"),
        Index("ix_deposits_deadline", "deadline_date"),
    )

    def __repr__(self) -> str:
        return f"<HoldingDeposit {self.reference}: {self.status.value}>"

    @property
    def is_compliant(self) -> bool:
        """Check if amount complies with 1 week max rule"""
        return self.amount <= self.weekly_rent

    @property
    def days_until_deadline(self) -> Optional[int]:
        """Days remaining until deadline"""
        if self.deadline_date:
            delta = self.deadline_date - datetime.now(self.deadline_date.tzinfo)
            return max(0, delta.days)
        return None

    @property
    def is_past_deadline(self) -> bool:
        """Check if deadline has passed"""
        if self.deadline_date:
            return datetime.now(self.deadline_date.tzinfo) > self.deadline_date
        return False

    @property
    def can_be_forfeited(self) -> bool:
        """Check if deposit can legally be forfeited"""
        return self.status == HoldingDepositStatus.PAID and (
            self.is_past_deadline or
            self.forfeiture_reason in ['tenant_withdrew', 'false_information', 'failed_referencing']
        )
