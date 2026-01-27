"""
XAPPY AI Configuration Settings

Environment-based configuration using Pydantic Settings.
All settings are loaded from environment variables or .env file.
"""

from functools import lru_cache
from typing import List, Optional
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "XAPPY AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://xappy:xappy_secret_2024@localhost:5432/xappy_db"
    DB_POOL_SIZE: int = 30
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_RECYCLE: int = 3600

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT Authentication
    SECRET_KEY: str = "xappy-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_TRANSCRIBE_MODEL: str = "gpt-4o-mini-transcribe"

    # WhatsApp Business API
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    WHATSAPP_VERIFY_TOKEN: str = "xappy_verify_token"
    WHATSAPP_BUSINESS_ACCOUNT_ID: Optional[str] = None
    WHATSAPP_API_VERSION: str = "v18.0"
    WHATSAPP_APP_SECRET: Optional[str] = None

    # Bhashini (Voice/Translation)
    BHASHINI_API_KEY: Optional[str] = None
    BHASHINI_USER_ID: Optional[str] = None
    BHASHINI_PIPELINE_URL: str = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

    # SMS Provider
    SMS_PROVIDER: str = "twilio"  # twilio, msg91, textlocal
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None

    # AWS S3 (for media storage)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "ap-south-1"
    AWS_S3_BUCKET: str = "xappy-media"

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 50

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # OTP Settings
    OTP_LENGTH: int = 6
    OTP_EXPIRY_MINUTES: int = 10
    OTP_MAX_ATTEMPTS: int = 3

    # RAG Settings
    RAG_CONFIDENCE_THRESHOLD: float = 0.75
    RAG_TOP_K: int = 5

    # Audit Trail
    AUDIT_HASH_ALGORITHM: str = "sha256"
    AUDIT_RETENTION_DAYS: int = 2555  # 7 years for compliance

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @model_validator(mode="after")
    def validate_production_settings(self):
        """Validate that critical settings are configured in production"""
        if self.is_production:
            if self.SECRET_KEY == "xappy-secret-key-change-in-production":
                raise ValueError("SECRET_KEY must be changed in production")
            if not self.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is required in production")
            if not self.WHATSAPP_APP_SECRET:
                raise ValueError("WHATSAPP_APP_SECRET is required in production")
        return self

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
