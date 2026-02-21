"""
XAPPY Compliance Service

Compliance monitoring and reminder management.
"""

from typing import Optional, List, Dict
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_

from app.models.compliance import (
    ComplianceRecord, ComplianceReminder,
    ComplianceType, ComplianceStatus, ReminderStatus,
    DEFAULT_VALIDITY, REMINDER_SCHEDULE
)
from app.models.property import Property
from app.models.user import User


class ComplianceService:
    """
    Service for managing compliance records and reminders.

    Features:
    - Status calculation based on expiry dates
    - Automated reminder scheduling
    - Escalation management
    - Dashboard statistics
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def calculate_status(expiry_date: Optional[datetime]) -> ComplianceStatus:
        """Calculate compliance status from expiry date."""
        if not expiry_date:
            return ComplianceStatus.PENDING

        now = datetime.utcnow()
        expiry = expiry_date.replace(tzinfo=None) if expiry_date.tzinfo else expiry_date

        if expiry < now:
            return ComplianceStatus.EXPIRED
        elif expiry < now + timedelta(days=30):
            return ComplianceStatus.EXPIRING_SOON
        else:
            return ComplianceStatus.VALID

    @staticmethod
    def get_default_validity_months(compliance_type: ComplianceType) -> int:
        """Get default validity period in months for a compliance type."""
        return DEFAULT_VALIDITY.get(compliance_type, 12)

    async def update_all_statuses(self) -> int:
        """
        Update status for all compliance records based on current date.

        Should be run daily.

        Returns:
            Number of records updated
        """
        now = datetime.utcnow()

        # Get all records that might need status update
        result = await self.db.execute(
            select(ComplianceRecord).where(
                ComplianceRecord.status.in_([
                    ComplianceStatus.VALID,
                    ComplianceStatus.EXPIRING_SOON,
                ])
            )
        )
        records = result.scalars().all()

        updated = 0
        for record in records:
            new_status = self.calculate_status(record.expiry_date)
            if new_status != record.status:
                record.status = new_status
                updated += 1

        if updated > 0:
            await self.db.commit()

        return updated

    async def create_reminders_for_record(
        self,
        record: ComplianceRecord
    ) -> List[ComplianceReminder]:
        """
        Create reminder schedule for a compliance record.

        Reminder Schedule:
        - 30 days before: Internal reminder
        - 14 days before: Landlord notification
        - 7 days before: Escalation
        - On expiry: Overdue alert
        """
        if not record.expiry_date:
            return []

        expiry = record.expiry_date.replace(tzinfo=None) if record.expiry_date.tzinfo else record.expiry_date
        reminders = []

        for days in REMINDER_SCHEDULE:
            reminder_date = expiry - timedelta(days=days)

            # Skip if reminder date is in the past
            if reminder_date < datetime.utcnow():
                continue

            # Determine reminder type
            if days == 30:
                reminder_type = "internal"
            elif days == 14:
                reminder_type = "landlord"
            elif days == 7:
                reminder_type = "escalation"
            else:
                reminder_type = "overdue"

            reminder = ComplianceReminder(
                compliance_record_id=record.id,
                days_before_expiry=days,
                reminder_type=reminder_type,
                scheduled_date=reminder_date,
                status=ReminderStatus.PENDING,
            )
            self.db.add(reminder)
            reminders.append(reminder)

        await self.db.commit()
        return reminders

    async def get_pending_reminders(
        self,
        since: Optional[datetime] = None,
        until: Optional[datetime] = None,
    ) -> List[ComplianceReminder]:
        """Get reminders that need to be sent."""
        now = datetime.utcnow()
        since = since or now - timedelta(days=1)
        until = until or now

        result = await self.db.execute(
            select(ComplianceReminder).where(
                and_(
                    ComplianceReminder.status == ReminderStatus.PENDING,
                    ComplianceReminder.scheduled_date >= since,
                    ComplianceReminder.scheduled_date <= until,
                )
            ).order_by(ComplianceReminder.scheduled_date.asc())
        )

        return result.scalars().all()

    async def send_reminder(
        self,
        reminder: ComplianceReminder,
        sent_to: List[Dict],
        delivery_method: str = "email"
    ) -> None:
        """
        Mark a reminder as sent.

        In production, this would trigger actual notification sending.
        """
        reminder.status = ReminderStatus.SENT
        reminder.sent_at = datetime.utcnow()
        reminder.sent_to = sent_to
        reminder.delivery_method = delivery_method

        await self.db.commit()

    async def acknowledge_reminder(
        self,
        reminder: ComplianceReminder,
        user: User,
        notes: Optional[str] = None
    ) -> None:
        """Acknowledge a reminder."""
        reminder.status = ReminderStatus.ACKNOWLEDGED
        reminder.acknowledged_by_id = user.id
        reminder.acknowledged_at = datetime.utcnow()
        reminder.acknowledgement_notes = notes

        await self.db.commit()

    async def escalate_reminder(
        self,
        reminder: ComplianceReminder,
        escalate_to: List[UUID]
    ) -> None:
        """Escalate a reminder to additional stakeholders."""
        reminder.status = ReminderStatus.ESCALATED
        reminder.escalation_level += 1
        reminder.escalated_at = datetime.utcnow()
        reminder.escalated_to = [str(uid) for uid in escalate_to]

        await self.db.commit()

    async def get_compliance_for_property(
        self,
        property_id: UUID
    ) -> Dict[ComplianceType, ComplianceRecord]:
        """
        Get all compliance records for a property, keyed by type.

        Returns the most recent record for each type.
        """
        result = await self.db.execute(
            select(ComplianceRecord).where(
                ComplianceRecord.property_id == property_id
            ).order_by(
                ComplianceRecord.compliance_type,
                ComplianceRecord.expiry_date.desc()
            )
        )

        records = result.scalars().all()

        # Group by type, keeping most recent
        by_type = {}
        for record in records:
            if record.compliance_type not in by_type:
                by_type[record.compliance_type] = record

        return by_type

    async def get_missing_compliance(
        self,
        property_id: UUID,
        required_types: Optional[List[ComplianceType]] = None
    ) -> List[ComplianceType]:
        """
        Get compliance types that are missing or expired for a property.

        Args:
            property_id: Property to check
            required_types: Types to check (defaults to all mandatory types)

        Returns:
            List of missing/expired compliance types
        """
        if required_types is None:
            # Default mandatory types for residential lettings
            required_types = [
                ComplianceType.GAS_SAFETY,
                ComplianceType.ELECTRICAL_EICR,
                ComplianceType.EPC,
                ComplianceType.SMOKE_CO_DETECTORS,
            ]

        existing = await self.get_compliance_for_property(property_id)

        missing = []
        for ctype in required_types:
            record = existing.get(ctype)
            if not record or record.status in [
                ComplianceStatus.EXPIRED,
                ComplianceStatus.PENDING,
            ]:
                missing.append(ctype)

        return missing

    async def get_portfolio_dashboard(
        self,
        landlord_id: Optional[UUID] = None,
        property_manager_id: Optional[UUID] = None,
    ) -> Dict:
        """
        Get compliance dashboard for a portfolio of properties.

        Args:
            landlord_id: Filter by landlord
            property_manager_id: Filter by property manager

        Returns:
            Dashboard statistics
        """
        # Get properties
        prop_query = select(Property.id)

        if landlord_id:
            prop_query = prop_query.where(Property.landlord_id == landlord_id)
        if property_manager_id:
            prop_query = prop_query.where(Property.property_manager_id == property_manager_id)

        prop_result = await self.db.execute(prop_query)
        property_ids = [p[0] for p in prop_result.all()]

        if not property_ids:
            return {
                "total_properties": 0,
                "total_records": 0,
                "by_status": {},
                "by_type": {},
                "properties_at_risk": [],
            }

        # Get all compliance records
        result = await self.db.execute(
            select(ComplianceRecord).where(
                ComplianceRecord.property_id.in_(property_ids)
            )
        )
        records = result.scalars().all()

        # Update statuses
        for record in records:
            record.status = self.calculate_status(record.expiry_date)

        # Calculate statistics
        by_status = {s.value: 0 for s in ComplianceStatus}
        by_type = {t.value: {"valid": 0, "expiring": 0, "expired": 0, "pending": 0} for t in ComplianceType}

        for record in records:
            by_status[record.status.value] += 1

            status_key = record.status.value
            if status_key == "expiring_soon":
                status_key = "expiring"

            if record.compliance_type.value in by_type:
                if status_key in by_type[record.compliance_type.value]:
                    by_type[record.compliance_type.value][status_key] += 1

        # Find properties at risk (missing mandatory compliance)
        properties_at_risk = []
        for prop_id in property_ids:
            missing = await self.get_missing_compliance(prop_id)
            if missing:
                properties_at_risk.append({
                    "property_id": str(prop_id),
                    "missing_types": [t.value for t in missing],
                })

        return {
            "total_properties": len(property_ids),
            "total_records": len(records),
            "by_status": by_status,
            "by_type": by_type,
            "properties_at_risk": properties_at_risk[:20],  # Limit to 20
        }

    async def get_upcoming_renewals(
        self,
        days: int = 60,
        landlord_id: Optional[UUID] = None,
        property_manager_id: Optional[UUID] = None,
    ) -> List[ComplianceRecord]:
        """Get compliance records expiring within specified days."""
        cutoff = datetime.utcnow() + timedelta(days=days)

        query = select(ComplianceRecord).where(
            and_(
                ComplianceRecord.expiry_date <= cutoff,
                ComplianceRecord.expiry_date > datetime.utcnow(),
            )
        )

        # Filter by property ownership/management
        if landlord_id or property_manager_id:
            prop_query = select(Property.id)
            if landlord_id:
                prop_query = prop_query.where(Property.landlord_id == landlord_id)
            if property_manager_id:
                prop_query = prop_query.where(Property.property_manager_id == property_manager_id)

            prop_result = await self.db.execute(prop_query)
            property_ids = [p[0] for p in prop_result.all()]

            query = query.where(ComplianceRecord.property_id.in_(property_ids))

        result = await self.db.execute(
            query.order_by(ComplianceRecord.expiry_date.asc())
        )

        return result.scalars().all()
