"""
CereBro AI Service - Sentiment Analysis Router

Endpoints for emotion and sentiment analysis using LangChain.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
import json

from core.config import settings

router = APIRouter(prefix="/sentiment", tags=["Sentiment Analysis"])


# ─── Models ──────────────────────────────────────────────────────

class SentimentRequest(BaseModel):
    text: str
    context: Optional[str] = None
    detailed: bool = False


class SentimentResponse(BaseModel):
    score: float  # -1 to 1
    label: str  # positive, negative, neutral, mixed
    emotions: List[str]
    confidence: float
    analysis: Optional[str] = None


class BatchSentimentRequest(BaseModel):
    texts: List[str]


class BatchSentimentResponse(BaseModel):
    results: List[SentimentResponse]


# ─── LLM Configuration ───────────────────────────────────────────

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.2,
    openai_api_key=settings.OPENAI_API_KEY,
)

SENTIMENT_PROMPT = """You are an expert sentiment and emotion analyzer for a mental wellness application.

Analyze the given text and return JSON:
{
  "score": float between -1 (very negative) and 1 (very positive),
  "label": "positive" | "negative" | "neutral" | "mixed",
  "emotions": list of detected emotions (e.g., ["sadness", "anxiety", "hope"]),
  "confidence": float between 0 and 1,
  "analysis": brief explanation (if detailed=true)
}

Be sensitive to:
- Subtle emotional cues
- Mental health context
- Mixed or ambivalent feelings
- Cultural expressions of emotion

Return JSON only."""


# ─── Endpoints ───────────────────────────────────────────────────

@router.post("/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """
    Analyze sentiment and emotions in text.

    Uses LLM for nuanced analysis of mental health-related content.
    """
    try:
        prompt = f"Analyze this text (detailed={request.detailed}):\n\n\"{request.text}\""
        if request.context:
            prompt += f"\n\nContext: {request.context}"

        response = await llm.ainvoke([
            SystemMessage(content=SENTIMENT_PROMPT),
            HumanMessage(content=prompt),
        ])

        content = response.content if isinstance(response.content, str) else str(response.content)

        try:
            result = json.loads(content)
            return SentimentResponse(
                score=result.get("score", 0),
                label=result.get("label", "neutral"),
                emotions=result.get("emotions", []),
                confidence=result.get("confidence", 0.5),
                analysis=result.get("analysis") if request.detailed else None,
            )
        except json.JSONDecodeError:
            # Fallback to keyword-based
            return _keyword_sentiment(request.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=BatchSentimentResponse)
async def batch_analyze(request: BatchSentimentRequest):
    """
    Analyze sentiment for multiple texts.
    """
    results = []
    for text in request.texts:
        try:
            result = await analyze_sentiment(SentimentRequest(text=text))
            results.append(result)
        except:
            results.append(SentimentResponse(
                score=0,
                label="neutral",
                emotions=[],
                confidence=0.3,
            ))

    return BatchSentimentResponse(results=results)


# ─── Keyword Fallback ────────────────────────────────────────────

def _keyword_sentiment(text: str) -> SentimentResponse:
    """Keyword-based fallback sentiment analysis."""
    text_lower = text.lower()

    positive_words = [
        "happy", "joy", "grateful", "thankful", "love", "hope", "better",
        "good", "great", "wonderful", "peace", "calm", "strong", "proud",
    ]
    negative_words = [
        "sad", "angry", "frustrated", "anxious", "worried", "fear", "pain",
        "hurt", "lonely", "depressed", "stressed", "overwhelmed", "exhausted",
        "hopeless", "worthless",
    ]

    pos_count = sum(1 for w in positive_words if w in text_lower)
    neg_count = sum(1 for w in negative_words if w in text_lower)
    total = pos_count + neg_count

    if total == 0:
        score = 0.0
        label = "neutral"
    else:
        score = (pos_count - neg_count) / max(total, 1)
        score = max(-1.0, min(1.0, score))
        if score > 0.2:
            label = "positive"
        elif score < -0.2:
            label = "negative"
        elif pos_count > 0 and neg_count > 0:
            label = "mixed"
        else:
            label = "neutral"

    emotions = []
    emotion_map = {
        "happy": "joy", "sad": "sadness", "angry": "anger",
        "anxious": "anxiety", "worried": "worry", "lonely": "loneliness",
    }
    for word, emotion in emotion_map.items():
        if word in text_lower and emotion not in emotions:
            emotions.append(emotion)

    return SentimentResponse(
        score=round(score, 3),
        label=label,
        emotions=emotions[:5],
        confidence=0.5,
    )
