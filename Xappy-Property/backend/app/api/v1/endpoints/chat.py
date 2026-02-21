
import copy
import uuid
from typing import Optional, List, Any
import time
from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.api.v1.deps import get_current_active_user
from app.services.chat_reporting import (
    create_report_from_draft,
    query_reports,
    build_draft_state,
    build_quick_actions,
    apply_field_updates,
)
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User
from app.models.conversation import (
    Conversation,
    ConversationContext,
    ConversationStatus,
    Message,
    MessageDirection,
    MessageType,
)
from app.services.chat_reporting import create_report_from_draft, query_reports
from app.services.agent.graph_agent import run_agent
from app.models.report import ReportType

# ------------------------------------------------------------------------------
# Pydantic Models (matching Swift DTOs)
# ------------------------------------------------------------------------------

class DemoSessionResponse(BaseModel):
    session_id: str = Field(..., alias="sessionId")
    expires_at: Optional[str] = Field(None, alias="expiresAt")
    language: Optional[str] = "en"

class DemoChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = Field(None, alias="sessionId")
    language: Optional[str] = None

class Location(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    address: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = Field(None, alias="conversationId")
    tools: List[str] = Field(default_factory=list)
    session_id: Optional[str] = Field(None, alias="sessionId")
    location: Optional[Location] = None
    field_updates: Optional[List["FieldUpdateRequest"]] = Field(None, alias="fieldUpdates")

    class Config:
        populate_by_name = True

class FieldDefinition(BaseModel):
    """Definition of a single field in a report draft"""
    name: str
    label: str
    field_type: str = Field(..., alias="fieldType")  # "text", "datetime", "date", "enum", "number"
    options: Optional[List[str]] = None
    value: Optional[Any] = None
    is_valid: bool = Field(False, alias="isValid")

    class Config:
        populate_by_name = True


class DraftState(BaseModel):
    """Current state of report draft"""
    report_type: str = Field(..., alias="reportType")
    report_type_label: str = Field(..., alias="reportTypeLabel")
    stage: str  # "collecting", "confirming"
    fields: List[FieldDefinition]
    filled_count: int = Field(..., alias="filledCount")
    total_required: int = Field(..., alias="totalRequired")
    progress_percent: float = Field(..., alias="progressPercent")
    next_field: Optional[str] = Field(None, alias="nextField")
    is_complete: bool = Field(False, alias="isComplete")

    class Config:
        populate_by_name = True


class QuickAction(BaseModel):
    """Clickable button for enum options or actions"""
    action_type: str = Field(..., alias="actionType")  # "field_option", "confirm", "cancel"
    label: str
    value: str
    field_name: Optional[str] = Field(None, alias="fieldName")

    class Config:
        populate_by_name = True


class SubmissionResult(BaseModel):
    """Result after successful submission"""
    reference_number: str = Field(..., alias="referenceNumber")
    report_type: str = Field(..., alias="reportType")
    submitted_at: str = Field(..., alias="submittedAt")

    class Config:
        populate_by_name = True


class FieldUpdateRequest(BaseModel):
    """Request to update a specific field"""
    field_name: str = Field(..., alias="fieldName")
    value: Any

    class Config:
        populate_by_name = True


class ChatResponse(BaseModel):
    id: str
    content: str
    role: str
    created_at: Optional[str] = Field(None, alias="createdAt")
    conversation_id: Optional[str] = Field(None, alias="conversationId")
    tools_used: Optional[list[str]] = Field(None, alias="toolsUsed")
    processing_time: Optional[float] = Field(None, alias="processingTime")
    model_used: Optional[str] = Field(None, alias="modelUsed")
    media_url: Optional[str] = Field(None, alias="mediaUrl")
    requires_location: Optional[bool] = Field(False, alias="requiresLocation")
    # New structured fields
    draft_state: Optional[DraftState] = Field(None, alias="draftState")
    quick_actions: Optional[List[QuickAction]] = Field(None, alias="quickActions")
    submission_result: Optional[SubmissionResult] = Field(None, alias="submissionResult")
    show_draft_card: bool = Field(False, alias="showDraftCard")

    class Config:
        populate_by_name = True


# ------------------------------------------------------------------------------
# Router & In-Memory Demo Session Storage
# ------------------------------------------------------------------------------

router = APIRouter()
logger = structlog.get_logger(__name__)

# In-memory storage for demo sessions (stores draft state by session_id)
demo_sessions: dict[str, dict] = {}

CONTEXT_MAP = {
    ReportType.CONSTRUCTION_PROGRESS.value: ConversationContext.CONSTRUCTION_PROGRESS,
    ReportType.DEFECT_SNAG.value: ConversationContext.DEFECT_SNAG,
    ReportType.SAFETY_INCIDENT.value: ConversationContext.SAFETY_INCIDENT,
    ReportType.SITE_INSPECTION.value: ConversationContext.SITE_INSPECTION,
    ReportType.DAILY_PROGRESS_LOG.value: ConversationContext.DAILY_LOG_FILING,
    ReportType.SHIFT_HANDOVER.value: ConversationContext.SHIFT_HANDOVER,
    ReportType.TOOLBOX_TALK.value: ConversationContext.TOOLBOX_TALK,
}


# ------------------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------------------

@router.post(
    "/chat/send",
    response_model=ChatResponse,
    summary="Send a message to the AI agent",
    tags=["Chat"],
)
async def send_message(
    request: ChatRequest,
    http_request: Request,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Handles a message from an authenticated user and gets a response from the AI agent.
    """
    start_time = time.time()
    logger.info(
        "Authenticated chat message received",
        user_id=user.id,
        message_length=len(request.message),
    )

    conversation = None
    if request.conversation_id:
        result = await db.execute(
            select(Conversation)
            .where(Conversation.id == request.conversation_id)
            .where(Conversation.user_id == user.id)
        )
        conversation = result.scalar_one_or_none()

    if not conversation:
        conversation = Conversation(
            user_id=user.id,
            platform="web",
            status=ConversationStatus.ACTIVE,
            current_context=ConversationContext.MAIN_MENU,
            last_message_at=datetime.now(timezone.utc),
        )
        db.add(conversation)
        await db.flush()

    inbound = Message(
        conversation_id=conversation.id,
        direction=MessageDirection.INBOUND,
        message_type=MessageType.TEXT,
        content=request.message,
    )
    db.add(inbound)

    draft = copy.deepcopy((conversation.context_data or {}).get("draft"))

    # Handle direct field updates (click-to-edit)
    if request.field_updates and draft:
        updates = [{"field_name": u.field_name, "value": u.value} for u in request.field_updates]
        draft, errors = apply_field_updates(draft, updates)
        if errors:
            # Return error response with current draft state
            draft_state = build_draft_state(draft)
            quick_actions = build_quick_actions(draft, draft.get("pending_field"))
            return ChatResponse(
                id=str(uuid.uuid4()),
                content=f"Some fields could not be updated: {', '.join(errors)}",
                role="assistant",
                createdAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                conversationId=str(conversation.id),
                processingTime=time.time() - start_time,
                draftState=draft_state,
                quickActions=quick_actions,
                showDraftCard=True,
            )

    agent_state = await run_agent(request.message, draft)
    draft = agent_state.get("draft")
    response_text = agent_state.get("response") or "Please provide more details."
    action = agent_state.get("action")
    query_intent = agent_state.get("query_intent")

    # Handle report queries
    if action == "query" and query_intent:
        response_text = await query_reports(db, user, query_intent)
        conversation.last_message_at = datetime.now(timezone.utc)
        conversation.turn_count = (conversation.turn_count or 0) + 1

        outbound = Message(
            conversation_id=conversation.id,
            direction=MessageDirection.OUTBOUND,
            message_type=MessageType.TEXT,
            content=response_text,
        )
        db.add(outbound)
        await db.commit()

        processing_time = time.time() - start_time
        logger.info("Query response processed", processing_time=processing_time)

        return ChatResponse(
            id=str(uuid.uuid4()),
            content=response_text,
            role="assistant",
            createdAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            conversationId=str(conversation.id),
            processingTime=processing_time,
            modelUsed="query",
        )

    # Initialize response variables
    submission_result = None
    draft_state = None
    quick_actions = []
    show_draft_card = False

    if action == "submit":
        report = await create_report_from_draft(
            db=db,
            user=user,
            conversation_id=conversation.id,
            draft=draft,
            request_meta={
                "request_id": getattr(http_request.state, "request_id", None)
                if http_request
                else None,
                "client_ip": getattr(http_request.state, "client_ip", None)
                if http_request
                else None,
                "user_agent": http_request.headers.get("user-agent") if http_request else None,
            },
        )
        response_text = (
            f"Report submitted successfully! Your reference number is **{report.reference_number}**."
        )
        submission_result = SubmissionResult(
            referenceNumber=report.reference_number,
            reportType=report.report_type.value,
            submittedAt=report.submitted_at.isoformat() if report.submitted_at else datetime.now(timezone.utc).isoformat(),
        )
        conversation.status = ConversationStatus.COMPLETED
        conversation.current_context = ConversationContext.OTHER
        conversation.context_data = None
    elif action == "cancel":
        conversation.status = ConversationStatus.ACTIVE
        conversation.current_context = ConversationContext.MAIN_MENU
        conversation.context_data = None
    else:
        conversation.context_data = {"draft": draft} if draft else None
        if draft:
            conversation.current_context = CONTEXT_MAP.get(
                draft.get("report_type"),
                ConversationContext.OTHER,
            )
            # Build draft state and quick actions
            draft_state = build_draft_state(draft)
            quick_actions = build_quick_actions(draft, draft.get("pending_field"))
            show_draft_card = True
        else:
            conversation.current_context = ConversationContext.MAIN_MENU

    conversation.last_message_at = datetime.now(timezone.utc)
    conversation.turn_count = (conversation.turn_count or 0) + 1

    outbound = Message(
        conversation_id=conversation.id,
        direction=MessageDirection.OUTBOUND,
        message_type=MessageType.TEXT,
        content=response_text,
    )
    db.add(outbound)

    await db.commit()

    processing_time = time.time() - start_time
    logger.info("AI response processed", processing_time=processing_time)

    return ChatResponse(
        id=str(uuid.uuid4()),
        content=response_text,
        role="assistant",
        createdAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        conversationId=str(conversation.id),
        processingTime=processing_time,
        modelUsed=settings.OPENAI_MODEL if settings.OPENAI_API_KEY else "deterministic",
        draftState=draft_state,
        quickActions=quick_actions,
        submissionResult=submission_result,
        showDraftCard=show_draft_card,
    )


@router.post(
    "/chat/demo",
    response_model=DemoSessionResponse,
    summary="Create a new demo chat session",
    tags=["Chat"],
)
async def create_demo_session():
    """
    Handles the `getDemoSessionId` call from the iOS app.

    Creates a new, temporary session for anonymous users in development mode.
    """
    session_id = str(uuid.uuid4())
    logger.info("Creating new demo session", session_id=session_id)
    return DemoSessionResponse(sessionId=session_id)


@router.post(
    "/chat/demo/{session_id}",
    response_model=ChatResponse,
    summary="Send a message to the demo chat session",
    tags=["Chat"],
)
async def post_demo_message(session_id: str, request: DemoChatRequest):
    """
    Handles demo chat messages using the real AI agent.
    Draft state is stored in-memory per session.
    """
    start_time = time.time()
    logger.info(
        "Demo chat message received",
        session_id=session_id,
        message=request.message,
    )

    # Get or initialize session draft
    session_data = demo_sessions.get(session_id, {})
    draft = copy.deepcopy(session_data.get("draft"))

    # Run the real agent
    agent_state = await run_agent(request.message, draft)
    draft = agent_state.get("draft")
    response_text = agent_state.get("response") or "Please provide more details."
    action = agent_state.get("action")

    # Initialize response variables
    submission_result = None
    draft_state = None
    quick_actions = []
    show_draft_card = False

    if action == "submit" and draft:
        # For demo, simulate submission with a reference number
        ref_number = f"DEMO-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
        response_text = f"Report submitted successfully! Your reference number is **{ref_number}**. (Demo mode - not saved to database)"
        submission_result = SubmissionResult(
            referenceNumber=ref_number,
            reportType=draft.get("report_type", "unknown"),
            submittedAt=datetime.now(timezone.utc).isoformat(),
        )
        # Clear draft after submission
        demo_sessions[session_id] = {}
    elif action == "cancel":
        # Clear draft on cancel
        demo_sessions[session_id] = {}
        response_text = "Draft discarded. How can I help you?"
    else:
        # Store updated draft in session
        demo_sessions[session_id] = {"draft": draft} if draft else {}
        if draft:
            draft_state = build_draft_state(draft)
            quick_actions = build_quick_actions(draft, draft.get("pending_field"))
            show_draft_card = True

    processing_time = time.time() - start_time
    logger.info("Demo response processed", processing_time=processing_time, action=action)

    return ChatResponse(
        id=str(uuid.uuid4()),
        content=response_text,
        role="assistant",
        createdAt=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        conversationId=session_id,
        processingTime=processing_time,
        modelUsed=settings.OPENAI_MODEL if settings.OPENAI_API_KEY else "deterministic",
        draftState=draft_state,
        quickActions=quick_actions,
        submissionResult=submission_result,
        showDraftCard=show_draft_card,
    )
