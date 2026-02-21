"""
XAPPY SLA Service

SLA calculation and monitoring for maintenance issues.
"""

from typing import Optional, Dict, List
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models.maintenance import (
    MaintenanceIssue, MaintenanceJob,
    IssuePriority, IssueStatus, SLA_TARGETS
)


class SLAService:
    """
    Service for calculating and monitoring SLA compliance.

    SLA Targets:
    - CRITICAL: 4 hours
    - HIGH: 24 hours
    - MEDIUM: 72 hours (3 days)
    - LOW: 168 hours (7 days)
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def get_sla_hours(priority: IssuePriority) -> int:
        """Get SLA target hours for a priority level."""
        return SLA_TARGETS.get(priority, 72)

    @staticmethod
    def calculate_deadline(
        reported_at: datetime,
        priority: IssuePriority,
        business_hours_only: bool = False
    ) -> datetime:
        """
        Calculate SLA deadline from reported time.

        Args:
            reported_at: When the issue was reported
            priority: Issue priority level
            business_hours_only: Whether to only count business hours (9am-5pm Mon-Fri)

        Returns:
            Deadline datetime
        """
        hours = SLAService.get_sla_hours(priority)

        if not business_hours_only:
            return reported_at + timedelta(hours=hours)

        # Business hours calculation (simplified)
        # In production, use a proper business hours library
        deadline = reported_at
        remaining_hours = hours

        while remaining_hours > 0:
            deadline += timedelta(hours=1)

            # Check if it's a business hour (Mon-Fri, 9am-5pm)
            if deadline.weekday() < 5 and 9 <= deadline.hour < 17:
                remaining_hours -= 1

        return deadline

    @staticmethod
    def is_breached(issue: MaintenanceIssue) -> bool:
        """Check if an issue has breached its SLA."""
        if issue.status in [
            IssueStatus.COMPLETED,
            IssueStatus.VERIFIED,
            IssueStatus.CLOSED,
            IssueStatus.CANCELLED,
        ]:
            return issue.sla_breached

        now = datetime.utcnow()
        deadline = issue.sla_deadline.replace(tzinfo=None) if issue.sla_deadline.tzinfo else issue.sla_deadline

        return now > deadline

    @staticmethod
    def time_remaining(issue: MaintenanceIssue) -> Optional[timedelta]:
        """
        Get time remaining until SLA breach.

        Returns:
            timedelta if issue is open, None if closed/breached
        """
        if issue.status in [
            IssueStatus.COMPLETED,
            IssueStatus.VERIFIED,
            IssueStatus.CLOSED,
            IssueStatus.CANCELLED,
        ]:
            return None

        now = datetime.utcnow()
        deadline = issue.sla_deadline.replace(tzinfo=None) if issue.sla_deadline.tzinfo else issue.sla_deadline

        remaining = deadline - now

        if remaining.total_seconds() < 0:
            return timedelta(0)

        return remaining

    @staticmethod
    def get_urgency_level(issue: MaintenanceIssue) -> str:
        """
        Get urgency level based on time remaining.

        Returns:
            "overdue", "critical", "warning", "normal"
        """
        remaining = SLAService.time_remaining(issue)

        if remaining is None:
            return "closed"

        hours_remaining = remaining.total_seconds() / 3600

        if hours_remaining <= 0:
            return "overdue"
        elif hours_remaining <= 2:
            return "critical"
        elif hours_remaining <= 8:
            return "warning"
        else:
            return "normal"

    async def get_issues_at_risk(
        self,
        property_id: Optional[UUID] = None,
        hours_threshold: int = 4
    ) -> List[MaintenanceIssue]:
        """
        Get issues that are at risk of breaching SLA.

        Args:
            property_id: Optional filter by property
            hours_threshold: Hours before deadline to consider "at risk"

        Returns:
            List of issues at risk
        """
        now = datetime.utcnow()
        threshold = now + timedelta(hours=hours_threshold)

        query = select(MaintenanceIssue).where(
            and_(
                MaintenanceIssue.status.in_([
                    IssueStatus.REPORTED,
                    IssueStatus.ACKNOWLEDGED,
                    IssueStatus.ASSESSING,
                    IssueStatus.AWAITING_APPROVAL,
                    IssueStatus.APPROVED,
                    IssueStatus.ASSIGNED,
                    IssueStatus.SCHEDULED,
                    IssueStatus.IN_PROGRESS,
                ]),
                MaintenanceIssue.sla_deadline <= threshold,
                MaintenanceIssue.sla_breached == False,
            )
        )

        if property_id:
            query = query.where(MaintenanceIssue.property_id == property_id)

        result = await self.db.execute(
            query.order_by(MaintenanceIssue.sla_deadline.asc())
        )

        return result.scalars().all()

    async def get_breached_issues(
        self,
        property_id: Optional[UUID] = None
    ) -> List[MaintenanceIssue]:
        """Get all currently breached issues."""
        query = select(MaintenanceIssue).where(
            and_(
                MaintenanceIssue.status.in_([
                    IssueStatus.REPORTED,
                    IssueStatus.ACKNOWLEDGED,
                    IssueStatus.ASSESSING,
                    IssueStatus.AWAITING_APPROVAL,
                    IssueStatus.APPROVED,
                    IssueStatus.ASSIGNED,
                    IssueStatus.SCHEDULED,
                    IssueStatus.IN_PROGRESS,
                    IssueStatus.ON_HOLD,
                ]),
                MaintenanceIssue.sla_breached == True,
            )
        )

        if property_id:
            query = query.where(MaintenanceIssue.property_id == property_id)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def update_breach_status(self) -> int:
        """
        Update SLA breach status for all open issues.

        Should be run periodically (e.g., every 5 minutes).

        Returns:
            Number of newly breached issues
        """
        now = datetime.utcnow()

        # Get all open issues past deadline
        query = select(MaintenanceIssue).where(
            and_(
                MaintenanceIssue.status.in_([
                    IssueStatus.REPORTED,
                    IssueStatus.ACKNOWLEDGED,
                    IssueStatus.ASSESSING,
                    IssueStatus.AWAITING_APPROVAL,
                    IssueStatus.APPROVED,
                    IssueStatus.ASSIGNED,
                    IssueStatus.SCHEDULED,
                    IssueStatus.IN_PROGRESS,
                    IssueStatus.ON_HOLD,
                ]),
                MaintenanceIssue.sla_deadline <= now,
                MaintenanceIssue.sla_breached == False,
            )
        )

        result = await self.db.execute(query)
        issues = result.scalars().all()

        count = 0
        for issue in issues:
            issue.sla_breached = True
            issue.sla_breached_at = now
            count += 1

        if count > 0:
            await self.db.commit()

        return count

    async def get_sla_statistics(
        self,
        property_id: Optional[UUID] = None,
        days: int = 30
    ) -> Dict:
        """
        Get SLA statistics for reporting.

        Args:
            property_id: Optional filter by property
            days: Number of days to look back

        Returns:
            Dictionary with SLA metrics
        """
        since = datetime.utcnow() - timedelta(days=days)

        # Base query for closed issues
        base_query = select(MaintenanceIssue).where(
            and_(
                MaintenanceIssue.status.in_([
                    IssueStatus.COMPLETED,
                    IssueStatus.VERIFIED,
                    IssueStatus.CLOSED,
                ]),
                MaintenanceIssue.completed_at >= since,
            )
        )

        if property_id:
            base_query = base_query.where(MaintenanceIssue.property_id == property_id)

        result = await self.db.execute(base_query)
        completed_issues = result.scalars().all()

        total = len(completed_issues)
        breached = sum(1 for i in completed_issues if i.sla_breached)
        on_time = total - breached

        # Calculate average response time
        response_times = []
        for issue in completed_issues:
            if issue.acknowledged_at and issue.reported_at:
                ack_time = issue.acknowledged_at.replace(tzinfo=None) if issue.acknowledged_at.tzinfo else issue.acknowledged_at
                rep_time = issue.reported_at.replace(tzinfo=None) if issue.reported_at.tzinfo else issue.reported_at
                response_times.append((ack_time - rep_time).total_seconds() / 3600)

        avg_response = sum(response_times) / len(response_times) if response_times else 0

        # Calculate average resolution time
        resolution_times = []
        for issue in completed_issues:
            if issue.completed_at and issue.reported_at:
                comp_time = issue.completed_at.replace(tzinfo=None) if issue.completed_at.tzinfo else issue.completed_at
                rep_time = issue.reported_at.replace(tzinfo=None) if issue.reported_at.tzinfo else issue.reported_at
                resolution_times.append((comp_time - rep_time).total_seconds() / 3600)

        avg_resolution = sum(resolution_times) / len(resolution_times) if resolution_times else 0

        return {
            "period_days": days,
            "total_completed": total,
            "on_time": on_time,
            "breached": breached,
            "on_time_percentage": (on_time / total * 100) if total > 0 else 100,
            "average_response_hours": round(avg_response, 2),
            "average_resolution_hours": round(avg_resolution, 2),
            "by_priority": {
                p.value: {
                    "total": sum(1 for i in completed_issues if i.priority == p),
                    "on_time": sum(1 for i in completed_issues if i.priority == p and not i.sla_breached),
                }
                for p in IssuePriority
            }
        }
