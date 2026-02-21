"""
CereBro AI Service - Risk Detection Router

Endpoints for crisis detection, risk assessment, and escalation logic.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
import json

from core.config import settings

router = APIRouter(prefix="/risk", tags=["Risk Detection"])


# ─── Risk Keywords ───────────────────────────────────────────────

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "want to die", "better off dead",
    "no reason to live", "can't go on", "self-harm", "cut myself", "hurt myself",
    "overdose", "jump off", "hang myself", "ending it", "final goodbye",
]

MODERATE_RISK_KEYWORDS = [
    "hopeless", "worthless", "burden", "alone", "no one cares",
    "give up", "can't take it", "breaking point", "falling apart",
    "drowning", "suffocating", "trapped", "no way out", "empty",
]


# ─── Models ──────────────────────────────────────────────────────

class RiskDetectionRequest(BaseModel):
    text: str
    user_context: Optional[dict] = None  # {recent_phq9, recent_gad7, days_inactive}


class RiskDetectionResponse(BaseModel):
    risk_level: str  # low, moderate, high, critical
    risk_score: float  # 0-100
    keywords_detected: List[str]
    should_escalate: bool
    escalation_type: Optional[str]  # ai_twin, therapist, crisis
    details: str
    recommended_action: str


class BatchRiskRequest(BaseModel):
    texts: List[str]
    user_id: Optional[str] = None


class BatchRiskResponse(BaseModel):
    results: List[RiskDetectionResponse]
    highest_risk: str
    any_crisis: bool


class CrisisResourcesRequest(BaseModel):
    region: str = "US"


class CrisisResourcesResponse(BaseModel):
    resources: List[dict]
    emergency_message: str


# ─── LLM Configuration ───────────────────────────────────────────

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.2,
    openai_api_key=settings.OPENAI_API_KEY,
)

RISK_ASSESSMENT_PROMPT = """You are a mental health risk assessment system. Analyze the given text for:

1. Suicidal ideation (explicit or implicit)
2. Self-harm indicators
3. Severe distress signals
4. Hopelessness markers
5. Crisis language

Return JSON:
{
  "risk_level": "low" | "moderate" | "high" | "critical",
  "risk_score": 0-100,
  "concerns": ["list of specific concerns"],
  "implicit_risk": boolean (true if risk is implied but not explicit),
  "urgency": "immediate" | "soon" | "routine",
  "reasoning": "brief explanation"
}

