"""
XAPPY Compliance Model

Property compliance records with reminder system.
"""

import enum
import uuid
import hashlib
from datetime import datetime, timedelta
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


class ComplianceType(str, enum.Enum):
    """Types of compliance records"""
    # Safety certificates
    GAS_SAFETY = "gas_safety"                     # Gas Safety Certificate (CP12)
    ELECTRICAL_EICR = "electrical_eicr"           # Electrical Installation Condition Report
    EPC = "epc"                                   # Energy Performance Certificate
    FIRE_ALARM = "fire_alarm"                     # Fire Alarm Testing
    SMOKE_CO_DETECTORS = "smoke_co_detectors"     # Smoke/CO Detector Testing
    LEGIONELLA = "legionella"                     # Legionella Risk Assessment
    PAT_TESTING = "pat_testing"                   # Portable Appliance Testing

    # Licences
    HMO_LICENCE = "hmo_licence"                   # HMO Licence
    SELECTIVE_LICENCE = "selective_licence"       # Selective Licensing
    PLANNING_PERMISSION = "planning_permission"   # Planning Permission

    # Insurance
    BUILDING_INSURANCE = "building_insurance"
    LANDLORD_INSURANCE = "landlord_insurance"
    RENT_GUARANTEE_INSURANCE = "rent_guarantee_insurance"

    # Contracts
    MAINTENANCE_CONTRACT = "maintenance_contract"
    BOILER_SERVICE = "boiler_service"

    # Other
    ASBESTOS_SURVEY = "asbestos_survey"
    INVENTORY = "inventory"
    OTHER = "other"


class ComplianceStatus(str, enum.Enum):
    """Compliance record status"""
    VALID = "valid"               # Current and valid
    EXPIRING_SOON = "expiring_soon"  # Within 30 days of expiry
    EXPIRED = "expired"           # Past expiry date
    PENDING = "pending"           # Awaiting completion
    OVERDUE = "overdue"           # Past due date and not completed
    NOT_APPLICABLE = "not_applicable"  # Not required for this property


class ReminderStatus(str, enum.Enum):
    """Reminder status"""
    PENDING = "pending"
    SENT = "sent"
    ACKNOWLEDGED = "acknowledged"
    ESCALATED = "escalated"
    CANCELLED = "cancelled"


# Default validity periods in months
DEFAULT_VALIDITY = {
    ComplianceType.GAS_SAFETY: 12,
    ComplianceType.ELECTRICAL_EICR: 60,  # 5 years
    ComplianceType.EPC: 120,             # 10 years
    ComplianceType.FIRE_ALARM: 12,
    ComplianceType.SMOKE_CO_DETECTORS: 12,
    ComplianceType.LEGIONELLA: 24,
    ComplianceType.PAT_TESTING: 12,
    ComplianceType.HMO_LICENCE: 60,      # Usually 5 years
    ComplianceType.BOILER_SERVICE: 12,
}

# Reminder schedule (days before expiry)
REMINDER_SCHEDULE = [30, 14, 7, 0]  # 30 days, 14 days, 7 days, on expiry


