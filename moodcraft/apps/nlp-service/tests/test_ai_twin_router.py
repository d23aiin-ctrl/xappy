"""
CereBro NLP Service - AI Twin Router Tests

Tests for the AI Twin multi-agent system endpoints.
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
import json


class TestAITwinChat:
    """Tests for /ai-twin/chat endpoint."""

    def test_chat_basic_request(self, client, mock_ai_twin_graph, mock_vector_store):
        """Test basic chat request."""
        with patch('routers.ai_twin.run_ai_twin', new_callable=AsyncMock) as mock_run:
            mock_run.return_value = {
                "response": "I hear you. That sounds challenging.",
                "intervention": "VALIDATION",
                "risk_level": "low",
                "emotional_state": "neutral",
                "should_escalate": False,
                "crisis_detected": False,
            }

            response = client.post("/api/v1/ai-twin/chat", json={
                "user_id": "test-user",
                "chat_id": "test-chat",
                "message": "I'm feeling a bit stressed today",
                "archetype": "SEEKER",
                "context": None
            })

            assert response.status_code == 200
            data = response.json()
            assert "response" in data
            assert data["risk_level"] == "low"
            assert data["should_escalate"] is False

    def test_chat_with_archetype(self, client):
        """Test chat respects archetype."""
        archetypes = ["DRIFTER", "THINKER", "TRANSFORMER", "SEEKER", "VETERAN"]

        with patch('routers.ai_twin.run_ai_twin', new_callable=AsyncMock) as mock_run:
            mock_run.return_value = {
                "response": "Test response",
                "intervention": None,
                "risk_level": "low",
                "emotional_state": "neutral",
                "should_escalate": False,
                "crisis_detected": False,
            }

            for archetype in archetypes:
                response = client.post("/api/v1/ai-twin/chat", json={
                    "user_id": "test-user",
                    "chat_id": "test-chat",
                    "message": "Hello",
                    "archetype": archetype,
                    "context": None
                })

                assert response.status_code == 200

    def test_chat_with_context(self, client):
        """Test chat includes user context."""
        with patch('routers.ai_twin.run_ai_twin', new_callable=AsyncMock) as mock_run:
            mock_run.return_value = {
                "response": "Test response",
                "intervention": None,
                "risk_level": "low",
                "emotional_state": "neutral",
                "should_escalate": False,
                "crisis_detected": False,
            }

            response = client.post("/api/v1/ai-twin/chat", json={
                "user_id": "test-user",
                "chat_id": "test-chat",
                "message": "Hello",
                "archetype": "SEEKER",
                "context": {
                    "streak_days": 10,
                    "recent_mood": 7,
                    "last_journal_date": "2024-01-15"
                }
            })

            assert response.status_code == 200

    def test_chat_detects_escalation_need(self, client):
        """Test chat detects when escalation is needed."""
        with patch('routers.ai_twin.run_ai_twin', new_callable=AsyncMock) as mock_run:
            mock_run.return_value = {
                "response": "I'm concerned about what you're sharing...",
                "intervention": "CRISIS_SUPPORT",
                "risk_level": "high",
                "emotional_state": "distressed",
                "should_escalate": True,
                "crisis_detected": True,
            }

            response = client.post("/api/v1/ai-twin/chat", json={
                "user_id": "test-user",
                "chat_id": "test-chat",
                "message": "I don't want to be here anymore",
                "archetype": "SEEKER",
                "context": None
            })

            assert response.status_code == 200
            data = response.json()
            assert data["should_escalate"] is True
            assert data["crisis_detected"] is True
            assert data["risk_level"] in ["high", "critical"]

    def test_chat_intervention_types(self, client):
        """Test different intervention types are returned."""
        interventions = ["VALIDATION", "REFRAME", "GROUNDING", "PSYCHOEDUCATION", "COPING_SKILL"]

        for intervention in interventions:
            with patch('routers.ai_twin.run_ai_twin', new_callable=AsyncMock) as mock_run:
                mock_run.return_value = {
                    "response": f"Test response for {intervention}",
                    "intervention": intervention,
                    "risk_level": "low",
                    "emotional_state": "neutral",
                    "should_escalate": False,
                    "crisis_detected": False,
                }

                response = client.post("/api/v1/ai-twin/chat", json={
                    "user_id": "test-user",
                    "chat_id": "test-chat",
                    "message": "Test message",
                    "archetype": "SEEKER",
                    "context": None
                })

                assert response.status_code == 200
                data = response.json()
                assert data["intervention"] == intervention


class TestAITwinStream:
    """Tests for /ai-twin/stream endpoint."""

    def test_stream_returns_sse(self, client):
        """Test streaming returns Server-Sent Events."""
        async def mock_stream(*args, **kwargs):
            yield {"type": "metadata", "data": {"risk_level": "low"}}
            yield {"type": "token", "data": "Hello "}
            yield {"type": "token", "data": "there!"}
            yield {"type": "complete", "data": {"response": "Hello there!"}}

        with patch('routers.ai_twin.stream_ai_twin', return_value=mock_stream()):
            response = client.post("/api/v1/ai-twin/stream", json={
                "user_id": "test-user",
                "chat_id": "test-chat",
                "message": "Hello",
                "archetype": "SEEKER",
                "context": None
            })

            assert response.status_code == 200
            assert response.headers.get("content-type") == "text/event-stream; charset=utf-8"


class TestSessionSummary:
    """Tests for /ai-twin/session-summary endpoint."""

    def test_generate_session_summary(self, client, mock_openai):
        """Test session summary generation."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "session_summary": "User discussed work stress and sleep issues.",
                "key_themes": ["work stress", "sleep problems"],
                "new_insights": ["Recognizes connection between work and sleep"],
                "effective_interventions": ["VALIDATION", "PSYCHOEDUCATION"],
                "mood_trajectory": "improving",
                "topics_to_revisit": ["sleep hygiene"],
                "concerns_to_monitor": ["anxiety levels"]
            })
        ))

        response = client.post("/api/v1/ai-twin/session-summary", json={
            "user_id": "test-user",
            "chat_id": "test-chat",
            "messages": [
                {"role": "user", "content": "I've been stressed about work"},
                {"role": "assistant", "content": "Tell me more about that"},
                {"role": "user", "content": "I can't sleep at night"},
                {"role": "assistant", "content": "Sleep and stress are often connected"},
            ],
            "archetype": "THINKER"
        })

        assert response.status_code == 200
        data = response.json()
        assert "session_summary" in data
        assert "key_themes" in data
        assert "mood_trajectory" in data
        assert isinstance(data["key_themes"], list)

    def test_session_summary_empty_messages(self, client, mock_openai):
        """Test session summary with empty messages."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "session_summary": "Brief session.",
                "key_themes": [],
                "new_insights": [],
                "effective_interventions": [],
                "mood_trajectory": "stable",
                "topics_to_revisit": [],
                "concerns_to_monitor": []
            })
        ))

        response = client.post("/api/v1/ai-twin/session-summary", json={
            "user_id": "test-user",
            "chat_id": "test-chat",
            "messages": [],
            "archetype": "SEEKER"
        })

        assert response.status_code == 200

    def test_session_summary_fallback(self, client, mock_openai):
        """Test session summary fallback on parse error."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content="invalid json response"
        ))

        response = client.post("/api/v1/ai-twin/session-summary", json={
            "user_id": "test-user",
            "chat_id": "test-chat",
            "messages": [
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi there"},
            ],
            "archetype": "SEEKER"
        })

        assert response.status_code == 200
        data = response.json()
        # Should return fallback structure
        assert "session_summary" in data


