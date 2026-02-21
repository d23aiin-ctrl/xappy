"""
CereBro AI Service - Main Application

A proper agentic AI backend powered by:
- LangChain for LLM orchestration
- LangGraph for multi-agent workflows
- Pinecone/Qdrant for vector storage (RAG)
- FastAPI for high-performance API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import structlog

from core.config import settings

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


# ─── Lifespan Events ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting CereBro AI Service", version="1.0.0")

    # Initialize vector store
    try:
        from vectorstores.memory_store import get_store
        store = get_store()
        logger.info("Vector store initialized", type=type(store).__name__)
    except Exception as e:
        logger.warning("Vector store initialization failed", error=str(e))

    # Initialize LangGraph
    try:
        from agents.ai_twin_graph import get_graph
        graph = get_graph()
        logger.info("AI Twin graph compiled successfully")
    except Exception as e:
        logger.warning("AI Twin graph initialization failed", error=str(e))

    yield

    # Shutdown
    logger.info("Shutting down CereBro AI Service")


# ─── Create Application ──────────────────────────────────────────

app = FastAPI(
    title="CereBro AI Service",
    description="""
    Agentic AI backend for the CereBro mental wellness platform.

    ## Features
    - **AI Twin**: Multi-agent system for personalized mental wellness support
    - **RAG Memory**: Long-term memory with semantic search
    - **Risk Detection**: Real-time crisis detection and escalation
    - **Sentiment Analysis**: Emotion and sentiment analysis
    - **Case Briefs**: AI-generated summaries for therapists

    ## Architecture
    - LangChain + LangGraph for agent orchestration
    - Pinecone/Qdrant for vector storage
    - OpenAI GPT-4o for language generation
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Include Routers ─────────────────────────────────────────────

def _include_router_safely(module_name: str, attr_name: str = "router") -> None:
    """Include optional routers without crashing service startup."""
    try:
        module = __import__(module_name, fromlist=[attr_name])
        router = getattr(module, attr_name)
        app.include_router(router, prefix="/api/v1")
        logger.info("Router included", module=module_name)
    except Exception as e:
        logger.warning("Router skipped", module=module_name, error=str(e))


_include_router_safely("routers.ai_twin")
_include_router_safely("routers.sentiment")
_include_router_safely("routers.memory")
_include_router_safely("routers.risk")


# ─── Root Endpoints ──────────────────────────────────────────────

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "CereBro AI Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "cerebro-ai",
        "version": "1.0.0",
    }


# ─── Run Application ─────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )
