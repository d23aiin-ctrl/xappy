"""
XAPPY Property API v1 Router

Main router that aggregates all endpoint routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    # Existing endpoints
    auth,
    users,
    sites,
    reports,
    dashboard,
    chat,
    # New property management endpoints (Phase 2-3)
    properties,
    tenants,
    qualifications,
    documents,
    deposits,
    contracts,
    maintenance,
    suppliers,
    costs,
    compliance,
)

api_router = APIRouter()

# Health check for API
@api_router.get("/health", tags=["Health"])
async def api_health():
    """API v1 health check"""
    return {"status": "healthy", "api_version": "v1"}

# ============================================
# EXISTING ENDPOINTS (Construction Management)
# ============================================

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

# Sites (Construction)
api_router.include_router(
    sites.router,
    prefix="/sites",
    tags=["Sites"]
)

# Reports (Construction)
api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["Reports"]
)

# Chat
api_router.include_router(
    chat.router,
    prefix="",  # Endpoints have /chat prefix already
    tags=["Chat"]
)

# Dashboard (Construction)
api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

# ============================================
# NEW ENDPOINTS (Property Management - Phase 2-3)
# ============================================

# Properties
api_router.include_router(
    properties.router,
    prefix="/properties",
    tags=["Properties"]
)

# Tenants & Pipeline
api_router.include_router(
    tenants.router,
    prefix="/tenants",
    tags=["Tenants"]
)

# Qualifications & Questionnaires
api_router.include_router(
    qualifications.router,
    prefix="/qualifications",
    tags=["Qualifications"]
)

# Documents (Secure)
api_router.include_router(
    documents.router,
    prefix="/documents",
    tags=["Documents"]
)

# Holding Deposits
api_router.include_router(
    deposits.router,
    prefix="/deposits",
    tags=["Deposits"]
)

# Contracts & E-Signatures
api_router.include_router(
    contracts.router,
    prefix="/contracts",
    tags=["Contracts"]
)

# Maintenance Issues & Jobs
api_router.include_router(
    maintenance.router,
    prefix="/maintenance",
    tags=["Maintenance"]
)

# Suppliers
api_router.include_router(
    suppliers.router,
    prefix="/suppliers",
    tags=["Suppliers"]
)

# Cost Tracking
api_router.include_router(
    costs.router,
    prefix="/costs",
    tags=["Costs"]
)

# Compliance
api_router.include_router(
    compliance.router,
    prefix="/compliance",
    tags=["Compliance"]
)
