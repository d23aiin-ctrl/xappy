"""
CereBro NLP Service - Risk Router Tests

Tests for crisis detection, risk assessment, and escalation logic.
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock


class TestRiskDetection:
    """Tests for /risk/detect endpoint."""

    def test_detect_low_risk_text(self, client, mock_openai):
        """Test detection of low risk text."""
        response = client.post("/api/v1/risk/detect", json={
            "text": "I had a great day at work today",
            "user_context": None
        })

        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] in ["low", "moderate"]
        assert data["risk_score"] < 40
        assert data["should_escalate"] is False

    def test_detect_moderate_risk_keywords(self, client, mock_openai):
        """Test detection of moderate risk keywords."""
        response = client.post("/api/v1/risk/detect", json={
            "text": "I feel hopeless and trapped in my situation",
            "user_context": None
        })

        assert response.status_code == 200
        data = response.json()
        assert "hopeless" in data["keywords_detected"] or "trapped" in data["keywords_detected"]
        assert data["risk_score"] >= 10

    def test_detect_high_risk_keywords(self, client, mock_openai):
        """Test detection of high risk (crisis) keywords."""
        response = client.post("/api/v1/risk/detect", json={
            "text": "I want to hurt myself",
            "user_context": None
        })

        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] in ["high", "critical"]
        assert data["should_escalate"] is True
        assert len(data["keywords_detected"]) > 0

    def test_detect_crisis_keywords_triggers_critical(self, client, mock_openai):
        """Test that crisis keywords trigger critical level."""
        response = client.post("/api/v1/risk/detect", json={
            "text": "I want to end my life and kill myself",
            "user_context": None
        })

        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] == "critical"
        assert data["should_escalate"] is True
        assert data["escalation_type"] == "crisis"

    def test_user_context_increases_risk_score(self, client, mock_openai):
        """Test that high PHQ-9/GAD-7 scores increase risk."""
        # Without context
        response1 = client.post("/api/v1/risk/detect", json={
            "text": "I'm feeling a bit down",
            "user_context": None
        })

        # With high clinical scores
        response2 = client.post("/api/v1/risk/detect", json={
            "text": "I'm feeling a bit down",
            "user_context": {
                "recent_phq9": 20,
                "recent_gad7": 18,
                "days_inactive": 10
            }
        })

        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response2.json()["risk_score"] > response1.json()["risk_score"]

    def test_phq9_critical_range_noted(self, client, mock_openai):
        """Test that critical PHQ-9 range is noted in details."""
        response = client.post("/api/v1/risk/detect", json={
            "text": "I had a normal day",
            "user_context": {
                "recent_phq9": 18,
                "recent_gad7": 5,
                "days_inactive": 0
            }
        })

        assert response.status_code == 200
        data = response.json()
        assert "PHQ-9" in data["details"]

    def test_empty_text_returns_low_risk(self, client, mock_openai):
        """Test that empty text returns low risk."""
        response = client.post("/api/v1/risk/detect", json={
            "text": "",
            "user_context": None
        })

        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] == "low"
        assert data["risk_score"] == 0


class TestBatchRiskDetection:
    """Tests for /risk/batch endpoint."""

    def test_batch_detect_multiple_texts(self, client, mock_openai):
        """Test batch risk detection."""
        response = client.post("/api/v1/risk/batch", json={
            "texts": [
                "I had a great day",
                "I feel hopeless",
                "I want to hurt myself"
            ],
            "user_id": "test-user"
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 3
        assert data["highest_risk"] in ["moderate", "high", "critical"]

    def test_batch_detect_any_crisis(self, client, mock_openai):
        """Test that any_crisis flag is set correctly."""
        response = client.post("/api/v1/risk/batch", json={
            "texts": [
                "Normal day",
                "I want to end my life"
            ],
            "user_id": None
        })

        assert response.status_code == 200
        data = response.json()
        assert data["any_crisis"] is True

    def test_batch_detect_empty_list(self, client, mock_openai):
        """Test batch detection with empty list."""
        response = client.post("/api/v1/risk/batch", json={
            "texts": [],
            "user_id": None
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) == 0
        assert data["highest_risk"] == "low"
        assert data["any_crisis"] is False


class TestCrisisResources:
    """Tests for /risk/crisis-resources endpoint."""

    def test_get_us_resources(self, client):
        """Test getting US crisis resources."""
        response = client.post("/api/v1/risk/crisis-resources", json={
            "region": "US"
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data["resources"]) > 0
        assert any(r["number"] == "988" for r in data["resources"])
        assert "emergency_message" in data

    def test_get_uk_resources(self, client):
        """Test getting UK crisis resources."""
        response = client.post("/api/v1/risk/crisis-resources", json={
            "region": "UK"
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data["resources"]) > 0
        assert any("Samaritans" in r["name"] for r in data["resources"])

    def test_get_india_resources(self, client):
        """Test getting India crisis resources."""
        response = client.post("/api/v1/risk/crisis-resources", json={
            "region": "IN"
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data["resources"]) > 0

    def test_unknown_region_defaults_to_us(self, client):
        """Test that unknown region defaults to US resources."""
        response = client.post("/api/v1/risk/crisis-resources", json={
            "region": "UNKNOWN"
        })

        assert response.status_code == 200
        data = response.json()
        # Should default to US resources
        assert any(r["number"] == "988" for r in data["resources"])

    def test_emergency_message_present(self, client):
        """Test that emergency message is always present."""
        response = client.post("/api/v1/risk/crisis-resources", json={
            "region": "AU"
        })

        assert response.status_code == 200
        data = response.json()
        assert "emergency" in data["emergency_message"].lower()


class TestRiskKeywords:
    """Tests for keyword detection logic."""

    def test_crisis_keywords_detection(self, client, mock_openai):
        """Test detection of various crisis keywords."""
        crisis_phrases = [
            "suicide",
            "kill myself",
            "end my life",
            "want to die",
            "better off dead",
            "self-harm",
            "cut myself",
        ]

        for phrase in crisis_phrases:
            response = client.post("/api/v1/risk/detect", json={
                "text": f"I've been thinking about {phrase}",
                "user_context": None
            })

            assert response.status_code == 200
            data = response.json()
            assert data["risk_level"] in ["high", "critical"], f"Failed for phrase: {phrase}"
            assert data["should_escalate"] is True, f"Failed for phrase: {phrase}"

    def test_moderate_keywords_detection(self, client, mock_openai):
        """Test detection of moderate risk keywords."""
        moderate_phrases = [
            "hopeless",
            "worthless",
            "no one cares",
            "can't take it",
            "falling apart",
        ]

        for phrase in moderate_phrases:
            response = client.post("/api/v1/risk/detect", json={
                "text": f"I feel {phrase}",
                "user_context": None
            })

            assert response.status_code == 200
            data = response.json()
            assert len(data["keywords_detected"]) > 0, f"Failed for phrase: {phrase}"

    def test_case_insensitivity(self, client, mock_openai):
        """Test that keyword detection is case insensitive."""
        response = client.post("/api/v1/risk/detect", json={
            "text": "I feel HOPELESS and WORTHLESS",
            "user_context": None
        })

        assert response.status_code == 200
        data = response.json()
        assert len(data["keywords_detected"]) >= 2
