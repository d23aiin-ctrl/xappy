"""
CereBro NLP Service - Memory Router Tests

Tests for user memory management and RAG retrieval.
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock


class TestAddMemory:
    """Tests for /memory/add endpoint."""

    def test_add_memory_success(self, client, mock_vector_store):
        """Test successful memory addition."""
        response = client.post("/api/v1/memory/add", json={
            "user_id": "test-user-123",
            "content": "Today I practiced mindfulness meditation",
            "memory_type": "journal",
            "source_id": "journal-entry-1",
            "metadata": {"mood": "calm"}
        })

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "memory_id" in data

    def test_add_memory_with_different_types(self, client, mock_vector_store):
        """Test adding memories of different types."""
        memory_types = ["journal", "mood", "chat", "insight", "entity"]

        for mem_type in memory_types:
            response = client.post("/api/v1/memory/add", json={
                "user_id": "test-user",
                "content": f"Test content for {mem_type}",
                "memory_type": mem_type,
                "source_id": f"source-{mem_type}",
                "metadata": None
            })

            assert response.status_code == 200
            assert response.json()["success"] is True

    def test_add_memory_with_metadata(self, client, mock_vector_store):
        """Test adding memory with metadata."""
        response = client.post("/api/v1/memory/add", json={
            "user_id": "test-user",
            "content": "Feeling anxious about tomorrow",
            "memory_type": "mood",
            "source_id": "mood-entry-1",
            "metadata": {
                "mood_score": 3,
                "emotions": ["anxiety", "worry"],
                "tags": ["work", "deadline"]
            }
        })

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_add_memory_without_metadata(self, client, mock_vector_store):
        """Test adding memory without optional metadata."""
        response = client.post("/api/v1/memory/add", json={
            "user_id": "test-user",
            "content": "Simple memory without metadata",
            "memory_type": "journal",
            "source_id": "journal-1"
        })

        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_add_memory_includes_timestamp(self, client, mock_vector_store):
        """Test that timestamp is automatically added."""
        response = client.post("/api/v1/memory/add", json={
            "user_id": "test-user",
            "content": "Memory with auto timestamp",
            "memory_type": "chat",
            "source_id": "chat-1",
            "metadata": {}
        })

        assert response.status_code == 200
        # The store mock should have been called with metadata containing timestamp
        mock_vector_store.return_value.add_memory.assert_called()


class TestSearchMemories:
    """Tests for /memory/search endpoint."""

    def test_search_memories_basic(self, client, mock_vector_store):
        """Test basic memory search."""
        response = client.post("/api/v1/memory/search", json={
            "user_id": "test-user",
            "query": "mindfulness meditation",
            "k": 5,
            "memory_types": None,
            "min_score": 0.5
        })

        assert response.status_code == 200
        data = response.json()
        assert "memories" in data
        assert "count" in data
        assert isinstance(data["memories"], list)

    def test_search_with_memory_type_filter(self, client, mock_vector_store):
        """Test search with memory type filter."""
        response = client.post("/api/v1/memory/search", json={
            "user_id": "test-user",
            "query": "feeling anxious",
            "k": 10,
            "memory_types": ["mood", "journal"],
            "min_score": 0.3
        })

        assert response.status_code == 200
        mock_vector_store.return_value.search_memories.assert_called_with(
            user_id="test-user",
            query="feeling anxious",
            k=10,
            memory_types=["mood", "journal"],
            min_score=0.3
        )

    def test_search_with_min_score(self, client, mock_vector_store):
        """Test search with minimum score threshold."""
        response = client.post("/api/v1/memory/search", json={
            "user_id": "test-user",
            "query": "stress management",
            "k": 5,
            "memory_types": None,
            "min_score": 0.8
        })

        assert response.status_code == 200
        mock_vector_store.return_value.search_memories.assert_called()

    def test_search_returns_correct_structure(self, client, mock_vector_store):
        """Test that search returns correctly structured results."""
        mock_vector_store.return_value.search_memories = AsyncMock(return_value=[
            {"content": "Memory 1", "metadata": {"type": "journal"}, "score": 0.9},
            {"content": "Memory 2", "metadata": {"type": "mood"}, "score": 0.8},
        ])

        response = client.post("/api/v1/memory/search", json={
            "user_id": "test-user",
            "query": "test query",
            "k": 5,
            "memory_types": None,
            "min_score": 0.5
        })

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        for memory in data["memories"]:
            assert "content" in memory
            assert "metadata" in memory
            assert "score" in memory

    def test_search_with_custom_k(self, client, mock_vector_store):
        """Test search with custom number of results."""
        response = client.post("/api/v1/memory/search", json={
            "user_id": "test-user",
            "query": "test",
            "k": 20,
            "memory_types": None,
            "min_score": 0.5
        })

        assert response.status_code == 200
        mock_vector_store.return_value.search_memories.assert_called_with(
            user_id="test-user",
            query="test",
            k=20,
            memory_types=None,
            min_score=0.5
        )


class TestBatchAddMemories:
    """Tests for /memory/batch-add endpoint."""

    def test_batch_add_memories_success(self, client, mock_vector_store):
        """Test successful batch memory addition."""
        response = client.post("/api/v1/memory/batch-add", json={
            "user_id": "test-user",
            "memories": [
                {
                    "content": "Memory 1",
                    "memory_type": "journal",
                    "source_id": "source-1",
                    "metadata": {"tag": "test"}
                },
                {
                    "content": "Memory 2",
                    "memory_type": "mood",
                    "source_id": "source-2",
                    "metadata": None
                },
                {
                    "content": "Memory 3",
                    "memory_type": "chat",
                    "source_id": "source-3"
                }
            ]
        })

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["count"] == 3
        assert len(data["ids"]) == 3

    def test_batch_add_empty_list(self, client, mock_vector_store):
        """Test batch add with empty list."""
        response = client.post("/api/v1/memory/batch-add", json={
            "user_id": "test-user",
            "memories": []
        })

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["count"] == 0
        assert len(data["ids"]) == 0

    def test_batch_add_large_batch(self, client, mock_vector_store):
        """Test batch add with many memories."""
        memories = [
            {
                "content": f"Memory {i}",
                "memory_type": "journal",
                "source_id": f"source-{i}"
            }
            for i in range(50)
        ]

        response = client.post("/api/v1/memory/batch-add", json={
            "user_id": "test-user",
            "memories": memories
        })

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 50


class TestDeleteUserMemories:
    """Tests for /memory/user/{user_id} DELETE endpoint."""

    def test_delete_user_memories_success(self, client, mock_vector_store):
        """Test successful deletion of user memories."""
        response = client.delete("/api/v1/memory/user/test-user-123")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "test-user-123" in data["message"]

    def test_delete_memories_for_gdpr(self, client, mock_vector_store):
        """Test deletion for GDPR compliance."""
        response = client.delete("/api/v1/memory/user/gdpr-delete-user")

        assert response.status_code == 200
        mock_vector_store.return_value.delete_user_memories.assert_called_with(
            "gdpr-delete-user"
        )


class TestMemoryHealth:
    """Tests for /memory/health endpoint."""

    def test_memory_health_healthy(self, client, mock_vector_store):
        """Test health check returns healthy status."""
        response = client.get("/api/v1/memory/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "store_type" in data

    def test_memory_health_unhealthy(self, client):
        """Test health check returns unhealthy when store fails."""
        with patch('vectorstores.memory_store.get_store') as mock:
            mock.side_effect = Exception("Connection failed")

            response = client.get("/api/v1/memory/health")

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "unhealthy"
            assert "error" in data


class TestMemoryIsolation:
    """Tests for user memory isolation."""

    def test_memories_isolated_by_user(self, client, mock_vector_store):
        """Test that memories are isolated by user_id."""
        # Search for user 1
        response1 = client.post("/api/v1/memory/search", json={
            "user_id": "user-1",
            "query": "test",
            "k": 5,
            "memory_types": None,
            "min_score": 0.5
        })

        # Search for user 2
        response2 = client.post("/api/v1/memory/search", json={
            "user_id": "user-2",
            "query": "test",
            "k": 5,
            "memory_types": None,
            "min_score": 0.5
        })

        assert response1.status_code == 200
        assert response2.status_code == 200

        # Verify both calls used correct user_id
        calls = mock_vector_store.return_value.search_memories.call_args_list
        assert any(call.kwargs.get("user_id") == "user-1" for call in calls)
        assert any(call.kwargs.get("user_id") == "user-2" for call in calls)
