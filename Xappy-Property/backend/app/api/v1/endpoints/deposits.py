"""
XAPPY Deposit API Endpoints

Holding deposit management.
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.deposit import HoldingDeposit, HoldingDepositStatus, PaymentMethod
from app.models.tenant import Tenant, TenantPipelineStage
from app.models.property import Property
from app.api.v1.deps import (
    get_current_active_user,
    require_property_manager,
    require_landlord,
)

router = APIRouter()


# Pydantic schemas
class DepositCreate(BaseModel):
    tenant_id: UUID
    property_id: UUID
    deadline_days: int = Field(default=15, ge=7, le=30)


class MarkPaidRequest(BaseModel):
    payment_method: PaymentMethod
    payment_reference: Optional[str] = None


class RefundRequest(BaseModel):
    refund_reason: str = Field(..., min_length=5)
    refund_amount: Optional[Decimal] = None  # If partial refund


class ForfeitRequest(BaseModel):
    forfeiture_reason: str = Field(..., pattern="^(tenant_withdrew|false_information|failed_referencing|missed_deadline)$")
    explanation: str = Field(..., min_length=10)


class ExtendDeadlineRequest(BaseModel):
    new_deadline: datetime
    reason: str = Field(..., min_length=10)


class DepositResponse(BaseModel):
    id: UUID
    reference: str
    tenant_id: UUID
    property_id: UUID
    amount: Decimal
    weekly_rent: Decimal
    status: HoldingDepositStatus
    deadline_date: datetime
    deadline_extended: bool
    payment_method: Optional[PaymentMethod]
    payment_reference: Optional[str]
    paid_at: Optional[datetime]
    refund_reason: Optional[str]
    refund_amount: Optional[Decimal]
    refunded_at: Optional[datetime]
    forfeiture_reason: Optional[str]
    forfeited_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


async def generate_deposit_reference(db: AsyncSession) -> str:
    """Generate unique deposit reference"""
    result = await db.execute(select(func.count(HoldingDeposit.id)))
    count = result.scalar() or 0
    return f"XP-HD-{count + 1:05d}"


@router.post("", response_model=DepositResponse, status_code=status.HTTP_201_CREATED)
async def create_deposit(
    data: DepositCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """
    Create a holding deposit request.

    Under UK Tenant Fees Act 2019:
    - Max amount is 1 week's rent
    - Default deadline is 15 days
    """
    # Get tenant
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == data.tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )

    # Get property
    property_result = await db.execute(
        select(Property).where(Property.id == data.property_id)
    )
    prop = property_result.scalar_one_or_none()

    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )

    # Calculate weekly rent and deposit amount (max 1 week)
    weekly_rent = (prop.rent_amount * 12) / 52
    deposit_amount = weekly_rent  # Exactly 1 week

    reference = await generate_deposit_reference(db)

    deposit = HoldingDeposit(
        reference=reference,
        tenant_id=data.tenant_id,
        property_id=data.property_id,
        amount=deposit_amount,
        weekly_rent=weekly_rent,
        status=HoldingDepositStatus.REQUESTED,
        deadline_date=datetime.utcnow() + timedelta(days=data.deadline_days),
        requested_by_id=current_user.id,
    )

    db.add(deposit)

    # Update tenant pipeline if appropriate
    if tenant.pipeline_stage == TenantPipelineStage.DOCUMENTS_VERIFIED:
        tenant.pipeline_stage = TenantPipelineStage.HOLDING_DEPOSIT_REQUESTED
        tenant.pipeline_stage_updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(deposit)

    return deposit


@router.get("", response_model=List[DepositResponse])
async def list_deposits(
    status: Optional[HoldingDepositStatus] = None,
    tenant_id: Optional[UUID] = None,
    property_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """List holding deposits."""
    query = select(HoldingDeposit)

    if status:
        query = query.where(HoldingDeposit.status == status)
    if tenant_id:
        query = query.where(HoldingDeposit.tenant_id == tenant_id)
    if property_id:
        query = query.where(HoldingDeposit.property_id == property_id)

    result = await db.execute(query.order_by(HoldingDeposit.created_at.desc()))
    return result.scalars().all()


@router.get("/{deposit_id}", response_model=DepositResponse)
async def get_deposit(
    deposit_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Get a specific deposit."""
    result = await db.execute(
        select(HoldingDeposit).where(HoldingDeposit.id == deposit_id)
    )
    deposit = result.scalar_one_or_none()

    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )

    return deposit


