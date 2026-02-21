"""
CereBro AI Twin - LangGraph Multi-Agent System

A proper agentic architecture with:
- Signal Gathering Agent (RAG retrieval)
- Triage Agent (risk assessment)
- Therapist Agent (intervention selection)
- Response Agent (archetype-adapted generation)
- Crisis Agent (emergency handling)

Uses LangGraph for stateful multi-step workflows.
"""
from typing import TypedDict, Annotated, Sequence, Literal, Optional, Any
from langgraph.graph import StateGraph, END, START
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from operator import add
import logging

from core.config import settings
from vectorstores.memory_store import get_store
from prompts.ai_twin_prompts import (
    TRIAGE_PROMPT,
    THERAPIST_PROMPT,
    RESPONSE_PROMPT,
    CRISIS_PROMPT,
    get_archetype_prompt,
)

logger = logging.getLogger(__name__)


# ─── State Definition ────────────────────────────────────────────

class AITwinState(TypedDict):
    """State for the AI Twin graph."""

    # Input
    user_id: str
    chat_id: str
    user_message: str
    archetype: str

    # Messages
    messages: Annotated[Sequence[BaseMessage], add]

    # Context from RAG
    memories: list[dict]
    guidelines: list[dict]
    user_profile: dict

    # Triage results
    risk_level: Literal["low", "moderate", "high", "critical"]
    emotional_state: str
    is_crisis: bool
    crisis_keywords: list[str]

    # Intervention
    selected_intervention: Optional[str]
    intervention_protocol: Optional[dict]

    # Routing
    next_agent: str

    # Output
    response: str
    should_escalate: bool


# ─── LLM Configuration ───────────────────────────────────────────

main_llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    openai_api_key=settings.OPENAI_API_KEY,
)

analysis_llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.3,
    openai_api_key=settings.OPENAI_API_KEY,
)


# ─── Tools ───────────────────────────────────────────────────────

@tool
async def search_user_memories(
    user_id: str,
    query: str,
    memory_types: Optional[list[str]] = None,
) -> str:
    """Search user's memories including journals, moods, and past conversations."""
    store = get_store()
    results = await store.search_memories(
        user_id=user_id,
        query=query,
        k=5,
        memory_types=memory_types,
    )
    return str(results)


@tool
async def search_therapy_guidelines(
    query: str,
    category: Optional[str] = None,
) -> str:
    """Search evidence-based therapy guidelines for interventions."""
    # TODO: Implement guidelines search from vector store
    guidelines = [
        {
            "title": "5-4-3-2-1 Grounding",
            "category": "mindfulness",
            "content": "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
        },
        {
            "title": "Box Breathing",
            "category": "dbt",
            "content": "Breathe in for 4 counts, hold for 4, out for 4, hold for 4.",
        },
    ]
    return str(guidelines)


@tool
def get_crisis_resources(region: str = "US") -> str:
    """Get crisis helpline resources for immediate support."""
    resources = {
        "US": [
            {"name": "988 Suicide & Crisis Lifeline", "number": "988"},
            {"name": "Crisis Text Line", "number": "741741", "instruction": "Text HOME"},
        ],
        "UK": [{"name": "Samaritans", "number": "116 123"}],
        "IN": [{"name": "iCall", "number": "9152987821"}],
    }
    return str(resources.get(region, resources["US"]))


tools = [search_user_memories, search_therapy_guidelines, get_crisis_resources]
tool_node = ToolNode(tools)


# ─── Agent Nodes ─────────────────────────────────────────────────

async def signal_gather_node(state: AITwinState) -> dict:
    """Gather relevant context from memory and guidelines."""
    user_id = state["user_id"]
    user_message = state["user_message"]

    store = get_store()

    # Search memories
    memories = await store.search_memories(
        user_id=user_id,
        query=user_message,
        k=5,
    )

    return {
        "memories": memories,
        "next_agent": "triage",
    }


