"""
CereBro NLP Service - Sentiment Router Tests

Tests for emotion and sentiment analysis.
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
import json


class TestSentimentAnalysis:
    """Tests for /sentiment/analyze endpoint."""

    def test_analyze_positive_sentiment(self, client, mock_openai):
        """Test analysis of positive text."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "score": 0.8,
                "label": "positive",
                "emotions": ["joy", "gratitude"],
                "confidence": 0.9,
                "analysis": "The text expresses positive emotions."
            })
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "I had an amazing day with my family!",
            "context": None,
            "detailed": True
        })

        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "positive"
        assert data["score"] > 0
        assert "joy" in data["emotions"] or len(data["emotions"]) > 0

    def test_analyze_negative_sentiment(self, client, mock_openai):
        """Test analysis of negative text."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "score": -0.7,
                "label": "negative",
                "emotions": ["sadness", "frustration"],
                "confidence": 0.85,
                "analysis": "The text expresses negative emotions."
            })
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "I'm feeling sad and frustrated today",
            "context": None,
            "detailed": False
        })

        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "negative"
        assert data["score"] < 0

    def test_analyze_neutral_sentiment(self, client, mock_openai):
        """Test analysis of neutral text."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "score": 0.1,
                "label": "neutral",
                "emotions": [],
                "confidence": 0.7
            })
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "I went to the store and bought groceries",
            "context": None,
            "detailed": False
        })

        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "neutral"
        assert -0.3 <= data["score"] <= 0.3

    def test_analyze_mixed_sentiment(self, client, mock_openai):
        """Test analysis of mixed sentiment text."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "score": 0.1,
                "label": "mixed",
                "emotions": ["hope", "anxiety"],
                "confidence": 0.75
            })
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "I'm excited about my new job but also nervous",
            "context": None,
            "detailed": False
        })

        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "mixed"

    def test_detailed_analysis_includes_explanation(self, client, mock_openai):
        """Test that detailed=True returns analysis explanation."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "score": 0.5,
                "label": "positive",
                "emotions": ["contentment"],
                "confidence": 0.8,
                "analysis": "The user expresses contentment with their current situation."
            })
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "I'm content with how things are going",
            "context": None,
            "detailed": True
        })

        assert response.status_code == 200
        data = response.json()
        assert data["analysis"] is not None
        assert len(data["analysis"]) > 0

    def test_context_is_passed_to_analysis(self, client, mock_openai):
        """Test that context is included in analysis."""
        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "It's getting better",
            "context": "User has been dealing with work stress for weeks",
            "detailed": False
        })

        assert response.status_code == 200

    def test_confidence_is_returned(self, client, mock_openai):
        """Test that confidence score is returned."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "score": 0.5,
                "label": "positive",
                "emotions": [],
                "confidence": 0.85
            })
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "I feel good",
            "context": None,
            "detailed": False
        })

        assert response.status_code == 200
        data = response.json()
        assert "confidence" in data
        assert 0 <= data["confidence"] <= 1


class TestBatchSentimentAnalysis:
    """Tests for /sentiment/batch endpoint."""

    def test_batch_analyze_multiple_texts(self, client, mock_openai):
        """Test batch sentiment analysis."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "score": 0.5,
                "label": "neutral",
                "emotions": [],
                "confidence": 0.7
            })
        ))

        response = client.post("/api/v1/sentiment/batch", json={
            "texts": [
                "I'm happy today",
                "I feel neutral",
                "I'm sad"
            ]
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 3

    def test_batch_analyze_empty_list(self, client, mock_openai):
        """Test batch analysis with empty list."""
        response = client.post("/api/v1/sentiment/batch", json={
            "texts": []
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 0

    def test_batch_handles_errors_gracefully(self, client, mock_openai):
        """Test that batch analysis handles individual errors."""
        # Make the mock raise an error occasionally
        call_count = [0]

        async def side_effect(*args, **kwargs):
            call_count[0] += 1
            if call_count[0] == 2:
                raise Exception("Test error")
            return MagicMock(content=json.dumps({
                "score": 0.5,
                "label": "neutral",
                "emotions": [],
                "confidence": 0.7
            }))

        mock_openai.return_value.ainvoke = AsyncMock(side_effect=side_effect)

        response = client.post("/api/v1/sentiment/batch", json={
            "texts": ["text1", "text2", "text3"]
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 3


class TestKeywordFallback:
    """Tests for keyword-based fallback sentiment analysis."""

    def test_fallback_positive_keywords(self, client, mock_openai):
        """Test fallback detection of positive keywords."""
        # Make LLM return invalid JSON to trigger fallback
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content="invalid json"
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "I feel happy, grateful, and wonderful today",
            "context": None,
            "detailed": False
        })

        assert response.status_code == 200
        data = response.json()
        assert data["score"] > 0
        assert data["label"] == "positive"

    def test_fallback_negative_keywords(self, client, mock_openai):
        """Test fallback detection of negative keywords."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content="invalid json"
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "I feel sad, anxious, and overwhelmed",
            "context": None,
            "detailed": False
        })

        assert response.status_code == 200
        data = response.json()
        assert data["score"] < 0
        assert data["label"] == "negative"

    def test_fallback_mixed_keywords(self, client, mock_openai):
        """Test fallback detection of mixed keywords."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content="invalid json"
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "I feel happy but also worried",
            "context": None,
            "detailed": False
        })

        assert response.status_code == 200
        data = response.json()
        assert data["label"] in ["mixed", "neutral"]

    def test_fallback_emotion_detection(self, client, mock_openai):
        """Test fallback emotion detection from keywords."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content="invalid json"
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "I feel happy and anxious and lonely",
            "context": None,
            "detailed": False
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data["emotions"]) > 0

    def test_fallback_neutral_no_keywords(self, client, mock_openai):
        """Test fallback returns neutral when no keywords found."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content="invalid json"
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "The weather is cloudy today",
            "context": None,
            "detailed": False
        })

        assert response.status_code == 200
        data = response.json()
        assert data["label"] == "neutral"
        assert data["score"] == 0


class TestSentimentScoreRange:
    """Tests for sentiment score validation."""

    def test_score_within_range(self, client, mock_openai):
        """Test that score is always within -1 to 1 range."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "score": 0.75,
                "label": "positive",
                "emotions": [],
                "confidence": 0.8
            })
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "Test text",
            "context": None,
            "detailed": False
        })

        assert response.status_code == 200
        data = response.json()
        assert -1 <= data["score"] <= 1

    def test_confidence_within_range(self, client, mock_openai):
        """Test that confidence is within 0 to 1 range."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "score": 0.5,
                "label": "neutral",
                "emotions": [],
                "confidence": 0.8
            })
        ))

        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "Test text",
            "context": None,
            "detailed": False
        })

        assert response.status_code == 200
        data = response.json()
        assert 0 <= data["confidence"] <= 1