class TestHandoffDocument:
    """Tests for /ai-twin/handoff endpoint."""

    def test_generate_handoff_document(self, client, mock_openai):
        """Test handoff document generation."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "executive_summary": "Client experiencing significant work-related anxiety.",
                "presenting_concern": "Work stress leading to sleep issues and anxiety.",
                "emotional_state": {
                    "current": "anxious",
                    "risk_level": "moderate"
                },
                "recommended_approach": "CBT focus on thought patterns around work.",
                "urgent_considerations": ["Monitor sleep patterns", "Assess workload"]
            })
        ))

        response = client.post("/api/v1/ai-twin/handoff", json={
            "user_id": "test-user",
            "chat_id": "test-chat",
            "messages": [
                {"role": "user", "content": "I can't cope with work anymore"},
                {"role": "assistant", "content": "That sounds overwhelming"},
            ],
            "archetype": "THINKER",
            "user_context": {
                "age": 32,
                "occupation": "Software Engineer",
                "phq9_score": 14
            }
        })

        assert response.status_code == 200
        data = response.json()
        assert "executive_summary" in data
        assert "presenting_concern" in data
        assert "emotional_state" in data
        assert "recommended_approach" in data
        assert "urgent_considerations" in data
        assert "full_document" in data

    def test_handoff_without_context(self, client, mock_openai):
        """Test handoff document without user context."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "executive_summary": "Summary",
                "presenting_concern": "Concern",
                "emotional_state": {"current": "unknown"},
                "recommended_approach": "Assessment needed",
                "urgent_considerations": []
            })
        ))

        response = client.post("/api/v1/ai-twin/handoff", json={
            "user_id": "test-user",
            "chat_id": "test-chat",
            "messages": [{"role": "user", "content": "Help"}],
            "archetype": "SEEKER",
            "user_context": None
        })

        assert response.status_code == 200

    def test_handoff_fallback(self, client, mock_openai):
        """Test handoff document fallback on error."""
        mock_openai.return_value.ainvoke = AsyncMock(return_value=MagicMock(
            content="invalid json"
        ))

        response = client.post("/api/v1/ai-twin/handoff", json={
            "user_id": "test-user",
            "chat_id": "test-chat",
            "messages": [{"role": "user", "content": "Help"}],
            "archetype": "SEEKER",
            "user_context": None
        })

        assert response.status_code == 200
        data = response.json()
        # Should return fallback structure
        assert "executive_summary" in data


class TestAITwinHealth:
    """Tests for /ai-twin/health endpoint."""

    def test_health_check(self, client):
        """Test AI Twin health check."""
        response = client.get("/api/v1/ai-twin/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "ai-twin"
