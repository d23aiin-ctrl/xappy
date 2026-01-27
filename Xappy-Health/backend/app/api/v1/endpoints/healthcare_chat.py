import uuid
import time
from typing import Optional

import structlog
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.healthcare.knowledge import build_context
from app.services.healthcare.summarizer import summarize_from_context, get_match_count

router = APIRouter()
logger = structlog.get_logger(__name__)
healthcare_sessions: dict[str, dict] = {}


class Location(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None


class HealthcareChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = Field(None, alias="sessionId")
    location: Optional[Location] = None
    language: Optional[str] = None

    class Config:
        populate_by_name = True


class HealthcareChatResponse(BaseModel):
    content: str
    conversation_id: str = Field(..., alias="conversationId")
    processing_time: float = Field(..., alias="processingTime")
    model_used: str = Field(..., alias="modelUsed")
    requires_location: bool = Field(False, alias="requiresLocation")

    class Config:
        populate_by_name = True


@router.post(
    "/healthcare/chat/send",
    response_model=HealthcareChatResponse,
    summary="Send a message to the healthcare demo assistant",
    tags=["Chat"],
)
async def send_healthcare_message(request: HealthcareChatRequest):
    start_time = time.time()
    session_id = request.session_id or str(uuid.uuid4())

    logger.info(
        "Healthcare demo chat message received",
        session_id=session_id,
        message_length=len(request.message),
    )

    lowered = request.message.lower()
    needs_location = any(term in lowered for term in ["near me", "nearest", "close to me"])
    if needs_location and not request.location:
        return HealthcareChatResponse(
            content="Please share your location to find nearby services.",
            conversationId=session_id,
            processingTime=time.time() - start_time,
            modelUsed="gpt-4o-mini",
            requiresLocation=True,
        )

    def _detect_language(message: str) -> str:
        for char in message:
            code = ord(char)
            if 0x0B80 <= code <= 0x0BFF:
                return "ta"
            if 0x0D80 <= code <= 0x0DFF:
                return "si"
        return "en"

    session_state = healthcare_sessions.get(session_id, {})
    detected_language = _detect_language(request.message or "")
    requested_language = (request.language or "").lower()
    language = requested_language or session_state.get("language") or "en"
    if language == "en" and detected_language != "en":
        language = detected_language
    language = language.lower()
    session_state["language"] = language
    healthcare_sessions[session_id] = session_state

    context = build_context(request.message, location=request.location.model_dump() if request.location else None)
    match_count = get_match_count(context)
    awaiting_clarification = session_state.get("awaiting_clarification", False)

    if match_count == 0 and not awaiting_clarification:
        response_text, used_llm = await summarize_from_context(
            request.message,
            context,
            allow_generic=False,
            language=language,
        )
        healthcare_sessions[session_id] = {"awaiting_clarification": True, "last_query": request.message}
    else:
        response_text, used_llm = await summarize_from_context(
            request.message,
            context,
            allow_generic=awaiting_clarification and match_count == 0,
            language=language,
        )
        healthcare_sessions[session_id] = {"awaiting_clarification": False, "language": language}

    return HealthcareChatResponse(
        content=response_text,
        conversationId=session_id,
        processingTime=time.time() - start_time,
        modelUsed="gpt-4o-mini" if used_llm else "fallback",
        requiresLocation=False,
    )
