"""
CereBro AI Twin - FastAPI Router

Endpoints for the AI Twin multi-agent system:
- POST /chat - Run AI Twin for a message
- POST /stream - Stream AI Twin response (SSE)
- POST /session-summary - Generate session summary
- POST /handoff - Generate handoff document
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import json
import asyncio

from agents.ai_twin_graph import run_ai_twin, stream_ai_twin
from prompts.ai_twin_prompts import SESSION_SUMMARY_PROMPT, HANDOFF_DOCUMENT_PROMPT
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from core.config import settings

router = APIRouter(prefix="/ai-twin", tags=["AI Twin"])


# ─── Request/Response Models ─────────────────────────────────────

class ChatRequest(BaseModel):
    user_id: str
    chat_id: str
    message: str
    archetype: str = "SEEKER"
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    response: str
    intervention: Optional[str]
    risk_level: str
    emotional_state: str
    should_escalate: bool
    crisis_detected: bool


class SessionSummaryRequest(BaseModel):
    user_id: str
    chat_id: str
    messages: List[dict]  # [{role: "user"|"assistant", content: "..."}]
    archetype: str = "SEEKER"


class SessionSummaryResponse(BaseModel):
    session_summary: str
    key_themes: List[str]
    new_insights: List[str]
    effective_interventions: List[str]
    mood_trajectory: str
    topics_to_revisit: List[str]
    concerns_to_monitor: List[str]


class HandoffRequest(BaseModel):
    user_id: str
    chat_id: str
    messages: List[dict]
    archetype: str
    user_context: Optional[dict] = None


class HandoffResponse(BaseModel):
    executive_summary: str
    presenting_concern: str
    emotional_state: dict
    recommended_approach: str
    urgent_considerations: List[str]
    full_document: dict


# ─── Endpoints ───────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a single message through the AI Twin graph.

    Returns complete response with intervention type and risk assessment.
    """
    try:
        result = await run_ai_twin(
            user_id=request.user_id,
            chat_id=request.chat_id,
            user_message=request.message,
            archetype=request.archetype,
        )

        return ChatResponse(
            response=result["response"],
            intervention=result.get("intervention"),
            risk_level=result.get("risk_level", "low"),
            emotional_state=result.get("emotional_state", "neutral"),
            should_escalate=result.get("should_escalate", False),
            crisis_detected=result.get("crisis_detected", False),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def stream_chat(request: ChatRequest):
    """
    Stream AI Twin response using Server-Sent Events.

    Yields:
    - metadata event with risk level, intervention, etc.
    - token events with response chunks
    - done event when complete
    """

    async def event_generator():
        try:
            async for chunk in stream_ai_twin(
                user_id=request.user_id,
                chat_id=request.chat_id,
                user_message=request.message,
                archetype=request.archetype,
            ):
                event_data = json.dumps(chunk)
                yield f"data: {event_data}\n\n"
                await asyncio.sleep(0.02)  # Small delay for streaming effect

            yield "data: [DONE]\n\n"

        except Exception as e:
            error_data = json.dumps({"type": "error", "data": str(e)})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.post("/session-summary", response_model=SessionSummaryResponse)
async def generate_session_summary(request: SessionSummaryRequest):
    """
    Generate a session summary for continuity.

    Called when user ends a chat session.
    """
    try:
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.3,
            openai_api_key=settings.OPENAI_API_KEY,
        )

        # Format conversation
        conversation_text = "\n\n".join(
            f"{m['role'].upper()}: {m['content']}"
            for m in request.messages
        )

        response = await llm.ainvoke([
            SystemMessage(content=SESSION_SUMMARY_PROMPT),
            HumanMessage(content=f"Summarize this conversation:\n\n{conversation_text}"),
        ])

        content = response.content if isinstance(response.content, str) else str(response.content)

        try:
            summary = json.loads(content)
        except:
            # Fallback if parsing fails
            summary = {
                "session_summary": f"Session with {len(request.messages)} exchanges.",
                "key_themes": [],
                "new_insights": [],
                "effective_interventions": [],
                "mood_trajectory": "stable",
                "topics_to_revisit": [],
                "concerns_to_monitor": [],
            }

        return SessionSummaryResponse(
            session_summary=summary.get("session_summary", ""),
            key_themes=summary.get("key_themes", []),
            new_insights=summary.get("new_insights", []),
            effective_interventions=summary.get("effective_interventions", []),
            mood_trajectory=summary.get("mood_trajectory", "stable"),
            topics_to_revisit=summary.get("topics_to_revisit", []),
            concerns_to_monitor=summary.get("concerns_to_monitor", []),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/handoff", response_model=HandoffResponse)
async def generate_handoff_document(request: HandoffRequest):
    """
    Generate a handoff document for therapist review.

    Creates a comprehensive summary when escalating to human therapist.
    """
    try:
        llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.3,
            openai_api_key=settings.OPENAI_API_KEY,
        )

        # Format conversation
        conversation_text = "\n\n".join(
            f"{m['role'].upper()}: {m['content']}"
            for m in request.messages
        )

        context_text = ""
        if request.user_context:
            context_text = f"\n\nUser context: {json.dumps(request.user_context)}"

        response = await llm.ainvoke([
            SystemMessage(content=HANDOFF_DOCUMENT_PROMPT),
            HumanMessage(
                content=f"Archetype: {request.archetype}\n\nConversation:\n{conversation_text}{context_text}"
            ),
        ])

        content = response.content if isinstance(response.content, str) else str(response.content)

        try:
            doc = json.loads(content)
        except:
            doc = {
                "executive_summary": "Handoff requested for this case.",
                "presenting_concern": "See conversation history.",
                "emotional_state": {"current": "unknown", "risk_level": "moderate"},
                "recommended_approach": "Assess and proceed with caution.",
                "urgent_considerations": [],
            }

        return HandoffResponse(
            executive_summary=doc.get("executive_summary", ""),
            presenting_concern=doc.get("presenting_concern", ""),
            emotional_state=doc.get("emotional_state", {}),
            recommended_approach=doc.get("recommended_approach", ""),
            urgent_considerations=doc.get("urgent_considerations", []),
            full_document=doc,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check for AI Twin service."""
    return {"status": "healthy", "service": "ai-twin"}
