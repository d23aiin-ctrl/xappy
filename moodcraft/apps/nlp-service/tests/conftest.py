"""
CereBro NLP Service - Test Fixtures

Shared fixtures for all tests.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
import asyncio


# ─── App Fixture ────────────────────────────────────────────────────

@pytest.fixture
def app():
    """Create FastAPI app for testing."""
    # Mock settings before importing app
    with patch('core.config.settings') as mock_settings:
        mock_settings.OPENAI_API_KEY = "test-api-key"
        mock_settings.OPENAI_MODEL = "gpt-4o"
        mock_settings.OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"
        mock_settings.PINECONE_API_KEY = "test-pinecone-key"
        mock_settings.PINECONE_ENVIRONMENT = "us-east-1"
        mock_settings.PINECONE_INDEX_NAME = "test-index"
        mock_settings.QDRANT_URL = "http://localhost:6333"
        mock_settings.QDRANT_API_KEY = None
        mock_settings.REDIS_URL = "redis://localhost:6379"
        mock_settings.DATABASE_URL = "postgresql://test:test@localhost/test"
        mock_settings.DEBUG = True
        mock_settings.CORS_ORIGINS = ["http://localhost:3000"]
        mock_settings.LANGCHAIN_TRACING_V2 = False
        mock_settings.LANGCHAIN_API_KEY = None
        mock_settings.LANGCHAIN_PROJECT = "test"

        from main import app
        yield app


@pytest.fixture
def client(app):
    """Create synchronous test client."""
    return TestClient(app)


@pytest.fixture
async def async_client(app):
    """Create async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ─── Mock Fixtures ──────────────────────────────────────────────────

@pytest.fixture
def mock_openai():
    """Mock OpenAI client."""
    with patch('langchain_openai.ChatOpenAI') as mock:
        mock_instance = MagicMock()
        mock_instance.ainvoke = AsyncMock(return_value=MagicMock(
            content='{"score": 0.5, "label": "neutral", "emotions": ["calm"], "confidence": 0.8}'
        ))
        mock.return_value = mock_instance
        yield mock


@pytest.fixture
def mock_embeddings():
    """Mock OpenAI embeddings."""
    with patch('langchain_openai.OpenAIEmbeddings') as mock:
        mock_instance = MagicMock()
        mock_instance.embed_query = AsyncMock(return_value=[0.1] * 1536)
        mock_instance.embed_documents = AsyncMock(return_value=[[0.1] * 1536])
        mock.return_value = mock_instance
        yield mock


@pytest.fixture
def mock_vector_store():
    """Mock vector store."""
    with patch('vectorstores.memory_store.get_store') as mock:
        mock_store = AsyncMock()
        mock_store.add_memory = AsyncMock(return_value="test-memory-id")
        mock_store.search_memories = AsyncMock(return_value=[
            {"content": "Test memory", "metadata": {"type": "journal"}, "score": 0.9}
        ])
        mock_store.delete_user_memories = AsyncMock(return_value=True)
        mock.return_value = mock_store
        yield mock


@pytest.fixture
def mock_ai_twin_graph():
    """Mock AI Twin graph."""
    with patch('agents.ai_twin_graph.get_graph') as mock:
        mock_graph = MagicMock()
        mock_graph.ainvoke = AsyncMock(return_value={
            "response": "Test response",
            "risk_level": "low",
            "intervention": None,
            "emotional_state": "neutral",
            "should_escalate": False,
            "crisis_detected": False,
        })
        mock.return_value = mock_graph
        yield mock


# ─── Sample Data Fixtures ───────────────────────────────────────────

@pytest.fixture
def sample_chat_request():
    """Sample chat request data."""
    return {
        "user_id": "test-user-123",
        "chat_id": "test-chat-456",
        "message": "I'm feeling a bit anxious today",
        "archetype": "SEEKER",
        "context": {"streak_days": 5}
    }


@pytest.fixture
def sample_risk_request():
    """Sample risk detection request."""
    return {
        "text": "I'm feeling hopeless today",
        "user_context": {
            "recent_phq9": 12,
            "recent_gad7": 10,
            "days_inactive": 3
        }
    }


@pytest.fixture
def sample_sentiment_request():
    """Sample sentiment analysis request."""
    return {
        "text": "I had a wonderful day with my family",
        "context": None,
        "detailed": True
    }


@pytest.fixture
def sample_memory_request():
    """Sample memory add request."""
    return {
        "user_id": "test-user-123",
        "content": "Today I practiced mindfulness for 10 minutes",
        "memory_type": "journal",
        "source_id": "journal-entry-789",
        "metadata": {"mood": "calm", "tags": ["mindfulness"]}
    }


@pytest.fixture
def sample_crisis_text():
    """Sample crisis text for testing."""
    return "I want to end my life"


@pytest.fixture
def sample_low_risk_text():
    """Sample low risk text for testing."""
    return "I had a productive day at work today"


@pytest.fixture
def sample_session_messages():
    """Sample session messages for summary."""
    return [
        {"role": "user", "content": "I've been feeling stressed lately"},
        {"role": "assistant", "content": "I hear you. Stress can be overwhelming. What's been on your mind?"},
        {"role": "user", "content": "Work has been demanding and I'm not sleeping well"},
        {"role": "assistant", "content": "Sleep and work stress often go together. Have you tried any relaxation techniques?"},
    ]
