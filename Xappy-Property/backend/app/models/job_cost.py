"""
XAPPY Job Cost Model

Cost tracking for maintenance jobs with approval workflow.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING

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


class CostType(str, enum.Enum):
    """Type of cost"""
    LABOUR = "labour"
    MATERIALS = "materials"
    PARTS = "parts"
    CALL_OUT = "call_out"
    EMERGENCY = "emergency"
    TRAVEL = "travel"
    DISPOSAL = "disposal"
    OTHER = "other"


class CostStatus(str, enum.Enum):
    """Cost approval status"""
    PENDING = "pending"           # Awaiting review
    APPROVED = "approved"         # Approved for payment
    REJECTED = "rejected"         # Rejected
    QUERIED = "queried"           # Query raised
    PAID = "paid"                 # Payment made


class PaymentStatus(str, enum.Enum):
    """Payment status"""
    UNPAID = "unpaid"
    PENDING = "pending"
    PROCESSING = "processing"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


class JobCost(Base):
    """
    Individual cost line item for a maintenance job.

    Features:
    - Multiple cost types per job
    - Approval workflow
    - Invoice attachment
    - VAT handling
    """
    __tablename__ = "job_costs"

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
        comment="Cost reference (e.g., XP-COST-001)"
    )

    # Link
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("maintenance_jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Cost details
    cost_type: Mapped[CostType] = mapped_column(
        Enum(CostType),
        nullable=False,
        index=True
    )
    description: Mapped[str] = mapped_column(String(500), nullable=False)

    # Amounts
    quantity: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=Decimal("1"),
        nullable=False
    )
    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )
    net_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        comment="Amount before VAT"
    )
    vat_rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        default=Decimal("20.00"),
        comment="VAT rate as percentage"
    )
    vat_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        comment="VAT amount"
    )
    gross_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        comment="Total including VAT"
    )

    # Status
    status: Mapped[CostStatus] = mapped_column(
        Enum(CostStatus),
        default=CostStatus.PENDING,
        nullable=False,
        index=True
    )

    # Approval
    requires_approval: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        comment="Requires landlord/PM approval"
    )
    approval_threshold: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        comment="Amount threshold that triggered approval requirement"
    )
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    approval_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    query_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Invoice
    has_invoice: Mapped[bool] = mapped_column(Boolean, default=False)
    invoice_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    invoice_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    invoice_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="S3 URL to invoice document"
    )
    invoice_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Payment
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus),
        default=PaymentStatus.UNPAID,
        nullable=False,
        index=True
    )
    payment_due_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    paid_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    payment_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    payment_method: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="bank_transfer, card, cheque"
    )

    # Chargeback to tenant
    chargeback_to_tenant: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Cost to be recovered from tenant"
    )
    chargeback_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    chargeback_approved: Mapped[bool] = mapped_column(Boolean, default=False)

    # Who submitted
    submitted_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # Notes
    internal_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Metadata
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Timestamps
    submitted_at: Mapped[datetime] = mapped_column(
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
    job: Mapped["MaintenanceJob"] = relationship(
        "MaintenanceJob",
        back_populates="costs"
    )
    approved_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[approved_by_id],
        backref="approved_costs"
    )
    submitted_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[submitted_by_id],
        backref="submitted_costs"
    )

    __table_args__ = (
        Index("ix_costs_job_status", "job_id", "status"),
        Index("ix_costs_payment", "payment_status", "payment_due_date"),
    )

    def __repr__(self) -> str:
        return f"<JobCost {self.reference}: {self.gross_amount}>"

    @property
    def is_approved(self) -> bool:
        """Check if cost is approved"""
        return self.status == CostStatus.APPROVED

    @property
    def is_paid(self) -> bool:
        """Check if cost has been paid"""
        return self.payment_status == PaymentStatus.PAID

    @property
    def is_overdue(self) -> bool:
        """Check if payment is overdue"""
        if self.payment_due_date and self.payment_status == PaymentStatus.UNPAID:
            return datetime.now(self.payment_due_date.tzinfo) > self.payment_due_date
        return False