async def triage_node(state: AITwinState) -> dict:
    """Assess risk level and emotional state."""
    user_message = state["user_message"]

    # Crisis keyword detection
    CRISIS_KEYWORDS = [
        "suicide", "kill myself", "end my life", "want to die",
        "better off dead", "self-harm", "cut myself", "hurt myself",
    ]

    lower_message = user_message.lower()
    detected_keywords = [kw for kw in CRISIS_KEYWORDS if kw in lower_message]

    if detected_keywords:
        return {
            "is_crisis": True,
            "crisis_keywords": detected_keywords,
            "risk_level": "critical",
            "should_escalate": True,
            "next_agent": "crisis",
        }

    # Use LLM for nuanced triage
    triage_response = await analysis_llm.ainvoke([
        SystemMessage(content=TRIAGE_PROMPT),
        HumanMessage(content=f"Analyze this message: \"{user_message}\""),
    ])

    try:
        import json
        content = triage_response.content
        if isinstance(content, str):
            analysis = json.loads(content)
            return {
                "is_crisis": False,
                "emotional_state": analysis.get("emotional_state", "neutral"),
                "risk_level": analysis.get("risk_level", "low"),
                "selected_intervention": analysis.get("suggested_approach", "support"),
                "next_agent": "therapist",
            }
    except:
        pass

    return {
        "is_crisis": False,
        "emotional_state": "neutral",
        "risk_level": "low",
        "selected_intervention": "support",
        "next_agent": "therapist",
    }


async def therapist_node(state: AITwinState) -> dict:
    """Select appropriate therapeutic intervention."""
    emotional_state = state.get("emotional_state", "neutral")

    intervention_map = {
        "distressed": "GROUNDING",
        "anxious": "GROUNDING",
        "sad": "VALIDATION",
        "angry": "VALIDATION",
        "confused": "PSYCHOEDUCATION",
        "neutral": "SUPPORT",
        "hopeful": "SUPPORT",
        "positive": "SUPPORT",
    }

    return {
        "selected_intervention": intervention_map.get(emotional_state, "SUPPORT"),
        "next_agent": "response",
    }


async def response_node(state: AITwinState) -> dict:
    """Generate archetype-adapted response."""
    archetype = state.get("archetype", "SEEKER")
    user_message = state["user_message"]
    emotional_state = state.get("emotional_state", "neutral")
    intervention = state.get("selected_intervention", "SUPPORT")
    memories = state.get("memories", [])

    # Build system prompt
    archetype_guidance = get_archetype_prompt(archetype)
    memory_context = ""
    if memories:
        memory_context = "\n\nRelevant memories:\n" + "\n".join(
            f"- [{m.get('metadata', {}).get('type', 'memory')}]: {m.get('content', '')[:200]}"
            for m in memories[:3]
        )

    system_prompt = f"""{RESPONSE_PROMPT}

{archetype_guidance}

Current context:
- Emotional state: {emotional_state}
- Suggested intervention: {intervention}
{memory_context}
"""

    response = await main_llm.ainvoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message),
    ])

    response_text = response.content if isinstance(response.content, str) else str(response.content)

    # Clean intervention tags
    clean_response = response_text
    for tag in ["[GROUNDING]", "[REFRAME]", "[VALIDATION]", "[PSYCHOEDUCATION]", "[CRISIS_SUPPORT]"]:
        clean_response = clean_response.replace(tag, "").strip()

    return {
        "response": clean_response,
        "next_agent": "end",
        "messages": [AIMessage(content=clean_response)],
    }


async def crisis_node(state: AITwinState) -> dict:
    """Handle crisis situations with appropriate response."""
    crisis_response = """I hear that you're going through something really difficult right now. Reaching out shows incredible strength.

What you're feeling is real and valid. You don't have to face this alone.

Right now, I want to offer you a choice:
1. **Connect with a human** - Call 988 (US) or text HOME to 741741
2. **Talk with a CereBro therapist** - A human professional is available
3. **Stay here with me** - I can guide you through a grounding exercise

You matter. What feels right to you?"""

    return {
        "response": crisis_response,
        "selected_intervention": "CRISIS_SUPPORT",
        "should_escalate": True,
        "next_agent": "end",
        "messages": [AIMessage(content=crisis_response)],
    }


