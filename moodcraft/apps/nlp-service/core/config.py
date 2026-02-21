"""
CereBro AI Service - Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "CereBro AI Service"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"

    # OpenAI
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    # Anthropic (optional)
    ANTHROPIC_API_KEY: Optional[str] = None

    # Vector Database - Pinecone
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_ENVIRONMENT: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "cerebro-memory"

    # Vector Database - Qdrant (alternative)
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Database
    DATABASE_URL: Optional[str] = None

    # LangSmith (observability)
    LANGCHAIN_TRACING_V2: bool = True
    LANGCHAIN_API_KEY: Optional[str] = None
    LANGCHAIN_PROJECT: str = "cerebro-ai"

    # Security
    API_SECRET_KEY: str = "change-me-in-production"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
