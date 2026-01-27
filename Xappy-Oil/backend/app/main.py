"""
XAPPY AI - Oil & Gas Compliance Platform

FastAPI application entry point with production-ready middleware stack.
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.session import init_db, close_db
from app.db.redis import close_redis
from app.api.v1.router import api_router
from app.middleware.request_context import RequestContextMiddleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.error_handler import XappyException, http_exception_handler


# Configure structured logging
def configure_logging() -> None:
    """Configure structured logging with structlog"""
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer() if settings.is_production else structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Set log level
    log_level = logging.WARNING if settings.is_production else logging.DEBUG
    logging.basicConfig(
        format="%(message)s",
        level=log_level,
    )


# Application startup time
startup_time: datetime = datetime.now(timezone.utc)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan events"""
    # Startup
    configure_logging()
    logger = structlog.get_logger()
    logger.info(
        "Starting XAPPY AI",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
    )

    # Initialize database
    try:
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error("Database initialization failed", error=str(e))
        raise

    yield

    # Shutdown
    logger.info("Shutting down XAPPY AI")
    await close_db()
    await close_redis()
    logger.info("Database connections closed")


def create_application() -> FastAPI:
    """Create and configure the FastAPI application"""

    # OpenAPI documentation settings
    docs_url = "/docs" if not settings.is_production else None
    redoc_url = "/redoc" if not settings.is_production else None
    openapi_url = "/openapi.json" if not settings.is_production else None

    app = FastAPI(
        title=settings.APP_NAME,
        description="Compliance-grade frontline communication platform for Oil & Gas operations",
        version=settings.APP_VERSION,
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
        lifespan=lifespan,
    )

    # Middleware stack (order matters - first added = last executed)

    # 1. Request context (first to execute)
    app.add_middleware(RequestContextMiddleware)

    # 2. Logging
    app.add_middleware(LoggingMiddleware)

    # 3. CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 4. Compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Exception handlers
    app.add_exception_handler(XappyException, http_exception_handler)

    # Include API router
    app.include_router(api_router, prefix="/api/v1")

    return app


# Create application instance
app = create_application()


# Health check endpoints (outside of /api/v1 for load balancer)
@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check endpoint"""
    uptime = (datetime.now(timezone.utc) - startup_time).total_seconds()
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "uptime_seconds": round(uptime, 2),
    }


@app.get("/ready", tags=["Health"])
async def readiness_check():
    """Readiness check for Kubernetes"""
    # TODO: Add database connectivity check
    return {"status": "ready"}


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs" if not settings.is_production else "disabled",
        "health": "/health",
        "api": "/api/v1",
    }
