"""
XAPPY Cost API Endpoints

Cost tracking and invoice management.
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
from app.models.job_cost import JobCost, CostType, CostStatus, PaymentStatus
from app.api.v1.deps import (
    get_current_active_user,
    require_property_manager,
    require_landlord,
    require_supplier,
)

router = APIRouter()


# Pydantic schemas
class CostCreate(BaseModel):
    job_id: UUID
    cost_type: CostType
    description: str = Field(..., max_length=500)
    quantity: Decimal = Field(default=Decimal("1"), gt=0)
    unit_price: Decimal = Field(..., gt=0)
    vat_rate: Decimal = Field(default=Decimal("20.00"), ge=0, le=100)


class CostApproveRequest(BaseModel):
    approval_notes: Optional[str] = None


class CostRejectRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=10)


class CostQueryRequest(BaseModel):
    query_notes: str = Field(..., min_length=10)


class InvoiceUploadRequest(BaseModel):
    invoice_number: str
    invoice_date: datetime
    invoice_url: str


class CostResponse(BaseModel):
    id: UUID
    reference: str
    job_id: UUID
    cost_type: CostType
    description: str
    quantity: Decimal
    unit_price: Decimal
    net_amount: Decimal
    vat_rate: Decimal
    vat_amount: Decimal
    gross_amount: Decimal
    status: CostStatus
    requires_approval: bool
    approved_by_id: Optional[UUID]
    approved_at: Optional[datetime]
    has_invoice: bool
    invoice_number: Optional[str]
    payment_status: PaymentStatus
    payment_due_date: Optional[datetime]
    paid_at: Optional[datetime]
    chargeback_to_tenant: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CostListResponse(BaseModel):
    items: List[CostResponse]
    total: int
    total_net: Decimal
    total_vat: Decimal
    total_gross: Decimal


async def generate_cost_reference(db: AsyncSession) -> str:
    """Generate unique cost reference"""
    result = await db.execute(select(func.count(JobCost.id)))
    count = result.scalar() or 0
    return f"XP-COST-{count + 1:05d}"


@router.post("", response_model=CostResponse, status_code=status.HTTP_201_CREATED)
async def create_cost(
    data: CostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_supplier),
):
    """
    Create a cost entry for a job.

    Costs above a threshold require landlord approval.
    """
    reference = await generate_cost_reference(db)

    # Calculate amounts
    net_amount = data.quantity * data.unit_price
    vat_amount = net_amount * (data.vat_rate / 100)
    gross_amount = net_amount + vat_amount

    # Determine if approval required (e.g., above £500)
    approval_threshold = Decimal("500.00")
    requires_approval = gross_amount > approval_threshold

    cost = JobCost(
        reference=reference,
        job_id=data.job_id,
        cost_type=data.cost_type,
        description=data.description,
        quantity=data.quantity,
        unit_price=data.unit_price,
        net_amount=net_amount,
        vat_rate=data.vat_rate,
        vat_amount=vat_amount,
        gross_amount=gross_amount,
        status=CostStatus.PENDING,
        requires_approval=requires_approval,
        approval_threshold=approval_threshold if requires_approval else None,
        submitted_by_id=current_user.id,
        payment_due_date=datetime.utcnow() + timedelta(days=30),
    )

    db.add(cost)
    await db.commit()
    await db.refresh(cost)

    return cost


@router.get("", response_model=CostListResponse)
async def list_costs(
    job_id: Optional[UUID] = None,
    status: Optional[CostStatus] = None,
    payment_status: Optional[PaymentStatus] = None,
    cost_type: Optional[CostType] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """List costs with filtering and totals."""
    query = select(JobCost)

    if job_id:
        query = query.where(JobCost.job_id == job_id)
    if status:
        query = query.where(JobCost.status == status)
    if payment_status:
        query = query.where(JobCost.payment_status == payment_status)
    if cost_type:
        query = query.where(JobCost.cost_type == cost_type)

    result = await db.execute(query.order_by(JobCost.created_at.desc()))
    costs = result.scalars().all()

    # Calculate totals
    total_net = sum(c.net_amount for c in costs)
    total_vat = sum(c.vat_amount for c in costs)
    total_gross = sum(c.gross_amount for c in costs)

    return CostListResponse(
        items=costs,
        total=len(costs),
        total_net=total_net,
        total_vat=total_vat,
        total_gross=total_gross,
    )


@router.get("/{cost_id}", response_model=CostResponse)
async def get_cost(
    cost_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Get a specific cost."""
    result = await db.execute(
        select(JobCost).where(JobCost.id == cost_id)
    )
    cost = result.scalar_one_or_none()

    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cost not found"
        )

    return cost


