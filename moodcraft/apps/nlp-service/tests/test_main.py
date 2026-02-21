"""
CereBro NLP Service - Main App Tests

Tests for the main FastAPI application and root endpoints.
"""
import pytest
from unittest.mock import patch, AsyncMock


class TestRootEndpoint:
    """Tests for root endpoint."""

    def test_root_returns_api_info(self, client):
        """Test root endpoint returns API information."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "CereBro AI Service"
        assert "version" in data
        assert data["status"] == "running"
        assert "docs" in data
        assert "health" in data


class TestHealthEndpoint:
    """Tests for health check endpoint."""

    def test_health_check_returns_healthy(self, client):
        """Test health check returns healthy status."""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "cerebro-ai"
        assert "version" in data


class TestCORSConfiguration:
    """Tests for CORS configuration."""

    def test_cors_allows_configured_origins(self, client):
        """Test CORS allows configured origins."""
        response = client.options(
            "/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET"
            }
        )

        # Should not be blocked by CORS
        assert response.status_code in [200, 405]


class TestAPIVersioning:
    """Tests for API versioning."""

    def test_api_v1_prefix_works(self, client):
        """Test that /api/v1 prefix works for all routers."""
        endpoints = [
            "/api/v1/ai-twin/health",
            "/api/v1/memory/health",
        ]

        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code == 200


class TestOpenAPIDocs:
    """Tests for OpenAPI documentation."""

    def test_openapi_docs_available(self, client):
        """Test OpenAPI docs are available."""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_openapi_json_available(self, client):
        """Test OpenAPI JSON schema is available."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert data["info"]["title"] == "CereBro AI Service"

    def test_redoc_available(self, client):
        """Test ReDoc documentation is available."""
        response = client.get("/redoc")
        assert response.status_code == 200


class TestErrorHandling:
    """Tests for error handling."""

    def test_invalid_endpoint_returns_404(self, client):
        """Test invalid endpoint returns 404."""
        response = client.get("/api/v1/nonexistent")
        assert response.status_code == 404

    def test_invalid_method_returns_405(self, client):
        """Test invalid HTTP method returns 405."""
        response = client.delete("/")
        assert response.status_code == 405

    def test_invalid_json_returns_422(self, client):
        """Test invalid JSON returns 422."""
        response = client.post(
            "/api/v1/sentiment/analyze",
            content="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422


class TestRequestValidation:
    """Tests for request validation."""

    def test_missing_required_field_returns_422(self, client):
        """Test missing required field returns 422."""
        response = client.post("/api/v1/risk/detect", json={
            # Missing 'text' field
            "user_context": None
        })
        assert response.status_code == 422

    def test_invalid_field_type_returns_422(self, client):
        """Test invalid field type returns 422."""
        response = client.post("/api/v1/sentiment/analyze", json={
            "text": 123,  # Should be string
            "detailed": "invalid"  # Should be boolean
        })
        assert response.status_code == 422


class TestRouterInclusion:
    """Tests for router inclusion."""

    def test_ai_twin_router_included(self, client):
        """Test AI Twin router is included."""
        response = client.get("/api/v1/ai-twin/health")
        assert response.status_code == 200

    def test_sentiment_router_included(self, client, mock_openai):
        """Test Sentiment router is included."""
        response = client.post("/api/v1/sentiment/analyze", json={
            "text": "test",
            "detailed": False
        })
        assert response.status_code == 200

    def test_memory_router_included(self, client, mock_vector_store):
        """Test Memory router is included."""
        response = client.get("/api/v1/memory/health")
        assert response.status_code == 200

    def test_risk_router_included(self, client, mock_openai):
        """Test Risk router is included."""
        response = client.post("/api/v1/risk/detect", json={
            "text": "test",
            "user_context": None
        })
        assert response.status_code == 200
