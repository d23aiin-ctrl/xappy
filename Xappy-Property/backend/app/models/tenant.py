"""
XAPPY Tenant Model

Tenant profiles and pipeline management.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import (
    String, Boolean, DateTime, Enum, Index, ForeignKey, Text, Integer
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .user import User
    from .property import Property
    from .tenancy import Tenancy
    from .tenant_document import TenantDocument
    from .questionnaire import QualificationResponse
    from .deposit import HoldingDeposit


class TenantPipelineStage(str, enum.Enum):
    """
    Tenant pipeline stages - workflow states.
    Every automated step should support manual override.
    """
    # Initial stages
    ENQUIRY = "enquiry"                       # Initial enquiry received
    VIEWING_SCHEDULED = "viewing_scheduled"   # Viewing booked
    VIEWING_COMPLETED = "viewing_completed"   # Viewing done

    # Application stages
    APPLICATION_STARTED = "application_started"     # Started filling form
    QUALIFICATION_PENDING = "qualification_pending" # Questionnaire sent
    QUALIFICATION_REVIEW = "qualification_review"   # Answers under review
    QUALIFIED = "qualified"                         # Passed qualification
    NOT_QUALIFIED = "not_qualified"                 # Failed qualification

    # Document stages
    DOCUMENTS_REQUESTED = "documents_requested"     # Docs request sent
    DOCUMENTS_SUBMITTED = "documents_submitted"     # Docs uploaded
    DOCUMENTS_VERIFIED = "documents_verified"       # Docs verified

    # Financial stages
    HOLDING_DEPOSIT_REQUESTED = "holding_deposit_requested"
    HOLDING_DEPOSIT_PAID = "holding_deposit_paid"
    REFERENCING = "referencing"                     # Third-party referencing
    REFERENCING_PASSED = "referencing_passed"
    REFERENCING_FAILED = "referencing_failed"

    # Contract stages
    CONTRACT_GENERATED = "contract_generated"
    CONTRACT_SENT = "contract_sent"
    CONTRACT_SIGNED = "contract_signed"

    # Final stages
    MOVE_IN_SCHEDULED = "move_in_scheduled"
    TENANCY_STARTED = "tenancy_started"

    # Terminal stages
    WITHDRAWN = "withdrawn"                   # Tenant withdrew
    REJECTED = "rejected"                     # Landlord/PM rejected
    ARCHIVED = "archived"                     # Old application archived


class TenantStatus(str, enum.Enum):
    """Overall tenant status"""
    PROSPECT = "prospect"           # In pipeline, not yet tenant
    ACTIVE = "active"               # Current tenant
    PAST = "past"                   # Former tenant
    BLACKLISTED = "blacklisted"     # Do not rent to


class Tenant(Base):
    """
    Tenant profile model.

    A tenant is linked to a User account but contains additional
    tenant-specific information for property management.
    """
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Link to user account (optional - can create tenant before user signs up)
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
        comment="Unique tenant reference (e.g., XP-TEN-001)"
    )

    # Contact info (stored here even if no user account yet)
    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Personal details
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    nationality: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Current address
    current_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    current_postcode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Employment
    employment_status: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="employed, self_employed, student, retired, unemployed, other"
    )
    employer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    job_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    annual_income: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Annual income in GBP"
    )

    # Guarantor info
    has_guarantor: Mapped[bool] = mapped_column(Boolean, default=False)
    guarantor_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    guarantor_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    guarantor_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Status
    status: Mapped[TenantStatus] = mapped_column(
        Enum(TenantStatus),
        default=TenantStatus.PROSPECT,
        nullable=False,
        index=True
    )

    # Current pipeline stage
    pipeline_stage: Mapped[TenantPipelineStage] = mapped_column(
        Enum(TenantPipelineStage),
        default=TenantPipelineStage.ENQUIRY,
        nullable=False,
        index=True
    )
    pipeline_stage_updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Property being applied for (in pipeline)
    interested_property_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Property currently in application pipeline for"
    )

    # Source tracking
    source: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Lead source: rightmove, zoopla, website, referral, etc."
    )

    # GDPR
    gdpr_consent: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Has given GDPR consent"
    )
    gdpr_consent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    marketing_consent: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Consented to marketing communications"
    )

    # Notes (internal)
    internal_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Internal notes - not visible to tenant"
    )

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
        backref="tenant_profile"
    )
    interested_property: Mapped[Optional["Property"]] = relationship(
        "Property",
        backref="interested_tenants"
    )
    pipeline_history: Mapped[List["TenantPipelineHistory"]] = relationship(
        "TenantPipelineHistory",
        back_populates="tenant",
        cascade="all, delete-orphan",
        order_by="TenantPipelineHistory.created_at.desc()"
    )
    tenancies: Mapped[List["Tenancy"]] = relationship(
        "Tenancy",
        back_populates="tenant",
        cascade="all, delete-orphan"
    )
    documents: Mapped[List["TenantDocument"]] = relationship(
        "TenantDocument",
        back_populates="tenant",
        cascade="all, delete-orphan"
    )
    qualification_responses: Mapped[List["QualificationResponse"]] = relationship(
        "QualificationResponse",
        back_populates="tenant",
        cascade="all, delete-orphan"
    )
    holding_deposits: Mapped[List["HoldingDeposit"]] = relationship(
        "HoldingDeposit",
        back_populates="tenant",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_tenants_status_stage", "status", "pipeline_stage"),
        Index("ix_tenants_property_stage", "interested_property_id", "pipeline_stage"),
    )

    def __repr__(self) -> str:
        return f"<Tenant {self.reference}: {self.full_name}>"


class TenantPipelineHistory(Base):
    """
    Audit trail for tenant pipeline stage changes.

    Every transition is logged for compliance and workflow tracking.
    """
    __tablename__ = "tenant_pipeline_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Stage transition
    from_stage: Mapped[Optional[TenantPipelineStage]] = mapped_column(
        Enum(TenantPipelineStage),
        nullable=True,
        comment="Previous stage (null for initial)"
    )
    to_stage: Mapped[TenantPipelineStage] = mapped_column(
        Enum(TenantPipelineStage),
        nullable=False
    )

    # Transition details
    triggered_by: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="auto, manual_override, api"
    )
    triggered_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # Override reason (required for manual overrides)
    override_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Required for manual overrides"
    )

    # Additional context
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    tenant: Mapped["Tenant"] = relationship(
        "Tenant",
        back_populates="pipeline_history"
    )
    triggered_by_user: Mapped[Optional["User"]] = relationship(
        "User",
        backref="pipeline_transitions"
    )

    __table_args__ = (
        Index("ix_pipeline_history_tenant_date", "tenant_id", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<PipelineHistory {self.tenant_id}: {self.from_stage} -> {self.to_stage}>"