@router.post("/{deposit_id}/mark-paid", response_model=DepositResponse)
async def mark_deposit_paid(
    deposit_id: UUID,
    data: MarkPaidRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Mark a holding deposit as paid."""
    result = await db.execute(
        select(HoldingDeposit).where(HoldingDeposit.id == deposit_id)
    )
    deposit = result.scalar_one_or_none()

    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )

    if deposit.status != HoldingDepositStatus.REQUESTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot mark deposit as paid. Current status: {deposit.status.value}"
        )

    deposit.status = HoldingDepositStatus.PAID
    deposit.payment_method = data.payment_method
    deposit.payment_reference = data.payment_reference
    deposit.paid_at = datetime.utcnow()
    deposit.processed_by_id = current_user.id

    # Update tenant pipeline
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == deposit.tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()

    if tenant and tenant.pipeline_stage == TenantPipelineStage.HOLDING_DEPOSIT_REQUESTED:
        tenant.pipeline_stage = TenantPipelineStage.HOLDING_DEPOSIT_PAID
        tenant.pipeline_stage_updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(deposit)

    return deposit


@router.post("/{deposit_id}/refund", response_model=DepositResponse)
async def refund_deposit(
    deposit_id: UUID,
    data: RefundRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """
    Refund a holding deposit.

    Must be refunded within 7 days if landlord withdraws.
    """
    result = await db.execute(
        select(HoldingDeposit).where(HoldingDeposit.id == deposit_id)
    )
    deposit = result.scalar_one_or_none()

    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )

    if deposit.status != HoldingDepositStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only refund paid deposits"
        )

    deposit.status = HoldingDepositStatus.REFUNDED
    deposit.refund_reason = data.refund_reason
    deposit.refund_amount = data.refund_amount or deposit.amount
    deposit.refunded_at = datetime.utcnow()
    deposit.processed_by_id = current_user.id

    await db.commit()
    await db.refresh(deposit)

    return deposit


@router.post("/{deposit_id}/forfeit", response_model=DepositResponse)
async def forfeit_deposit(
    deposit_id: UUID,
    data: ForfeitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """
    Forfeit a holding deposit.

    Can only forfeit if:
    - Tenant withdrew
    - Tenant provided false information
    - Tenant failed referencing
    - Deadline passed
    """
    result = await db.execute(
        select(HoldingDeposit).where(HoldingDeposit.id == deposit_id)
    )
    deposit = result.scalar_one_or_none()

    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )

    if deposit.status != HoldingDepositStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only forfeit paid deposits"
        )

    # Validate forfeiture reason
    if data.forfeiture_reason == "missed_deadline" and not deposit.is_past_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot forfeit for missed deadline - deadline has not passed"
        )

    deposit.status = HoldingDepositStatus.FORFEITED
    deposit.forfeiture_reason = data.forfeiture_reason
    deposit.forfeiture_explanation = data.explanation
    deposit.forfeited_at = datetime.utcnow()
    deposit.processed_by_id = current_user.id

    await db.commit()
    await db.refresh(deposit)

    return deposit


@router.post("/{deposit_id}/extend-deadline", response_model=DepositResponse)
async def extend_deadline(
    deposit_id: UUID,
    data: ExtendDeadlineRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """
    Extend the deadline for a holding deposit.

    Both parties must agree to extend beyond 15 days.
    """
    result = await db.execute(
        select(HoldingDeposit).where(HoldingDeposit.id == deposit_id)
    )
    deposit = result.scalar_one_or_none()

    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )

    if deposit.status not in [HoldingDepositStatus.REQUESTED, HoldingDepositStatus.PAID]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot extend deadline for this deposit status"
        )

    if not deposit.deadline_extended:
        deposit.original_deadline = deposit.deadline_date

    deposit.deadline_date = data.new_deadline
    deposit.deadline_extended = True
    deposit.extension_reason = data.reason

    await db.commit()
    await db.refresh(deposit)

    return deposit