@router.post("/{cost_id}/approve", response_model=CostResponse)
async def approve_cost(
    cost_id: UUID,
    data: CostApproveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Approve a cost for payment."""
    result = await db.execute(
        select(JobCost).where(JobCost.id == cost_id)
    )
    cost = result.scalar_one_or_none()

    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cost not found"
        )

    if cost.status != CostStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve cost in status: {cost.status.value}"
        )

    cost.status = CostStatus.APPROVED
    cost.approved_by_id = current_user.id
    cost.approved_at = datetime.utcnow()
    cost.approval_notes = data.approval_notes

    await db.commit()
    await db.refresh(cost)

    return cost


@router.post("/{cost_id}/reject", response_model=CostResponse)
async def reject_cost(
    cost_id: UUID,
    data: CostRejectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Reject a cost."""
    result = await db.execute(
        select(JobCost).where(JobCost.id == cost_id)
    )
    cost = result.scalar_one_or_none()

    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cost not found"
        )

    if cost.status != CostStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject cost in status: {cost.status.value}"
        )

    cost.status = CostStatus.REJECTED
    cost.rejection_reason = data.rejection_reason

    await db.commit()
    await db.refresh(cost)

    return cost


@router.post("/{cost_id}/query", response_model=CostResponse)
async def query_cost(
    cost_id: UUID,
    data: CostQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Raise a query on a cost."""
    result = await db.execute(
        select(JobCost).where(JobCost.id == cost_id)
    )
    cost = result.scalar_one_or_none()

    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cost not found"
        )

    cost.status = CostStatus.QUERIED
    cost.query_notes = data.query_notes

    await db.commit()
    await db.refresh(cost)

    return cost


@router.post("/{cost_id}/upload-invoice", response_model=CostResponse)
async def upload_invoice(
    cost_id: UUID,
    data: InvoiceUploadRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_supplier),
):
    """Upload an invoice for a cost."""
    result = await db.execute(
        select(JobCost).where(JobCost.id == cost_id)
    )
    cost = result.scalar_one_or_none()

    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cost not found"
        )

    cost.has_invoice = True
    cost.invoice_number = data.invoice_number
    cost.invoice_date = data.invoice_date
    cost.invoice_url = data.invoice_url

    await db.commit()
    await db.refresh(cost)

    return cost


@router.post("/{cost_id}/mark-paid", response_model=CostResponse)
async def mark_cost_paid(
    cost_id: UUID,
    payment_reference: Optional[str] = None,
    payment_method: str = "bank_transfer",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """Mark a cost as paid."""
    result = await db.execute(
        select(JobCost).where(JobCost.id == cost_id)
    )
    cost = result.scalar_one_or_none()

    if not cost:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cost not found"
        )

    if cost.status != CostStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cost must be approved before marking as paid"
        )

    cost.status = CostStatus.PAID
    cost.payment_status = PaymentStatus.PAID
    cost.paid_at = datetime.utcnow()
    cost.payment_reference = payment_reference
    cost.payment_method = payment_method

    await db.commit()
    await db.refresh(cost)

    return cost
