"""
XAPPY AI API v1 Router

Main router that aggregates all endpoint routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    sites,
    reports,
    near_miss,
    whatsapp,
    dashboard,
    chat,
)

api_router = APIRouter()

# Health check for API
@api_router.get("/health", tags=["Health"])
async def api_health():
    """API v1 health check"""
    return {"status": "healthy", "api_version": "v1"}

# Authentication
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

# Users
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
)

# Sites
api_router.include_router(
    sites.router,
    prefix="/sites",
    tags=["Sites"]
)

# Reports (universal)
api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["Reports"]
)

# Near-Miss Reports
api_router.include_router(
    near_miss.router,
    prefix="/near-miss",
    tags=["Near-Miss Reports"]
)

# Demo Chat
api_router.include_router(
    chat.router,
    prefix="",  # Endpoints have /chat prefix already
    tags=["Chat"]
)

# WhatsApp Webhook
api_router.include_router(
    whatsapp.router,
    prefix="/whatsapp",
    tags=["WhatsApp"]
)

# Dashboard
api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"]
)
