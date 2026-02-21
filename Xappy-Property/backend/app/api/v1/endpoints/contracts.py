"""
XAPPY Contract API Endpoints

Contract templates and tenancy agreements.
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime
import hashlib
import re

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.contract import (
    ContractTemplate, TenancyAgreement, SignatureAuditEntry,
    TemplateStatus, AgreementStatus, SignatureStatus
)
from app.models.property import Property
from app.models.tenant import Tenant, TenantPipelineStage
from app.api.v1.deps import (
    get_current_active_user,
    require_property_manager,
    require_landlord,
)

router = APIRouter()


# Pydantic schemas
class TemplateCreate(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    template_code: str = Field(..., max_length=50, pattern="^[A-Z0-9-]+$")
    tenancy_type: str
    html_content: str
    clauses: Optional[List[dict]] = None
    variables: Optional[List[dict]] = None
    is_default: bool = False


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    html_content: Optional[str] = None
    clauses: Optional[List[dict]] = None
    status: Optional[TemplateStatus] = None
    is_default: Optional[bool] = None


class GenerateContractRequest(BaseModel):
    template_id: UUID
    property_id: UUID
    tenant_id: UUID
    variable_values: dict
    custom_clauses: Optional[List[dict]] = None


class SendForSigningRequest(BaseModel):
    signatories: List[dict]  # [{user_id, role, name, email}]
    esign_provider: str = "manual"  # "docusign", "hellosign", "manual"


class SignContractRequest(BaseModel):
    signature_data: Optional[str] = None  # Base64 signature image


class TemplateResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    template_code: str
    tenancy_type: str
    status: TemplateStatus
    is_default: bool
    html_content: str
    clauses: Optional[List[dict]]
    variables: Optional[List[dict]]
    version: int
    created_at: datetime

    class Config:
        from_attributes = True


class AgreementResponse(BaseModel):
    id: UUID
    reference: str
    template_id: UUID
    property_id: UUID
    status: AgreementStatus
    generated_html: str
    variable_values: dict
    signatories: List[dict]
    esign_provider: Optional[str]
    sent_at: Optional[datetime]
    completed_at: Optional[datetime]
    effective_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


async def generate_agreement_reference(db: AsyncSession) -> str:
    """Generate unique agreement reference"""
    result = await db.execute(select(func.count(TenancyAgreement.id)))
    count = result.scalar() or 0
    return f"XP-AGR-{count + 1:05d}"


def substitute_variables(html: str, values: dict) -> str:
    """Replace {{variable}} placeholders with actual values"""
    def replace(match):
        var_name = match.group(1)
        return str(values.get(var_name, f"[{var_name}]"))

    return re.sub(r'\{\{(\w+)\}\}', replace, html)


@router.get("/templates", response_model=List[TemplateResponse])
async def list_templates(
    status: Optional[TemplateStatus] = None,
    tenancy_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """List contract templates."""
    query = select(ContractTemplate)

    if status:
        query = query.where(ContractTemplate.status == status)
    if tenancy_type:
        query = query.where(ContractTemplate.tenancy_type == tenancy_type)

    result = await db.execute(query.order_by(ContractTemplate.created_at.desc()))
    return result.scalars().all()


@router.post("/templates", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    data: TemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """Create a new contract template."""
    # Check for duplicate code
    existing = await db.execute(
        select(ContractTemplate).where(ContractTemplate.template_code == data.template_code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Template code already exists"
        )

    template = ContractTemplate(
        name=data.name,
        description=data.description,
        template_code=data.template_code,
        tenancy_type=data.tenancy_type,
        html_content=data.html_content,
        clauses=data.clauses,
        variables=data.variables,
        is_default=data.is_default,
        status=TemplateStatus.DRAFT,
        created_by_id=current_user.id,
    )

    db.add(template)
    await db.commit()
    await db.refresh(template)

    return template


@router.get("/templates/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Get a specific template."""
    result = await db.execute(
        select(ContractTemplate).where(ContractTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    return template


@router.put("/templates/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: UUID,
    data: TemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """Update a contract template."""
    result = await db.execute(
        select(ContractTemplate).where(ContractTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    update_data = data.model_dump(exclude_unset=True)

    # If content changed, increment version
    if 'html_content' in update_data and update_data['html_content'] != template.html_content:
        template.version += 1

    for field, value in update_data.items():
        setattr(template, field, value)

    await db.commit()
    await db.refresh(template)

    return template


@router.post("/generate", response_model=AgreementResponse)
async def generate_contract(
    data: GenerateContractRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """
    Generate a tenancy agreement from a template.

    Substitutes variables and creates the agreement record.
    """
    # Get template
    template_result = await db.execute(
        select(ContractTemplate).where(ContractTemplate.id == data.template_id)
    )
    template = template_result.scalar_one_or_none()

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    if template.status != TemplateStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Template is not active"
        )

    # Verify property and tenant exist
    property_result = await db.execute(
        select(Property).where(Property.id == data.property_id)
    )
    if not property_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )

    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == data.tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )

    # Generate HTML
    generated_html = substitute_variables(template.html_content, data.variable_values)

    # Compute content hash
    content_hash = hashlib.sha256(generated_html.encode()).hexdigest()

    reference = await generate_agreement_reference(db)

    agreement = TenancyAgreement(
        reference=reference,
        template_id=data.template_id,
        property_id=data.property_id,
        status=AgreementStatus.DRAFT,
        generated_html=generated_html,
        variable_values=data.variable_values,
        custom_clauses=data.custom_clauses,
        content_hash=content_hash,
        signatories=[],
        created_by_id=current_user.id,
    )

    db.add(agreement)

    # Update tenant pipeline
    if tenant.pipeline_stage == TenantPipelineStage.REFERENCING_PASSED:
        tenant.pipeline_stage = TenantPipelineStage.CONTRACT_GENERATED
        tenant.pipeline_stage_updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(agreement)

    return agreement


@router.post("/{agreement_id}/send-for-signing", response_model=AgreementResponse)
async def send_for_signing(
    agreement_id: UUID,
    data: SendForSigningRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """Send contract for e-signatures."""
    result = await db.execute(
        select(TenancyAgreement).where(TenancyAgreement.id == agreement_id)
    )
    agreement = result.scalar_one_or_none()

    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agreement not found"
        )

    if agreement.status not in [AgreementStatus.DRAFT, AgreementStatus.PENDING_REVIEW, AgreementStatus.READY_TO_SEND]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot send agreement in status: {agreement.status.value}"
        )

    # Add signature status to signatories
    signatories = []
    for s in data.signatories:
        signatories.append({
            **s,
            "status": SignatureStatus.PENDING.value,
            "signed_at": None,
            "ip_address": None,
        })

    agreement.signatories = signatories
    agreement.esign_provider = data.esign_provider
    agreement.status = AgreementStatus.SENT
    agreement.sent_at = datetime.utcnow()

    await db.commit()
    await db.refresh(agreement)

    return agreement


@router.post("/{agreement_id}/sign", response_model=AgreementResponse)
async def sign_contract(
    agreement_id: UUID,
    data: SignContractRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Sign the contract (tenant or landlord)."""
    result = await db.execute(
        select(TenancyAgreement).where(TenancyAgreement.id == agreement_id)
    )
    agreement = result.scalar_one_or_none()

    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agreement not found"
        )

    if agreement.status not in [AgreementStatus.SENT, AgreementStatus.PARTIALLY_SIGNED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot sign agreement in status: {agreement.status.value}"
        )

    # Find current user in signatories
    signer_found = False
    signatories = agreement.signatories.copy()

    for i, s in enumerate(signatories):
        if s.get('user_id') == str(current_user.id) or s.get('email') == current_user.email:
            if s.get('status') == SignatureStatus.SIGNED.value:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You have already signed this agreement"
                )

            signatories[i]['status'] = SignatureStatus.SIGNED.value
            signatories[i]['signed_at'] = datetime.utcnow().isoformat()
            signatories[i]['ip_address'] = request.client.host if request.client else None
            signer_found = True
            break

    if not signer_found:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a signatory on this agreement"
        )

    agreement.signatories = signatories

    # Create audit entry
    audit = SignatureAuditEntry(
        agreement_id=agreement.id,
        user_id=current_user.id,
        signer_name=current_user.full_name,
        signer_email=current_user.email or "",
        signer_role=next((s['role'] for s in signatories if s.get('user_id') == str(current_user.id)), "unknown"),
        action="signed",
        ip_address=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("user-agent", "")[:500],
        entry_hash="",
    )
    audit.entry_hash = audit.compute_hash()
    db.add(audit)

    # Check if all signed
    if agreement.all_signed:
        agreement.status = AgreementStatus.FULLY_SIGNED
        agreement.completed_at = datetime.utcnow()

        # Update tenant pipeline
        # Find tenant from property relationship
        prop_result = await db.execute(
            select(Property).where(Property.id == agreement.property_id)
        )
        prop = prop_result.scalar_one_or_none()
        if prop:
            tenant_result = await db.execute(
                select(Tenant).where(Tenant.interested_property_id == agreement.property_id)
            )
            tenant = tenant_result.scalar_one_or_none()
            if tenant and tenant.pipeline_stage == TenantPipelineStage.CONTRACT_SENT:
                tenant.pipeline_stage = TenantPipelineStage.CONTRACT_SIGNED
                tenant.pipeline_stage_updated_at = datetime.utcnow()
    else:
        agreement.status = AgreementStatus.PARTIALLY_SIGNED

    await db.commit()
    await db.refresh(agreement)

    return agreement


@router.get("", response_model=List[AgreementResponse])
async def list_agreements(
    status: Optional[AgreementStatus] = None,
    property_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """List tenancy agreements."""
    query = select(TenancyAgreement)

    if status:
        query = query.where(TenancyAgreement.status == status)
    if property_id:
        query = query.where(TenancyAgreement.property_id == property_id)

    result = await db.execute(query.order_by(TenancyAgreement.created_at.desc()))
    return result.scalars().all()


@router.get("/{agreement_id}", response_model=AgreementResponse)
async def get_agreement(
    agreement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific agreement."""
    result = await db.execute(
        select(TenancyAgreement).where(TenancyAgreement.id == agreement_id)
    )
    agreement = result.scalar_one_or_none()

    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agreement not found"
        )

    return agreement
