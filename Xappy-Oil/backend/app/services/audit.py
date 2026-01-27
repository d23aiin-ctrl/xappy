"""
Audit Trail Service

Helpers to append immutable, hash-chained audit entries.
"""

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_trail import AuditTrail, AuditAction
from app.models.report import Report
from app.models.user import User


async def create_audit_entry(
    db: AsyncSession,
    report: Report,
    action: AuditAction,
    actor: Optional[User],
    field_changed: Optional[str] = None,
    old_value: Optional[dict] = None,
    new_value: Optional[dict] = None,
    notes: Optional[str] = None,
    source: Optional[str] = None,
    request_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> AuditTrail:
    """Create and attach a new audit trail entry to a report."""
    timestamp = datetime.now(timezone.utc)
    previous_entry = await db.execute(
        select(AuditTrail)
        .where(AuditTrail.report_id == report.id)
        .order_by(AuditTrail.timestamp.desc())
        .limit(1)
    )
    previous = previous_entry.scalar_one_or_none()
    previous_hash = previous.entry_hash if previous else None

    entry_hash = AuditTrail.compute_hash(
        report_id=str(report.id),
        action=action.value,
        actor_id=str(actor.id) if actor else None,
        timestamp=timestamp,
        field_changed=field_changed,
        old_value=old_value,
        new_value=new_value,
        previous_hash=previous_hash,
    )

    audit = AuditTrail(
        report_id=report.id,
        action=action,
        actor_id=actor.id if actor else None,
        actor_badge=actor.badge_number if actor else None,
        actor_name=actor.full_name if actor else None,
        actor_role=actor.role.value if actor else None,
        field_changed=field_changed,
        old_value=old_value,
        new_value=new_value,
        notes=notes,
        ip_address=ip_address,
        user_agent=user_agent,
        request_id=request_id,
        source=source,
        previous_hash=previous_hash,
        entry_hash=entry_hash,
        timestamp=timestamp,
    )
    db.add(audit)
    return audit