# ─── Router ──────────────────────────────────────────────────────

def route_next(state: AITwinState) -> str:
    """Route to the next agent based on state."""
    next_agent = state.get("next_agent", "signal_gather")

    routes = {
        "signal_gather": "signal_gather",
        "triage": "triage",
        "therapist": "therapist",
        "response": "response",
        "crisis": "crisis",
        "end": END,
    }

    return routes.get(next_agent, END)


def route_after_triage(state: AITwinState) -> str:
    """Route after triage based on crisis detection."""
    if state.get("is_crisis"):
        return "crisis"
    return "therapist"


# ─── Build Graph ─────────────────────────────────────────────────

def create_ai_twin_graph() -> StateGraph:
    """Create the AI Twin LangGraph workflow."""

    workflow = StateGraph(AITwinState)

    # Add nodes
    workflow.add_node("signal_gather", signal_gather_node)
    workflow.add_node("triage", triage_node)
    workflow.add_node("therapist", therapist_node)
    workflow.add_node("response", response_node)
    workflow.add_node("crisis", crisis_node)

    # Define edges
    workflow.add_edge(START, "signal_gather")
    workflow.add_edge("signal_gather", "triage")
    workflow.add_conditional_edges(
        "triage",
        route_after_triage,
        {
            "crisis": "crisis",
            "therapist": "therapist",
        },
    )
    workflow.add_edge("therapist", "response")
    workflow.add_edge("response", END)
    workflow.add_edge("crisis", END)

    return workflow.compile()


# ─── Main Interface ──────────────────────────────────────────────

# Compiled graph singleton
_graph = None


def get_graph():
    """Get or create the AI Twin graph."""
    global _graph
    if _graph is None:
        _graph = create_ai_twin_graph()
    return _graph


async def run_ai_twin(
    user_id: str,
    chat_id: str,
    user_message: str,
    archetype: str = "SEEKER",
) -> dict:
    """
    Run the AI Twin graph for a user message.

    Returns:
        dict with response, intervention, risk_level, should_escalate
    """
    graph = get_graph()

    initial_state: AITwinState = {
        "user_id": user_id,
        "chat_id": chat_id,
        "user_message": user_message,
        "archetype": archetype,
        "messages": [HumanMessage(content=user_message)],
        "memories": [],
        "guidelines": [],
        "user_profile": {},
        "risk_level": "low",
        "emotional_state": "neutral",
        "is_crisis": False,
        "crisis_keywords": [],
        "selected_intervention": None,
        "intervention_protocol": None,
        "next_agent": "signal_gather",
        "response": "",
        "should_escalate": False,
    }

    result = await graph.ainvoke(initial_state)

    return {
        "response": result.get("response", ""),
        "intervention": result.get("selected_intervention"),
        "risk_level": result.get("risk_level", "low"),
        "emotional_state": result.get("emotional_state", "neutral"),
        "should_escalate": result.get("should_escalate", False),
        "crisis_detected": result.get("is_crisis", False),
    }


async def stream_ai_twin(
    user_id: str,
    chat_id: str,
    user_message: str,
    archetype: str = "SEEKER",
):
    """
    Stream the AI Twin response.

    Yields:
        dict with type (metadata, token, done) and data
    """
    result = await run_ai_twin(user_id, chat_id, user_message, archetype)

    # Yield metadata first
    yield {
        "type": "metadata",
        "data": {
            "chat_id": chat_id,
            "risk_level": result["risk_level"],
            "intervention": result["intervention"],
            "emotional_state": result["emotional_state"],
            "should_escalate": result["should_escalate"],
        },
    }

    # Stream tokens
    response = result["response"]
    words = response.split(" ")
    for word in words:
        yield {"type": "token", "data": word + " "}

    # Done
    yield {"type": "done", "data": {"message_id": f"{chat_id}-{user_id}"}}
