"""
LangGraph-based agent for chat-first reporting.

Extracts fields, asks for missing data, and confirms submissions.
"""

import json
from typing import Any, Dict, Optional, TypedDict

import structlog
from langgraph.graph import StateGraph, END
from openai import AsyncOpenAI

from app.core.config import settings
from app.services.chat_reporting import process_message, REQUIRED_FIELDS, detect_query_intent

logger = structlog.get_logger(__name__)


class AgentState(TypedDict, total=False):
    message: str
    draft: Optional[Dict[str, Any]]
    extracted: Optional[Dict[str, Any]]
    intent: Optional[str]
    response: str
    action: Optional[str]
    query_intent: Optional[Dict[str, Any]]


SYSTEM_PROMPT = (
    "You are a reporting assistant for industrial safety compliance. "
    "Your job is to extract structured fields from user messages. "
    "Do NOT provide safety advice, risk scoring, or decisions. "
    "Only extract data the user explicitly states."
)


def _build_schema() -> str:
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    types = ", ".join(sorted({t.value for t in REQUIRED_FIELDS.keys()}))
    return (
        f"Today's date is {today}. "
        "Return STRICT JSON only with this shape:\n"
        "{\n"
        '  "report_type": "<one of: ' + types + '>" or null,\n'
        '  "intent": "<confirm|cancel|none>",\n'
        '  "fields": { "title": "...", "description": "...", "occurred_at": "...", '
        '"location_description": "...", "category": "...", "incident_type": "...", '
        '"severity_actual": "...", "outgoing_shift": "...", "incoming_shift": "...", '
        '"handover_time": "...", "topic": "...", "meeting_time": "...", '
        '"duration_minutes": "...", "ptw_number": "...", "ptw_type": "...", '
        '"work_description": "...", "equipment_name": "...", "spill_type": "...", '
        '"material_name": "...", "inspection_type": "...", "inspection_date": "..." }\n'
        "}\n"
        "IMPORTANT for date/time fields:\n"
        "- Keep relative terms like 'today', 'this morning', 'yesterday' AS-IS\n"
        "- Example: 'this morning at 8:30am' → 'today 8:30am' (NOT an ISO date)\n"
        "- Example: 'yesterday afternoon' → 'yesterday afternoon'\n"
        "- Only use ISO format if user gives a specific date like 'January 10th'\n"
        "Use null for unknown values. Do not invent or infer."
    )


async def _extract(state: AgentState) -> AgentState:
    message = state.get("message", "")
    if not message:
        return {"extracted": None, "intent": None, "query_intent": None}

    # First check if this is a query about existing reports
    query_intent = detect_query_intent(message)
    if query_intent:
        logger.info("Query intent detected", query_intent=query_intent)
        return {"extracted": None, "intent": None, "query_intent": query_intent}

    if not settings.OPENAI_API_KEY:
        return {"extracted": None, "intent": None, "query_intent": None}

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        completion = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "system", "content": _build_schema()},
                {"role": "user", "content": message},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
        content = completion.choices[0].message.content or "{}"
        extracted = json.loads(content)
        intent = extracted.get("intent") if isinstance(extracted, dict) else None
        return {"extracted": extracted, "intent": intent, "query_intent": None}
    except Exception as exc:
        logger.warning("LLM extraction failed", error=str(exc))
        return {"extracted": None, "intent": None, "query_intent": None}


async def _advance(state: AgentState) -> AgentState:
    # If this is a query intent, skip the normal report flow
    if state.get("query_intent"):
        return {
            "draft": None,
            "response": None,
            "action": "query",
        }

    draft, response, action = process_message(
        message=state.get("message", ""),
        draft=state.get("draft"),
        extracted=state.get("extracted"),
        intent=state.get("intent"),
    )
    return {"draft": draft, "response": response, "action": action}


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("extract", _extract)
    graph.add_node("advance", _advance)
    graph.set_entry_point("extract")
    graph.add_edge("extract", "advance")
    graph.add_edge("advance", END)
    return graph.compile()


GRAPH = build_graph()


async def run_agent(message: str, draft: Optional[Dict[str, Any]]) -> AgentState:
    state: AgentState = {"message": message, "draft": draft}
    return await GRAPH.ainvoke(state)
