"""
XAPPY Tenant Document Model

Secure document storage with GDPR compliance and access logging.
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
    from .tenant import Tenant


class DocumentType(str, enum.Enum):
    """Types of tenant documents"""
    # Identity
    PASSPORT = "passport"
    DRIVING_LICENCE = "driving_licence"
    NATIONAL_ID = "national_id"
    BIOMETRIC_RESIDENCE_PERMIT = "biometric_residence_permit"
    VISA = "visa"

    # Address proof
    UTILITY_BILL = "utility_bill"
    BANK_STATEMENT = "bank_statement"
    COUNCIL_TAX_BILL = "council_tax_bill"

    # Employment/Income
    PAYSLIP = "payslip"
    EMPLOYMENT_CONTRACT = "employment_contract"
    TAX_RETURN = "tax_return"
    ACCOUNTANT_LETTER = "accountant_letter"
    BANK_STATEMENTS_3_MONTHS = "bank_statements_3_months"

    # Reference
    LANDLORD_REFERENCE = "landlord_reference"
    EMPLOYER_REFERENCE = "employer_reference"
    CHARACTER_REFERENCE = "character_reference"

    # Student
    STUDENT_ID = "student_id"
    UNIVERSITY_LETTER = "university_letter"
    STUDENT_LOAN_LETTER = "student_loan_letter"

    # Guarantor
    GUARANTOR_ID = "guarantor_id"
    GUARANTOR_PROOF_OF_ADDRESS = "guarantor_proof_of_address"
    GUARANTOR_PROOF_OF_INCOME = "guarantor_proof_of_income"

    # Other
    OTHER = "other"


class DocumentStatus(str, enum.Enum):
    """Document verification status"""
    PENDING = "pending"           # Uploaded, awaiting verification
    UNDER_REVIEW = "under_review" # Being reviewed
    VERIFIED = "verified"         # Verified as authentic
    REJECTED = "rejected"         # Rejected/invalid
    EXPIRED = "expired"           # Document has expired
    DELETED = "deleted"           # Soft deleted (GDPR)


class TenantDocument(Base):
    """
    Secure tenant document storage.

    Security features:
    - Encryption at rest (AWS S3 KMS)
    - Presigned URLs with expiry
    - Virus scanning before access
    - Immutable access logs
    - GDPR consent tracking
    """
    __tablename__ = "tenant_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Owner
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Document type
    document_type: Mapped[DocumentType] = mapped_column(
        Enum(DocumentType),
        nullable=False,
        index=True
    )

    # File info
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_extension: Mapped[str] = mapped_column(String(10), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)

    # Storage
    s3_bucket: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="S3 bucket name"
    )
    s3_key: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        comment="S3 object key (encrypted path)"
    )
    s3_version_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="S3 version ID for versioned buckets"
    )

    # Security
    file_hash_sha256: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="SHA-256 hash for integrity verification"
    )
    is_encrypted: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        comment="File is encrypted at rest"
    )
    kms_key_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="AWS KMS key used for encryption"
    )

    # Virus scan
    virus_scanned: Mapped[bool] = mapped_column(Boolean, default=False)
    virus_scanned_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    virus_scan_result: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="clean, infected, error"
    )

    # Status
    status: Mapped[DocumentStatus] = mapped_column(
        Enum(DocumentStatus),
        default=DocumentStatus.PENDING,
        nullable=False,
        index=True
    )

    # Verification
    verified_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    verification_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Document validity
    document_number: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="ID/passport/licence number (optional)"
    )
    issue_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    expiry_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True
    )

    # GDPR Consent
    gdpr_consent_given: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Explicit consent for document processing"
    )
    gdpr_consent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    gdpr_consent_ip: Mapped[Optional[str]] = mapped_column(
        String(45),
        nullable=True,
        comment="IP address when consent given"
    )
    gdpr_purpose: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Stated purpose for document collection"
    )
    retention_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="GDPR retention period end date"
    )

    # Deletion (soft delete for GDPR compliance)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    deleted_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    deletion_reason: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="gdpr_request, expired, duplicate, etc."
    )

    # Upload info
    uploaded_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    upload_ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)

    # Description
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    tenant: Mapped["Tenant"] = relationship(
        "Tenant",
        back_populates="documents"
    )
    verified_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[verified_by_id],
        backref="verified_documents"
    )
    uploaded_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[uploaded_by_id],
        backref="uploaded_documents"
    )
    deleted_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[deleted_by_id],
        backref="deleted_documents"
    )
    access_logs: Mapped[List["DocumentAccessLog"]] = relationship(
        "DocumentAccessLog",
        back_populates="document",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_documents_tenant_type", "tenant_id", "document_type"),
        Index("ix_documents_status", "status"),
        Index("ix_documents_expiry", "expiry_date"),
    )

    def __repr__(self) -> str:
        return f"<TenantDocument {self.document_type.value}: {self.original_filename}>"

    @property
    def is_expired(self) -> bool:
        """Check if document has expired"""
        if self.expiry_date:
            return datetime.now(self.expiry_date.tzinfo) > self.expiry_date
        return False

    @property
    def is_accessible(self) -> bool:
        """Check if document can be accessed"""
        return (
            not self.is_deleted
            and self.status not in [DocumentStatus.DELETED, DocumentStatus.REJECTED]
            and self.virus_scan_result != "infected"
        )


class DocumentAccessLog(Base):
    """
    Immutable access log for document downloads/views.

    Uses hash chain for tamper resistance.
    """
    __tablename__ = "document_access_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenant_documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Who accessed
    accessed_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    accessed_by_role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Role at time of access"
    )

    # Access details
    access_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="view, download, verify, delete"
    )
    access_reason: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Stated reason for access"
    )

    # Request info
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Hash chain for tamper resistance
    previous_log_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Previous log entry ID for chain"
    )
    previous_hash: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        comment="Hash of previous entry"
    )
    entry_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="Hash of this entry for integrity"
    )

    # Timestamp (immutable)
    accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    document: Mapped["TenantDocument"] = relationship(
        "TenantDocument",
        back_populates="access_logs"
    )
    accessed_by: Mapped[Optional["User"]] = relationship(
        "User",
        backref="document_access_logs"
    )

    __table_args__ = (
        Index("ix_access_logs_document_date", "document_id", "accessed_at"),
        Index("ix_access_logs_user", "accessed_by_id"),
    )

    def __repr__(self) -> str:
        return f"<AccessLog {self.document_id}: {self.access_type} at {self.accessed_at}>"

    def compute_hash(self) -> str:
        """Compute hash for this entry"""
        data = f"{self.id}{self.document_id}{self.accessed_by_id}{self.access_type}{self.ip_address}{self.accessed_at}{self.previous_hash or ''}"
        return hashlib.sha256(data.encode()).hexdigest()
