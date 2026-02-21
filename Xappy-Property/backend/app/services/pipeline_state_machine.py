"""
XAPPY Pipeline State Machine Service

Manages tenant pipeline stage transitions with validation and rules.
"""

from typing import Optional, List, Dict, Tuple
from datetime import datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.tenant import Tenant, TenantPipelineStage, TenantPipelineHistory, TenantStatus
from app.models.user import User


# Define allowed transitions
TRANSITIONS: Dict[TenantPipelineStage, List[TenantPipelineStage]] = {
    TenantPipelineStage.ENQUIRY: [
        TenantPipelineStage.VIEWING_SCHEDULED,
        TenantPipelineStage.WITHDRAWN,
        TenantPipelineStage.REJECTED,
    ],
    TenantPipelineStage.VIEWING_SCHEDULED: [
        TenantPipelineStage.VIEWING_COMPLETED,
        TenantPipelineStage.VIEWING_SCHEDULED,  # Reschedule
        TenantPipelineStage.WITHDRAWN,
        TenantPipelineStage.REJECTED,
    ],
    TenantPipelineStage.VIEWING_COMPLETED: [
        TenantPipelineStage.APPLICATION_STARTED,
        TenantPipelineStage.WITHDRAWN,
        TenantPipelineStage.REJECTED,
    ],
    TenantPipelineStage.APPLICATION_STARTED: [
        TenantPipelineStage.QUALIFICATION_PENDING,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.QUALIFICATION_PENDING: [
        TenantPipelineStage.QUALIFICATION_REVIEW,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.QUALIFICATION_REVIEW: [
        TenantPipelineStage.QUALIFIED,
        TenantPipelineStage.NOT_QUALIFIED,
    ],
    TenantPipelineStage.QUALIFIED: [
        TenantPipelineStage.DOCUMENTS_REQUESTED,
        TenantPipelineStage.WITHDRAWN,
        TenantPipelineStage.REJECTED,
    ],
    TenantPipelineStage.NOT_QUALIFIED: [
        TenantPipelineStage.ARCHIVED,
        TenantPipelineStage.QUALIFICATION_PENDING,  # Allow retry
    ],
    TenantPipelineStage.DOCUMENTS_REQUESTED: [
        TenantPipelineStage.DOCUMENTS_SUBMITTED,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.DOCUMENTS_SUBMITTED: [
        TenantPipelineStage.DOCUMENTS_VERIFIED,
        TenantPipelineStage.DOCUMENTS_REQUESTED,  # Request more
        TenantPipelineStage.REJECTED,
    ],
    TenantPipelineStage.DOCUMENTS_VERIFIED: [
        TenantPipelineStage.HOLDING_DEPOSIT_REQUESTED,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.HOLDING_DEPOSIT_REQUESTED: [
        TenantPipelineStage.HOLDING_DEPOSIT_PAID,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.HOLDING_DEPOSIT_PAID: [
        TenantPipelineStage.REFERENCING,
    ],
    TenantPipelineStage.REFERENCING: [
        TenantPipelineStage.REFERENCING_PASSED,
        TenantPipelineStage.REFERENCING_FAILED,
    ],
    TenantPipelineStage.REFERENCING_PASSED: [
        TenantPipelineStage.CONTRACT_GENERATED,
    ],
    TenantPipelineStage.REFERENCING_FAILED: [
        TenantPipelineStage.ARCHIVED,
        TenantPipelineStage.REFERENCING,  # Allow re-referencing
    ],
    TenantPipelineStage.CONTRACT_GENERATED: [
        TenantPipelineStage.CONTRACT_SENT,
    ],
    TenantPipelineStage.CONTRACT_SENT: [
        TenantPipelineStage.CONTRACT_SIGNED,
        TenantPipelineStage.WITHDRAWN,
    ],
    TenantPipelineStage.CONTRACT_SIGNED: [
        TenantPipelineStage.MOVE_IN_SCHEDULED,
    ],
    TenantPipelineStage.MOVE_IN_SCHEDULED: [
        TenantPipelineStage.TENANCY_STARTED,
    ],
    # Terminal stages (no further transitions)
    TenantPipelineStage.TENANCY_STARTED: [],
    TenantPipelineStage.WITHDRAWN: [TenantPipelineStage.ARCHIVED],
    TenantPipelineStage.REJECTED: [TenantPipelineStage.ARCHIVED],
    TenantPipelineStage.ARCHIVED: [],
}


class PipelineStateMachine:
    """
    State machine for tenant pipeline transitions.

    Supports both automatic transitions and manual overrides.
    Every transition is logged for audit compliance.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    def get_allowed_transitions(self, current_stage: TenantPipelineStage) -> List[TenantPipelineStage]:
        """Get list of allowed transitions from current stage."""
        return TRANSITIONS.get(current_stage, [])

    def can_transition(
        self,
        current_stage: TenantPipelineStage,
        target_stage: TenantPipelineStage,
        allow_override: bool = False
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if transition is allowed.

        Returns:
            Tuple of (is_allowed, error_message)
        """
        if allow_override:
            return True, None

        allowed = self.get_allowed_transitions(current_stage)

        if not allowed:
            return False, f"No transitions allowed from terminal stage: {current_stage.value}"

        if target_stage not in allowed:
            return False, f"Transition from {current_stage.value} to {target_stage.value} is not allowed"

        return True, None

    async def transition(
        self,
        tenant: Tenant,
        target_stage: TenantPipelineStage,
        user: User,
        is_override: bool = False,
        override_reason: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> Tuple[bool, Optional[str]]:
        """
        Execute a pipeline transition.

        Args:
            tenant: The tenant to transition
            target_stage: The target pipeline stage
            user: User executing the transition
            is_override: Whether this is a manual override
            override_reason: Required if is_override is True
            notes: Optional notes about the transition

        Returns:
            Tuple of (success, error_message)
        """
        current_stage = tenant.pipeline_stage

        # Validate transition
        can_do, error = self.can_transition(current_stage, target_stage, allow_override=is_override)

        if not can_do:
            return False, error

        # Require reason for overrides
        if is_override and not override_reason:
            return False, "Override reason is required for manual transitions"

        # Execute transition
        tenant.pipeline_stage = target_stage
        tenant.pipeline_stage_updated_at = datetime.utcnow()

        # Update status for terminal stages
        if target_stage == TenantPipelineStage.TENANCY_STARTED:
            tenant.status = TenantStatus.ACTIVE
        elif target_stage in [
            TenantPipelineStage.WITHDRAWN,
            TenantPipelineStage.REJECTED,
            TenantPipelineStage.ARCHIVED
        ]:
            if tenant.status == TenantStatus.PROSPECT:
                tenant.status = TenantStatus.PAST

        # Record history
        history = TenantPipelineHistory(
            tenant_id=tenant.id,
            from_stage=current_stage,
            to_stage=target_stage,
            triggered_by="manual_override" if is_override else "auto",
            triggered_by_user_id=user.id,
            override_reason=override_reason,
            notes=notes,
        )

        self.db.add(history)
        await self.db.commit()

        return True, None

    async def advance(
        self,
        tenant: Tenant,
        user: User,
        notes: Optional[str] = None,
    ) -> Tuple[bool, Optional[str], Optional[TenantPipelineStage]]:
        """
        Advance tenant to the next logical stage.

        Returns:
            Tuple of (success, error_message, new_stage)
        """
        allowed = self.get_allowed_transitions(tenant.pipeline_stage)

        # Filter out terminal stages for automatic advancement
        non_terminal = [
            s for s in allowed
            if s not in [
                TenantPipelineStage.WITHDRAWN,
                TenantPipelineStage.REJECTED,
                TenantPipelineStage.ARCHIVED,
            ]
        ]

        if not non_terminal:
            return False, "No automatic advancement available", None

        # Take the first non-terminal transition
        target_stage = non_terminal[0]

        success, error = await self.transition(
            tenant=tenant,
            target_stage=target_stage,
            user=user,
            is_override=False,
            notes=notes,
        )

        return success, error, target_stage if success else None

    async def get_history(
        self,
        tenant_id: UUID,
        limit: int = 50
    ) -> List[TenantPipelineHistory]:
        """Get pipeline history for a tenant."""
        result = await self.db.execute(
            select(TenantPipelineHistory)
            .where(TenantPipelineHistory.tenant_id == tenant_id)
            .order_by(TenantPipelineHistory.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

    @staticmethod
    def get_stage_display_name(stage: TenantPipelineStage) -> str:
        """Get human-readable stage name."""
        display_names = {
            TenantPipelineStage.ENQUIRY: "Enquiry Received",
            TenantPipelineStage.VIEWING_SCHEDULED: "Viewing Scheduled",
            TenantPipelineStage.VIEWING_COMPLETED: "Viewing Completed",
            TenantPipelineStage.APPLICATION_STARTED: "Application Started",
            TenantPipelineStage.QUALIFICATION_PENDING: "Qualification Pending",
            TenantPipelineStage.QUALIFICATION_REVIEW: "Under Review",
            TenantPipelineStage.QUALIFIED: "Qualified",
            TenantPipelineStage.NOT_QUALIFIED: "Not Qualified",
            TenantPipelineStage.DOCUMENTS_REQUESTED: "Documents Requested",
            TenantPipelineStage.DOCUMENTS_SUBMITTED: "Documents Submitted",
            TenantPipelineStage.DOCUMENTS_VERIFIED: "Documents Verified",
            TenantPipelineStage.HOLDING_DEPOSIT_REQUESTED: "Holding Deposit Requested",
            TenantPipelineStage.HOLDING_DEPOSIT_PAID: "Holding Deposit Paid",
            TenantPipelineStage.REFERENCING: "Referencing in Progress",
            TenantPipelineStage.REFERENCING_PASSED: "Referencing Passed",
            TenantPipelineStage.REFERENCING_FAILED: "Referencing Failed",
            TenantPipelineStage.CONTRACT_GENERATED: "Contract Generated",
            TenantPipelineStage.CONTRACT_SENT: "Contract Sent",
            TenantPipelineStage.CONTRACT_SIGNED: "Contract Signed",
            TenantPipelineStage.MOVE_IN_SCHEDULED: "Move-in Scheduled",
            TenantPipelineStage.TENANCY_STARTED: "Tenancy Active",
            TenantPipelineStage.WITHDRAWN: "Withdrawn",
            TenantPipelineStage.REJECTED: "Rejected",
            TenantPipelineStage.ARCHIVED: "Archived",
        }
        return display_names.get(stage, stage.value)
