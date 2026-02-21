"""
XAPPY Contract Model

Tenancy agreement contracts with e-signature support.
"""

import enum
import uuid
import hashlib
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


class TemplateStatus(str, enum.Enum):
    """Contract template status"""
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"


class AgreementStatus(str, enum.Enum):
    """Tenancy agreement status"""
    DRAFT = "draft"                       # Being generated
    PENDING_REVIEW = "pending_review"     # Awaiting PM/landlord review
    READY_TO_SEND = "ready_to_send"       # Ready for signatures
    SENT = "sent"                         # Sent for signing
    PARTIALLY_SIGNED = "partially_signed" # Some parties signed
    FULLY_SIGNED = "fully_signed"         # All parties signed
    ACTIVE = "active"                     # Contract is active
    EXPIRED = "expired"                   # Contract has ended
    CANCELLED = "cancelled"               # Cancelled before activation
    SUPERSEDED = "superseded"             # Replaced by renewal


class SignatureStatus(str, enum.Enum):
    """Individual signature status"""
    PENDING = "pending"
    VIEWED = "viewed"
    SIGNED = "signed"
    DECLINED = "declined"


class ContractTemplate(Base):
    """
    Contract template with clause management.

    Templates use {{variable}} substitution for dynamic content.
    """
    __tablename__ = "contract_templates"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Identification
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    template_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        comment="Unique template code (e.g., AST-STANDARD-V1)"
    )

    # Type
    tenancy_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="ast, company_let, lodger, etc."
    )

    # Status
    status: Mapped[TemplateStatus] = mapped_column(
        Enum(TemplateStatus),
        default=TemplateStatus.DRAFT,
        nullable=False,
        index=True
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Use as default for this tenancy type"
    )

    # Content
    html_content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="HTML template with {{variables}}"
    )

    # Clauses (JSONB array of clause objects)
    clauses: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {id, title, content, is_required, is_editable, order}"
    )

    # Variables (metadata about substitutable fields)
    variables: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {name, description, type, required, default_value}"
    )

    # Legal
    legal_review_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    legal_reviewed_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Version control
    version: Mapped[int] = mapped_column(Integer, default=1)
    previous_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contract_templates.id", ondelete="SET NULL"),
        nullable=True
    )

    # Ownership
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

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
    created_by: Mapped[Optional["User"]] = relationship(
        "User",
        backref="created_templates"
    )
    previous_version: Mapped[Optional["ContractTemplate"]] = relationship(
        "ContractTemplate",
        remote_side="ContractTemplate.id",
        backref="newer_versions"
    )
    agreements: Mapped[List["TenancyAgreement"]] = relationship(
        "TenancyAgreement",
        back_populates="template"
    )

    __table_args__ = (
        Index("ix_templates_type_status", "tenancy_type", "status"),
    )

    def __repr__(self) -> str:
        return f"<ContractTemplate {self.template_code} v{self.version}>"


class TenancyAgreement(Base):
    """
    Generated tenancy agreement document.

    Features:
    - Multi-party signing (tenant + landlord)
    - E-signature integration (DocuSign/HelloSign ready)
    - Signed document vault with audit trail
    - Hash chain for tamper resistance
    """
    __tablename__ = "tenancy_agreements"

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
        comment="Agreement reference (e.g., XP-AGR-001)"
    )

    # Links
    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contract_templates.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    # Status
    status: Mapped[AgreementStatus] = mapped_column(
        Enum(AgreementStatus),
        default=AgreementStatus.DRAFT,
        nullable=False,
        index=True
    )

    # Generated content (stored for immutability)
    generated_html: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Final HTML after variable substitution"
    )
    generated_pdf_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="S3 URL to generated PDF"
    )
    signed_pdf_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="S3 URL to fully signed PDF"
    )

    # Variable values used (for audit)
    variable_values: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Values used for variable substitution"
    )

    # Custom clauses (additions/modifications)
    custom_clauses: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Additional or modified clauses"
    )

    # Document integrity
    content_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="SHA-256 hash of generated content"
    )

    # Signatories (JSONB array)
    signatories: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        comment="Array of {user_id, role, name, email, status, signed_at, ip_address}"
    )

    # E-signature provider integration
    esign_provider: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="docusign, hellosign, manual"
    )
    esign_envelope_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="External envelope/document ID"
    )
    esign_status_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="Webhook URL for status updates"
    )

    # Key dates
    sent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When all parties signed"
    )
    effective_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When contract becomes effective"
    )
    expiry_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Review/approval
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Created by
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # Notes
    internal_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    template: Mapped["ContractTemplate"] = relationship(
        "ContractTemplate",
        back_populates="agreements"
    )
    rental_property: Mapped["Property"] = relationship(
        "Property",
        backref="agreements"
    )
    tenancy: Mapped[Optional["Tenancy"]] = relationship(
        "Tenancy",
        back_populates="agreement",
        uselist=False
    )
    created_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[created_by_id],
        backref="created_agreements"
    )
    reviewed_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[reviewed_by_id],
        backref="reviewed_agreements"
    )
    signature_audit: Mapped[List["SignatureAuditEntry"]] = relationship(
        "SignatureAuditEntry",
        back_populates="agreement",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_agreements_property_status", "property_id", "status"),
        Index("ix_agreements_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<TenancyAgreement {self.reference}: {self.status.value}>"

    def compute_content_hash(self) -> str:
        """Compute hash of generated content"""
        return hashlib.sha256(self.generated_html.encode()).hexdigest()

    @property
    def all_signed(self) -> bool:
        """Check if all signatories have signed"""
        if not self.signatories:
            return False
        return all(s.get('status') == 'signed' for s in self.signatories)

    @property
    def pending_signatories(self) -> List[dict]:
        """Get list of signatories who haven't signed yet"""
        return [s for s in self.signatories if s.get('status') != 'signed']


class SignatureAuditEntry(Base):
    """
    Audit trail for contract signatures.

    Immutable log with hash chain for legal compliance.
    """
    __tablename__ = "signature_audit_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    agreement_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenancy_agreements.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Who
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    signer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    signer_email: Mapped[str] = mapped_column(String(255), nullable=False)
    signer_role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="tenant, landlord, guarantor, witness"
    )

    # What
    action: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="sent, viewed, signed, declined, reminder_sent"
    )

    # Context
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    geolocation: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="{country, city, timezone}"
    )

    # For signed action
    signature_image_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="URL to signature image if captured"
    )

    # Hash chain
    previous_entry_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True
    )
    previous_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    entry_hash: Mapped[str] = mapped_column(String(64), nullable=False)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    agreement: Mapped["TenancyAgreement"] = relationship(
        "TenancyAgreement",
        back_populates="signature_audit"
    )
    user: Mapped[Optional["User"]] = relationship(
        "User",
        backref="signature_audit_entries"
    )

    __table_args__ = (
        Index("ix_sig_audit_agreement_date", "agreement_id", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<SignatureAudit {self.agreement_id}: {self.action} by {self.signer_email}>"

    def compute_hash(self) -> str:
        """Compute hash for this entry"""
        data = f"{self.id}{self.agreement_id}{self.user_id}{self.action}{self.ip_address}{self.created_at}{self.previous_hash or ''}"
        return hashlib.sha256(data.encode()).hexdigest()
