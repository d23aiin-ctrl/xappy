"""
XAPPY Qualification API Endpoints

Questionnaires and qualification responses.
"""

from typing import Optional, List
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.questionnaire import (
    Questionnaire, QuestionnaireQuestion, QualificationResponse,
    QuestionType, QuestionnaireStatus, ResponseStatus
)
from app.models.tenant import Tenant, TenantPipelineStage
from app.api.v1.deps import (
    get_current_active_user,
    require_property_manager,
    require_landlord,
    require_tenant,
)

router = APIRouter()


# Pydantic schemas
class QuestionCreate(BaseModel):
    question_text: str
    help_text: Optional[str] = None
    question_type: QuestionType
    options: Optional[List[dict]] = None
    is_required: bool = True
    min_value: Optional[int] = None
    max_value: Optional[int] = None
    score_weight: int = 1
    auto_fail_value: Optional[str] = None
    section: Optional[str] = None
    order: int = 0


class QuestionnaireCreate(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    is_default: bool = False
    property_id: Optional[UUID] = None
    use_scoring: bool = False
    pass_threshold: Optional[int] = None
    questions: List[QuestionCreate] = []


class QuestionnaireUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[QuestionnaireStatus] = None
    is_default: Optional[bool] = None
    use_scoring: Optional[bool] = None
    pass_threshold: Optional[int] = None


class SubmitResponseRequest(BaseModel):
    questionnaire_id: UUID
    property_id: Optional[UUID] = None
    answers: dict  # {question_id: answer_value}


class ReviewResponseRequest(BaseModel):
    status: ResponseStatus
    review_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    manual_override: bool = False
    override_reason: Optional[str] = None


class QuestionResponse(BaseModel):
    id: UUID
    question_text: str
    help_text: Optional[str]
    question_type: QuestionType
    options: Optional[List[dict]]
    is_required: bool
    section: Optional[str]
    order: int

    class Config:
        from_attributes = True


class QuestionnaireResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    is_default: bool
    property_id: Optional[UUID]
    status: QuestionnaireStatus
    use_scoring: bool
    pass_threshold: Optional[int]
    version: int
    questions: List[QuestionResponse]
    created_at: datetime

    class Config:
        from_attributes = True


class QualificationResponseSchema(BaseModel):
    id: UUID
    questionnaire_id: UUID
    tenant_id: UUID
    property_id: Optional[UUID]
    status: ResponseStatus
    answers: dict
    total_score: Optional[int]
    max_possible_score: Optional[int]
    passed_threshold: Optional[bool]
    auto_failed: bool
    auto_fail_reason: Optional[str]
    reviewed_by_id: Optional[UUID]
    reviewed_at: Optional[datetime]
    review_notes: Optional[str]
    rejection_reason: Optional[str]
    submitted_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/questionnaires", response_model=QuestionnaireResponse, status_code=status.HTTP_201_CREATED)
async def create_questionnaire(
    data: QuestionnaireCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """Create a new questionnaire with questions."""
    questionnaire = Questionnaire(
        name=data.name,
        description=data.description,
        is_default=data.is_default,
        property_id=data.property_id,
        use_scoring=data.use_scoring,
        pass_threshold=data.pass_threshold,
        status=QuestionnaireStatus.DRAFT,
        created_by_id=current_user.id,
    )
    db.add(questionnaire)
    await db.flush()

    # Add questions
    for q_data in data.questions:
        question = QuestionnaireQuestion(
            questionnaire_id=questionnaire.id,
            question_text=q_data.question_text,
            help_text=q_data.help_text,
            question_type=q_data.question_type,
            options=q_data.options,
            is_required=q_data.is_required,
            min_value=q_data.min_value,
            max_value=q_data.max_value,
            score_weight=q_data.score_weight,
            auto_fail_value=q_data.auto_fail_value,
            section=q_data.section,
            order=q_data.order,
        )
        db.add(question)

    await db.commit()
    await db.refresh(questionnaire)

    return questionnaire


@router.get("/questionnaires", response_model=List[QuestionnaireResponse])
async def list_questionnaires(
    status: Optional[QuestionnaireStatus] = None,
    property_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """List questionnaires."""
    query = select(Questionnaire)

    if status:
        query = query.where(Questionnaire.status == status)
    if property_id:
        query = query.where(Questionnaire.property_id == property_id)

    result = await db.execute(query.order_by(Questionnaire.created_at.desc()))
    return result.scalars().all()


@router.get("/questionnaires/{questionnaire_id}", response_model=QuestionnaireResponse)
async def get_questionnaire(
    questionnaire_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a questionnaire by ID."""
    result = await db.execute(
        select(Questionnaire).where(Questionnaire.id == questionnaire_id)
    )
    questionnaire = result.scalar_one_or_none()

    if not questionnaire:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questionnaire not found"
        )

    return questionnaire


@router.put("/questionnaires/{questionnaire_id}", response_model=QuestionnaireResponse)
async def update_questionnaire(
    questionnaire_id: UUID,
    data: QuestionnaireUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """Update a questionnaire."""
    result = await db.execute(
        select(Questionnaire).where(Questionnaire.id == questionnaire_id)
    )
    questionnaire = result.scalar_one_or_none()

    if not questionnaire:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questionnaire not found"
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(questionnaire, field, value)

    await db.commit()
    await db.refresh(questionnaire)

    return questionnaire


@router.post("/{tenant_id}/submit", response_model=QualificationResponseSchema)
async def submit_qualification(
    tenant_id: UUID,
    data: SubmitResponseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Submit qualification questionnaire responses.

    Can be submitted by tenant themselves or by an agent on their behalf.
    """
    # Get tenant
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )

    # Verify access
    if current_user.role == UserRole.TENANT and tenant.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only submit your own qualifications"
        )

    # Get questionnaire
    q_result = await db.execute(
        select(Questionnaire).where(Questionnaire.id == data.questionnaire_id)
    )
    questionnaire = q_result.scalar_one_or_none()

    if not questionnaire:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questionnaire not found"
        )

    # Calculate scores if scoring enabled
    total_score = 0
    max_score = 0
    auto_failed = False
    auto_fail_reason = None

    if questionnaire.use_scoring:
        for question in questionnaire.questions:
            q_id = str(question.id)
            answer = data.answers.get(q_id)

            max_score += question.score_weight

            if answer and question.auto_fail_value and str(answer) == question.auto_fail_value:
                auto_failed = True
                auto_fail_reason = f"Failed on question: {question.question_text[:50]}..."

            if question.options and answer:
                for opt in question.options:
                    if opt.get('value') == answer:
                        total_score += opt.get('score', 0) * question.score_weight
                        break

    passed = None
    if questionnaire.use_scoring and questionnaire.pass_threshold:
        passed = total_score >= questionnaire.pass_threshold and not auto_failed

    # Create response
    response = QualificationResponse(
        questionnaire_id=data.questionnaire_id,
        tenant_id=tenant_id,
        property_id=data.property_id or tenant.interested_property_id,
        status=ResponseStatus.SUBMITTED,
        answers=data.answers,
        total_score=total_score if questionnaire.use_scoring else None,
        max_possible_score=max_score if questionnaire.use_scoring else None,
        passed_threshold=passed,
        auto_failed=auto_failed,
        auto_fail_reason=auto_fail_reason,
        submitted_at=datetime.utcnow(),
    )

    db.add(response)

    # Update tenant pipeline stage
    if tenant.pipeline_stage == TenantPipelineStage.QUALIFICATION_PENDING:
        tenant.pipeline_stage = TenantPipelineStage.QUALIFICATION_REVIEW
        tenant.pipeline_stage_updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(response)

    return response


@router.post("/{tenant_id}/review", response_model=QualificationResponseSchema)
async def review_qualification(
    tenant_id: UUID,
    response_id: UUID,
    data: ReviewResponseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_property_manager),
):
    """
    Review a qualification response.

    AI should NOT auto-approve - this always requires human review.
    """
    # Get the response
    result = await db.execute(
        select(QualificationResponse).where(
            QualificationResponse.id == response_id,
            QualificationResponse.tenant_id == tenant_id
        )
    )
    response = result.scalar_one_or_none()

    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Qualification response not found"
        )

    if response.status not in [ResponseStatus.SUBMITTED, ResponseStatus.UNDER_REVIEW]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Response has already been reviewed"
        )

    # Update response
    response.status = data.status
    response.reviewed_by_id = current_user.id
    response.reviewed_at = datetime.utcnow()
    response.review_notes = data.review_notes
    response.rejection_reason = data.rejection_reason

    if data.manual_override:
        response.manually_overridden = True
        response.override_reason = data.override_reason

    # Update tenant pipeline
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.id == tenant_id)
    )
    tenant = tenant_result.scalar_one_or_none()

    if tenant:
        if data.status == ResponseStatus.APPROVED:
            tenant.pipeline_stage = TenantPipelineStage.QUALIFIED
        elif data.status == ResponseStatus.REJECTED:
            tenant.pipeline_stage = TenantPipelineStage.NOT_QUALIFIED
        tenant.pipeline_stage_updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(response)

    return response


@router.get("/{tenant_id}/responses", response_model=List[QualificationResponseSchema])
async def get_tenant_responses(
    tenant_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_landlord),
):
    """Get all qualification responses for a tenant."""
    result = await db.execute(
        select(QualificationResponse)
        .where(QualificationResponse.tenant_id == tenant_id)
        .order_by(QualificationResponse.created_at.desc())
    )
    return result.scalars().all()
