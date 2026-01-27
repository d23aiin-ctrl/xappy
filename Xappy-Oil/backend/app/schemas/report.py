"""
Report schemas
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.report import ReportType, ReportStatus, ReportSource
from .user import UserResponse
from .site import SiteResponse, AreaResponse


class ReportBase(BaseModel):
    """Base report schema"""
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1)
    location_description: Optional[str] = None
    location_coordinates: Optional[Dict[str, float]] = None


class ReportCreate(ReportBase):
    """Report creation schema (base)"""
    report_type: ReportType
    site_id: Optional[UUID] = None
    area_id: Optional[UUID] = None
    source: ReportSource = ReportSource.WEB


class ReportUpdate(BaseModel):
    """Report update schema"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    location_description: Optional[str] = None
    location_coordinates: Optional[Dict[str, float]] = None
    status: Optional[ReportStatus] = None


class ReportAcknowledge(BaseModel):
    """Report acknowledgment request"""
    notes: Optional[str] = None


class ReportClose(BaseModel):
    """Report close request"""
    resolution_notes: str = Field(..., min_length=1)


class ReporterInfo(BaseModel):
    """Reporter info (simplified)"""
    id: UUID
    badge_number: str
    full_name: str
    role: str

    class Config:
        from_attributes = True


class ReportResponse(BaseModel):
    """Report response schema"""
    id: UUID
    reference_number: str
    report_type: ReportType
    title: str
    description: str
    status: ReportStatus
    reporter_id: UUID
    reporter: Optional[ReporterInfo] = None
    site_id: Optional[UUID] = None
    site: Optional[SiteResponse] = None
    area_id: Optional[UUID] = None
    area: Optional[AreaResponse] = None
    location_description: Optional[str] = None
    location_coordinates: Optional[Dict[str, float]] = None
    source: ReportSource
    reported_at: datetime
    acknowledged_at: Optional[datetime] = None
    acknowledged_by_id: Optional[UUID] = None
    resolved_at: Optional[datetime] = None
    resolved_by_id: Optional[UUID] = None
    ai_classification: Optional[Dict[str, Any]] = None
    ai_summary: Optional[str] = None
    ai_recommendations: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    """Report list response"""
    items: List[ReportResponse]
    total: int
    skip: int
    limit: int


class AuditTrailEntry(BaseModel):
    """Audit trail entry"""
    id: UUID
    action: str
    action_by_id: UUID
    action_by_name: Optional[str] = None
    previous_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReportTimelineResponse(BaseModel):
    """Report timeline (audit trail)"""
    report_id: UUID
    reference_number: str
    entries: List[AuditTrailEntry]
