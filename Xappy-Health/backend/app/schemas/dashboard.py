"""
Dashboard schemas
"""
from typing import List, Optional
from pydantic import BaseModel
from .report import ReportResponse


class StatCard(BaseModel):
    """Single stat card"""
    title: str
    value: int
    change: Optional[int] = None
    change_period: str


class ReportByType(BaseModel):
    """Reports by type count"""
    category: str
    count: int


class ReportBySite(BaseModel):
    """Reports by site count"""
    site: str
    count: int


class SeverityDistribution(BaseModel):
    """Severity distribution"""
    severity: str
    count: int


class MonthlyTrend(BaseModel):
    """Monthly trend data"""
    month: str
    near_miss: int
    incident: int


class SupervisorStats(BaseModel):
    """Supervisor dashboard stats"""
    total_reports_today: StatCard
    pending_acknowledgment: StatCard
    near_miss_this_week: StatCard
    incidents_this_month: StatCard
    reports_by_type: List[ReportByType]
    recent_reports: List[ReportResponse]


class HSEStats(BaseModel):
    """HSE manager dashboard stats"""
    total_reports: StatCard
    open_incidents: StatCard
    near_miss_rate: StatCard
    compliance_score: StatCard
    reports_by_site: List[ReportBySite]
    severity_distribution: List[SeverityDistribution]


class HSETrends(BaseModel):
    """HSE trends data"""
    monthly_trends: List[MonthlyTrend]
    days: int
