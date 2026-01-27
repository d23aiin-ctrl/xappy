"""
XAPPY AI Audit Trail Model

Immutable, hash-chained audit log for compliance evidence.
"""

import enum
import hashlib
import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .report import Report
    from .user import User


class AuditAction(str, enum.Enum):
    """Types of auditable actions"""
    # Report lifecycle
    CREATED = "created"
    SUBMITTED = "submitted"
    UPDATED = "updated"
    STATUS_CHANGED = "status_changed"
    ACKNOWLEDGED = "acknowledged"
    CLOSED = "closed"
    REOPENED = "reopened"
    ARCHIVED = "archived"

    # Media
    ATTACHMENT_ADDED = "attachment_added"
    ATTACHMENT_REMOVED = "attachment_removed"

    # Access
    VIEWED = "viewed"
    EXPORTED = "exported"
    PRINTED = "printed"

    # Integration
    INTEGRATED_SAP = "integrated_sap"
    INTEGRATED_MAXIMO = "integrated_maximo"
    INTEGRATED_SHAREPOINT = "integrated_sharepoint"

    # System
    AI_PROCESSED = "ai_processed"
    TRANSCRIBED = "transcribed"
    TRANSLATED = "translated"


class AuditTrail(Base):
    """
    Immutable audit trail for compliance evidence.

    Uses hash chaining to ensure tamper evidence.
    Each entry includes hash of previous entry.
    """
    __tablename__ = "audit_trail"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Link to report
    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # What action was taken
    action: Mapped[AuditAction] = mapped_column(
        Enum(AuditAction),
        nullable=False,
        index=True
    )

    # Who performed the action (denormalized for immutability)
    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    actor_badge: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Denormalized badge number"
    )
    actor_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Denormalized full name"
    )
    actor_role: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Denormalized role at time of action"
    )

    # What changed
    field_changed: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Name of field that changed"
    )
    old_value: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Previous value (JSON for complex types)"
    )
    new_value: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="New value (JSON for complex types)"
    )

    # Notes
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Public notes about the action"
    )
    internal_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Internal notes (not shown to workers)"
    )

    # Request context
    ip_address: Mapped[Optional[str]] = mapped_column(
        String(45),
        nullable=True,
        comment="Client IP address"
    )
    user_agent: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True
    )
    request_id: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Request ID for correlation"
    )
    source: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Source: whatsapp, web, api, system"
    )

    # Hash chain for tamper evidence
    previous_hash: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        comment="SHA256 hash of previous audit entry"
    )
    entry_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="SHA256 hash of this entry's content"
    )

    # Immutable timestamp (should never change)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )

    # Relationships
    report: Mapped["Report"] = relationship("Report", back_populates="audit_entries")
    actor: Mapped[Optional["User"]] = relationship("User")

    def __repr__(self) -> str:
        return f"<AuditTrail {self.action.value} by {self.actor_name}>"

    @staticmethod
    def compute_hash(
        report_id: str,
        action: str,
        actor_id: Optional[str],
        timestamp: datetime,
        field_changed: Optional[str],
        old_value: Optional[dict],
        new_value: Optional[dict],
        previous_hash: Optional[str],
    ) -> str:
        """
        Compute SHA256 hash for this audit entry.

        The hash includes all relevant fields to ensure integrity.
        """
        content = f"{report_id}|{action}|{actor_id}|{timestamp.isoformat()}|"
        content += f"{field_changed}|{str(old_value)}|{str(new_value)}|{previous_hash}"

        return hashlib.sha256(content.encode()).hexdigest()