Be conservative - when in doubt, assess higher risk. Lives depend on this.
Return JSON only."""


# ─── Endpoints ───────────────────────────────────────────────────

@router.post("/detect", response_model=RiskDetectionResponse)
async def detect_risk(request: RiskDetectionRequest):
    """
    Detect risk level in text.

    Combines keyword detection with LLM analysis for comprehensive assessment.
    """
    try:
        text = request.text.lower().strip()
        detected_keywords = []
        risk_score = 0.0

        # Keyword detection (fast path)
        for keyword in CRISIS_KEYWORDS:
            if keyword in text:
                detected_keywords.append(keyword)
                risk_score += 30

        for keyword in MODERATE_RISK_KEYWORDS:
            if keyword in text:
                detected_keywords.append(keyword)
                risk_score += 10

        # User context factors
        if request.user_context:
            phq9 = request.user_context.get("recent_phq9", 0)
            gad7 = request.user_context.get("recent_gad7", 0)
            days_inactive = request.user_context.get("days_inactive", 0)

            if phq9 and phq9 >= 15:
                risk_score += 25
            if gad7 and gad7 >= 15:
                risk_score += 20
            if days_inactive and days_inactive >= 7:
                risk_score += 15

        # LLM analysis for nuanced detection
        if risk_score < 40:  # Only use LLM if not already high risk
            try:
                response = await llm.ainvoke([
                    SystemMessage(content=RISK_ASSESSMENT_PROMPT),
                    HumanMessage(content=f"Assess this text: \"{request.text}\""),
                ])

                content = response.content if isinstance(response.content, str) else str(response.content)
                llm_result = json.loads(content)

                # Adjust score based on LLM assessment
                llm_score = llm_result.get("risk_score", 0)
                if llm_score > risk_score:
                    risk_score = (risk_score + llm_score) / 2

            except:
                pass  # Use keyword-based score only

        risk_score = min(risk_score, 100)

        # Determine risk level and escalation
        if risk_score >= 70 or any(kw in CRISIS_KEYWORDS for kw in detected_keywords):
            risk_level = "critical"
            should_escalate = True
            escalation_type = "crisis"
            recommended_action = "Immediate crisis intervention required. Provide crisis resources."
        elif risk_score >= 40:
            risk_level = "high"
            should_escalate = True
            escalation_type = "therapist"
            recommended_action = "Escalate to human therapist. Maintain supportive contact."
        elif risk_score >= 20:
            risk_level = "moderate"
            should_escalate = False
            escalation_type = "ai_twin"
            recommended_action = "Continue AI Twin support with extra monitoring."
        else:
            risk_level = "low"
            should_escalate = False
            escalation_type = None
            recommended_action = "Standard AI Twin engagement."

        details = ""
        if detected_keywords:
            details = f"Detected {len(detected_keywords)} risk indicator(s). "
        if request.user_context:
            if request.user_context.get("recent_phq9", 0) >= 15:
                details += "PHQ-9 in critical range. "
            if request.user_context.get("recent_gad7", 0) >= 15:
                details += "GAD-7 in critical range. "

        return RiskDetectionResponse(
            risk_level=risk_level,
            risk_score=risk_score,
            keywords_detected=detected_keywords,
            should_escalate=should_escalate,
            escalation_type=escalation_type,
            details=details.strip() or "No specific concerns detected.",
            recommended_action=recommended_action,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=BatchRiskResponse)
async def batch_detect(request: BatchRiskRequest):
    """
    Detect risk in multiple texts.

    Returns individual results and aggregate assessment.
    """
    results = []
    highest_risk = "low"
    any_crisis = False

    risk_order = {"low": 0, "moderate": 1, "high": 2, "critical": 3}

    for text in request.texts:
        try:
            result = await detect_risk(RiskDetectionRequest(text=text))
            results.append(result)

            if risk_order.get(result.risk_level, 0) > risk_order.get(highest_risk, 0):
                highest_risk = result.risk_level

            if result.risk_level == "critical":
                any_crisis = True

        except:
            results.append(RiskDetectionResponse(
                risk_level="low",
                risk_score=0,
                keywords_detected=[],
                should_escalate=False,
                escalation_type=None,
                details="Analysis failed",
                recommended_action="Manual review recommended",
            ))

    return BatchRiskResponse(
        results=results,
        highest_risk=highest_risk,
        any_crisis=any_crisis,
    )


@router.post("/crisis-resources", response_model=CrisisResourcesResponse)
async def get_crisis_resources(request: CrisisResourcesRequest):
    """
    Get crisis helpline resources by region.
    """
    resources = {
        "US": [
            {"name": "988 Suicide & Crisis Lifeline", "number": "988", "type": "call"},
            {"name": "Crisis Text Line", "number": "741741", "type": "text", "instruction": "Text HOME"},
            {"name": "SAMHSA Helpline", "number": "1-800-662-4357", "type": "call"},
        ],
        "UK": [
            {"name": "Samaritans", "number": "116 123", "type": "call"},
            {"name": "SHOUT", "number": "85258", "type": "text", "instruction": "Text SHOUT"},
        ],
        "IN": [
            {"name": "iCall", "number": "9152987821", "type": "call"},
            {"name": "Vandrevala Foundation", "number": "1860-2662-345", "type": "call"},
        ],
        "AU": [
            {"name": "Lifeline", "number": "13 11 14", "type": "call"},
            {"name": "Beyond Blue", "number": "1300 22 4636", "type": "call"},
        ],
    }

    region_resources = resources.get(request.region.upper(), resources["US"])

    return CrisisResourcesResponse(
        resources=region_resources,
        emergency_message="If you're in immediate danger, please call emergency services (911 in US, 999 in UK, 112 in EU).",
    )
