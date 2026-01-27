"""
Near-Miss report schemas
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.near_miss import NearMissCategory, PotentialSeverity
from app.models.report import ReportSource
from .report import ReportResponse


class NearMissCreate(BaseModel):
    """Near-miss report creation schema"""
    # Report fields
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1)
    location_description: str = Field(..., min_length=1)
    site_id: Optional[UUID] = None
    area_id: Optional[UUID] = None
    source: ReportSource = ReportSource.WEB

    # Near-miss specific fields
    category: NearMissCategory
    potential_severity: PotentialSeverity = PotentialSeverity.MEDIUM
    equipment_involved: Optional[List[str]] = None
    weather_conditions: Optional[str] = None
    time_of_occurrence: Optional[str] = None
    witnesses: Optional[List[str]] = None
    immediate_actions_taken: Optional[str] = None
    root_cause_preliminary: Optional[str] = None
    contributing_factors: Optional[List[str]] = None
    recommendations: Optional[str] = None


class NearMissDetailsResponse(BaseModel):
    """Near-miss details response"""
    id: UUID
    report_id: UUID
    category: NearMissCategory
    potential_severity: PotentialSeverity
    equipment_involved: Optional[List[str]] = None
    weather_conditions: Optional[str] = None
    time_of_occurrence: Optional[str] = None
    witnesses: Optional[List[str]] = None
    immediate_actions_taken: Optional[str] = None
    root_cause_preliminary: Optional[str] = None
    contributing_factors: Optional[List[str]] = None
    recommendations: Optional[str] = None
    follow_up_required: bool
    follow_up_assigned_to_id: Optional[UUID] = None
    follow_up_completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NearMissReportResponse(ReportResponse):
    """Near-miss report with details"""
    details: Optional[NearMissDetailsResponse] = None


class NearMissListResponse(BaseModel):
    """Near-miss list response"""
    items: List[NearMissReportResponse]
    total: int
    skip: int
    limit: int