class ComplianceRecord(Base):
    """
    Compliance record for a property.

    Features:
    - Tamper-resistant evidence storage (hash chain)
    - Automated reminder schedule
    - Multi-level escalation
    - Evidence upload with verification
    """
    __tablename__ = "compliance_records"

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
        comment="Compliance reference (e.g., XP-CMP-001)"
    )

    # Link
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Type and status
    compliance_type: Mapped[ComplianceType] = mapped_column(
        Enum(ComplianceType),
        nullable=False,
        index=True
    )
    status: Mapped[ComplianceStatus] = mapped_column(
        Enum(ComplianceStatus),
        default=ComplianceStatus.PENDING,
        nullable=False,
        index=True
    )

    # Dates
    issue_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Date certificate/record was issued"
    )
    expiry_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True
    )
    next_due_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
        comment="When next inspection/renewal is due"
    )

    # Certificate details
    certificate_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    issuing_body: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Organisation that issued the certificate"
    )
    inspector_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    inspector_registration: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Gas Safe number, NICEIC number, etc."
    )

    # Evidence (tamper-resistant)
    evidence_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="S3 URL to certificate/evidence"
    )
    evidence_hash: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        comment="SHA-256 hash of evidence document"
    )
    evidence_uploaded_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    evidence_uploaded_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # Verification
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
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

    # Cost
    cost: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Cost in pence"
    )
    supplier_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Findings/notes
    findings: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Key findings from inspection"
    )
    remedial_actions: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {action, deadline, completed, completed_at}"
    )
    has_remedial_actions: Mapped[bool] = mapped_column(Boolean, default=False)
    remedial_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    # Hash chain for tamper resistance
    previous_record_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("compliance_records.id", ondelete="SET NULL"),
        nullable=True,
        comment="Previous version of this compliance record"
    )
    record_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="Hash of record for integrity verification"
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
    rental_property: Mapped["Property"] = relationship(
        "Property",
        back_populates="compliance_records"
    )
    evidence_uploaded_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[evidence_uploaded_by_id],
        backref="uploaded_compliance_evidence"
    )
    verified_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[verified_by_id],
        backref="verified_compliance_records"
    )
    previous_record: Mapped[Optional["ComplianceRecord"]] = relationship(
        "ComplianceRecord",
        remote_side="ComplianceRecord.id",
        backref="newer_records"
    )
    reminders: Mapped[List["ComplianceReminder"]] = relationship(
        "ComplianceReminder",
        back_populates="compliance_record",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_compliance_property_type", "property_id", "compliance_type"),
        Index("ix_compliance_status_expiry", "status", "expiry_date"),
        Index("ix_compliance_expiry", "expiry_date"),
        Index("ix_compliance_next_due", "next_due_date"),
    )

    def __repr__(self) -> str:
        return f"<ComplianceRecord {self.reference}: {self.compliance_type.value}>"

    def compute_hash(self) -> str:
        """Compute hash for tamper resistance"""
        data = f"{self.id}{self.property_id}{self.compliance_type.value}{self.certificate_number or ''}{self.issue_date}{self.expiry_date}{self.evidence_hash or ''}"
        return hashlib.sha256(data.encode()).hexdigest()

    @property
    def days_until_expiry(self) -> Optional[int]:
        """Days until expiry"""
        if self.expiry_date:
            delta = self.expiry_date - datetime.now(self.expiry_date.tzinfo)
            return delta.days
        return None

    @property
    def is_expired(self) -> bool:
        """Check if record has expired"""
        if self.expiry_date:
            return datetime.now(self.expiry_date.tzinfo) > self.expiry_date
        return False

    @property
    def is_expiring_soon(self) -> bool:
        """Check if expiring within 30 days"""
        days = self.days_until_expiry
        return days is not None and 0 < days <= 30


class ComplianceReminder(Base):
    """
    Compliance reminder with escalation.

    Reminder Schedule:
    - 30 days before: Internal reminder
    - 14 days before: Landlord notification
    - 7 days before: Escalation
    - Overdue: Alert to all stakeholders
    """
    __tablename__ = "compliance_reminders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Link
    compliance_record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("compliance_records.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Reminder details
    days_before_expiry: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Days before expiry (negative for overdue)"
    )
    reminder_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="internal, landlord, escalation, overdue"
    )
    scheduled_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )

    # Status
    status: Mapped[ReminderStatus] = mapped_column(
        Enum(ReminderStatus),
        default=ReminderStatus.PENDING,
        nullable=False,
        index=True
    )

    # Delivery
    sent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    sent_to: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {user_id, email, method}"
    )
    delivery_method: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="email, sms, in_app, all"
    )

    # Response
    acknowledged_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    acknowledgement_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Escalation
    escalation_level: Mapped[int] = mapped_column(Integer, default=0)
    escalated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    escalated_to: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of user_ids escalated to"
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
    compliance_record: Mapped["ComplianceRecord"] = relationship(
        "ComplianceRecord",
        back_populates="reminders"
    )
    acknowledged_by: Mapped[Optional["User"]] = relationship(
        "User",
        backref="acknowledged_compliance_reminders"
    )

    __table_args__ = (
        Index("ix_reminders_compliance_status", "compliance_record_id", "status"),
        Index("ix_reminders_scheduled", "scheduled_date", "status"),
    )

    def __repr__(self) -> str:
        return f"<ComplianceReminder {self.compliance_record_id}: {self.days_before_expiry} days>"
