"""
CereBro NLP Service - Core Config Tests

Tests for configuration management.
"""
import pytest
from unittest.mock import patch
import os


class TestSettingsLoading:
    """Tests for settings loading from environment."""

    def test_settings_loads_defaults(self):
        """Test settings loads with defaults."""
        with patch.dict(os.environ, {}, clear=True):
            with patch.dict(os.environ, {
                'OPENAI_API_KEY': 'test-key',
            }):
                from core.config import Settings
                settings = Settings()

                assert settings.OPENAI_API_KEY == 'test-key'
                assert settings.DEBUG is False
                assert settings.API_PREFIX == '/api/v1'

    def test_settings_reads_environment(self):
        """Test settings reads from environment variables."""
        test_env = {
            'OPENAI_API_KEY': 'env-api-key',
            'OPENAI_MODEL': 'gpt-4-turbo',
            'DEBUG': 'true',
            'PINECONE_API_KEY': 'pinecone-key',
            'PINECONE_ENVIRONMENT': 'us-west-1',
            'PINECONE_INDEX_NAME': 'custom-index',
        }

        with patch.dict(os.environ, test_env, clear=False):
            from core.config import Settings
            settings = Settings()

            assert settings.OPENAI_API_KEY == 'env-api-key'
            assert settings.OPENAI_MODEL == 'gpt-4-turbo'
            assert settings.DEBUG is True
            assert settings.PINECONE_API_KEY == 'pinecone-key'
            assert settings.PINECONE_ENVIRONMENT == 'us-west-1'
            assert settings.PINECONE_INDEX_NAME == 'custom-index'

    def test_settings_optional_fields(self):
        """Test settings handles optional fields."""
        with patch.dict(os.environ, {
            'OPENAI_API_KEY': 'test-key',
        }, clear=False):
            from core.config import Settings
            settings = Settings()

            # Optional fields should be None or have defaults
            assert settings.ANTHROPIC_API_KEY is None or settings.ANTHROPIC_API_KEY == ''
            assert settings.LANGCHAIN_API_KEY is None or settings.LANGCHAIN_API_KEY == ''


class TestCORSOrigins:
    """Tests for CORS origins configuration."""

    def test_cors_origins_as_list(self):
        """Test CORS origins can be set as JSON list."""
        with patch.dict(os.environ, {
            'OPENAI_API_KEY': 'test-key',
            'CORS_ORIGINS': '["http://localhost:3000", "http://localhost:3001"]',
        }, clear=False):
            from core.config import Settings
            settings = Settings()

            assert isinstance(settings.CORS_ORIGINS, list)
            assert 'http://localhost:3000' in settings.CORS_ORIGINS

    def test_cors_origins_default(self):
        """Test CORS origins default value."""
        with patch.dict(os.environ, {
            'OPENAI_API_KEY': 'test-key',
        }, clear=False):
            from core.config import Settings
            settings = Settings()

            assert isinstance(settings.CORS_ORIGINS, list)


class TestDatabaseURLs:
    """Tests for database URL configuration."""

    def test_database_url_format(self):
        """Test DATABASE_URL format."""
        with patch.dict(os.environ, {
            'OPENAI_API_KEY': 'test-key',
            'DATABASE_URL': 'postgresql://user:pass@host:5432/db',
        }, clear=False):
            from core.config import Settings
            settings = Settings()

            assert 'postgresql' in settings.DATABASE_URL

    def test_redis_url_format(self):
        """Test REDIS_URL format."""
        with patch.dict(os.environ, {
            'OPENAI_API_KEY': 'test-key',
            'REDIS_URL': 'redis://localhost:6379/0',
        }, clear=False):
            from core.config import Settings
            settings = Settings()

            assert 'redis' in settings.REDIS_URL


class TestVectorDBConfig:
    """Tests for vector database configuration."""

    def test_pinecone_config(self):
        """Test Pinecone configuration."""
        with patch.dict(os.environ, {
            'OPENAI_API_KEY': 'test-key',
            'PINECONE_API_KEY': 'pinecone-api-key',
            'PINECONE_ENVIRONMENT': 'us-east-1',
            'PINECONE_INDEX_NAME': 'cerebro-memory',
        }, clear=False):
            from core.config import Settings
            settings = Settings()

            assert settings.PINECONE_API_KEY == 'pinecone-api-key'
            assert settings.PINECONE_ENVIRONMENT == 'us-east-1'
            assert settings.PINECONE_INDEX_NAME == 'cerebro-memory'

    def test_qdrant_config(self):
        """Test Qdrant configuration."""
        with patch.dict(os.environ, {
            'OPENAI_API_KEY': 'test-key',
            'QDRANT_URL': 'http://localhost:6333',
            'QDRANT_API_KEY': 'qdrant-api-key',
        }, clear=False):
            from core.config import Settings
            settings = Settings()

            assert settings.QDRANT_URL == 'http://localhost:6333'
            assert settings.QDRANT_API_KEY == 'qdrant-api-key'


class TestLangSmithConfig:
    """Tests for LangSmith observability configuration."""

    def test_langsmith_enabled(self):
        """Test LangSmith configuration when enabled."""
        with patch.dict(os.environ, {
            'OPENAI_API_KEY': 'test-key',
            'LANGCHAIN_TRACING_V2': 'true',
            'LANGCHAIN_API_KEY': 'langsmith-key',
            'LANGCHAIN_PROJECT': 'cerebro-ai',
        }, clear=False):
            from core.config import Settings
            settings = Settings()

            assert settings.LANGCHAIN_TRACING_V2 is True
            assert settings.LANGCHAIN_API_KEY == 'langsmith-key'
            assert settings.LANGCHAIN_PROJECT == 'cerebro-ai'

    def test_langsmith_disabled_by_default(self):
        """Test LangSmith is disabled by default."""
        with patch.dict(os.environ, {
            'OPENAI_API_KEY': 'test-key',
        }, clear=False):
            from core.config import Settings
            settings = Settings()

            assert settings.LANGCHAIN_TRACING_V2 is False
