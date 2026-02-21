"""
XAPPY Property Dashboard Endpoints

Statistics and analytics for project dashboards.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db.session import get_db
from app.models.report import Report, ReportType, ReportStatus
from app.models.defect_report import DefectReportDetails, DefectCategory, DefectPriority
from app.models.construction_progress import ConstructionProgressDetails
from app.models.user import User
from app.api.v1.deps import get_current_active_user, require_supervisor

router = APIRouter()


# Schemas
class StatCard(BaseModel):
    """Stat card data"""
    title: str
    value: int
    change: Optional[int] = None
    change_period: str = "vs last period"


class CategoryCount(BaseModel):
    """Category count for charts"""
    category: str
    count: int


class TrendData(BaseModel):
    """Trend data point"""
    date: str
    count: int


class SupervisorStats(BaseModel):
    """Supervisor/Project dashboard stats"""
    total_reports_today: StatCard
    pending_acknowledgment: StatCard
    progress_reports_this_week: StatCard
    defects_this_month: StatCard
    reports_by_type: List[CategoryCount]
    recent_reports: List[dict]


class ProjectStats(BaseModel):
    """Project management dashboard stats"""
    total_reports_mtd: StatCard
    open_defects: StatCard
    defects_closed_this_week: StatCard
    overall_progress: StatCard
    defects_by_category: List[CategoryCount]
    defects_by_priority: List[CategoryCount]
    progress_trend: List[TrendData]


class TrendResponse(BaseModel):
    """Trend response"""
    days: int
    data: List[TrendData]


@router.get("/supervisor/stats", response_model=SupervisorStats)
async def get_supervisor_stats(
    site_id: Optional[UUID] = None,
    current_user: User = Depends(require_supervisor),
    db: AsyncSession = Depends(get_db),
):
    """Get supervisor dashboard statistics"""
    # Use user's site if not specified
    site_filter = site_id or current_user.site_id

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())
    month_start = today_start.replace(day=1)
    yesterday_start = today_start - timedelta(days=1)

    # Total reports today
    today_query = select(func.count()).select_from(Report).where(
        Report.reported_at >= today_start
    )
    if site_filter:
        today_query = today_query.where(Report.site_id == site_filter)
    total_today = (await db.execute(today_query)).scalar() or 0

    # Yesterday's count for comparison
    yesterday_query = select(func.count()).select_from(Report).where(
        and_(
            Report.reported_at >= yesterday_start,
            Report.reported_at < today_start
        )
    )
    if site_filter:
        yesterday_query = yesterday_query.where(Report.site_id == site_filter)
    total_yesterday = (await db.execute(yesterday_query)).scalar() or 0

    # Pending acknowledgment
    pending_query = select(func.count()).select_from(Report).where(
        Report.status == ReportStatus.SUBMITTED
    )
    if site_filter:
        pending_query = pending_query.where(Report.site_id == site_filter)
    pending_count = (await db.execute(pending_query)).scalar() or 0

    # Progress reports this week
    progress_week_query = select(func.count()).select_from(Report).where(
        and_(
            Report.report_type == ReportType.CONSTRUCTION_PROGRESS,
            Report.reported_at >= week_start
        )
    )
    if site_filter:
        progress_week_query = progress_week_query.where(Report.site_id == site_filter)
    progress_week = (await db.execute(progress_week_query)).scalar() or 0

    # Defects this month
    defects_month_query = select(func.count()).select_from(Report).where(
        and_(
            Report.report_type == ReportType.DEFECT_SNAG,
            Report.reported_at >= month_start
        )
    )
    if site_filter:
        defects_month_query = defects_month_query.where(Report.site_id == site_filter)
    defects_month = (await db.execute(defects_month_query)).scalar() or 0

    # Reports by type
    type_query = (
        select(Report.report_type, func.count().label("count"))
        .where(Report.reported_at >= month_start)
        .group_by(Report.report_type)
    )
    if site_filter:
        type_query = type_query.where(Report.site_id == site_filter)
    type_result = await db.execute(type_query)
    reports_by_type = [
        CategoryCount(category=row.report_type.value, count=row.count)
        for row in type_result
    ]

    # Recent reports
    recent_query = (
        select(Report)
        .order_by(Report.reported_at.desc())
        .limit(5)
    )
    if site_filter:
        recent_query = recent_query.where(Report.site_id == site_filter)
    recent_result = await db.execute(recent_query)
    recent_reports = [
        {
            "id": str(r.id),
            "reference_number": r.reference_number,
            "title": r.title,
            "type": r.report_type.value,
            "status": r.status.value,
            "reported_at": r.reported_at.isoformat(),
        }
        for r in recent_result.scalars()
    ]

    return SupervisorStats(
        total_reports_today=StatCard(
            title="Reports Today",
            value=total_today,
            change=total_today - total_yesterday,
            change_period="vs yesterday",
        ),
        pending_acknowledgment=StatCard(
            title="Pending Acknowledgment",
            value=pending_count,
        ),
        progress_reports_this_week=StatCard(
            title="Progress Reports This Week",
            value=progress_week,
        ),
        defects_this_month=StatCard(
            title="Defects This Month",
            value=defects_month,
        ),
        reports_by_type=reports_by_type,
        recent_reports=recent_reports,
    )


@router.get("/project/stats", response_model=ProjectStats)
async def get_project_stats(
    site_id: Optional[UUID] = None,
    current_user: User = Depends(require_supervisor),
    db: AsyncSession = Depends(get_db),
):
    """Get project management dashboard statistics"""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())
    month_start = today_start.replace(day=1)
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)

    # Total reports MTD
    mtd_query = select(func.count()).select_from(Report).where(
        Report.reported_at >= month_start
    )
    if site_id:
        mtd_query = mtd_query.where(Report.site_id == site_id)
    total_mtd = (await db.execute(mtd_query)).scalar() or 0

    # Last month total for comparison
    lm_query = select(func.count()).select_from(Report).where(
        and_(
            Report.reported_at >= last_month_start,
            Report.reported_at < month_start
        )
    )
    if site_id:
        lm_query = lm_query.where(Report.site_id == site_id)
    total_lm = (await db.execute(lm_query)).scalar() or 0

    # Open defects count
    open_defects_query = (
        select(func.count())
        .select_from(DefectReportDetails)
        .join(Report, Report.id == DefectReportDetails.report_id)
        .where(DefectReportDetails.defect_status.in_(["open", "assigned", "in_progress"]))
    )
    if site_id:
        open_defects_query = open_defects_query.where(Report.site_id == site_id)
    open_defects = (await db.execute(open_defects_query)).scalar() or 0

    # Defects closed this week
    closed_week_query = (
        select(func.count())
        .select_from(DefectReportDetails)
        .join(Report, Report.id == DefectReportDetails.report_id)
        .where(
            and_(
                DefectReportDetails.defect_status == "closed",
                DefectReportDetails.updated_at >= week_start
            )
        )
    )
    if site_id:
        closed_week_query = closed_week_query.where(Report.site_id == site_id)
    closed_this_week = (await db.execute(closed_week_query)).scalar() or 0

    # Average progress from recent progress reports
    avg_progress_query = (
        select(func.avg(ConstructionProgressDetails.actual_progress_percent))
        .select_from(ConstructionProgressDetails)
        .join(Report, Report.id == ConstructionProgressDetails.report_id)
        .where(Report.reported_at >= month_start)
    )
    if site_id:
        avg_progress_query = avg_progress_query.where(Report.site_id == site_id)
    avg_progress = (await db.execute(avg_progress_query)).scalar() or 0

    # Defects by category
    cat_query = (
        select(DefectReportDetails.category, func.count().label("count"))
        .join(Report, Report.id == DefectReportDetails.report_id)
        .where(Report.reported_at >= month_start)
        .group_by(DefectReportDetails.category)
        .order_by(func.count().desc())
        .limit(10)
    )
    if site_id:
        cat_query = cat_query.where(Report.site_id == site_id)
    cat_result = await db.execute(cat_query)
    defects_by_category = [
        CategoryCount(category=row.category.value if row.category else "unknown", count=row.count)
        for row in cat_result
    ]

    # Defects by priority
    priority_query = (
        select(DefectReportDetails.priority, func.count().label("count"))
        .join(Report, Report.id == DefectReportDetails.report_id)
        .where(Report.reported_at >= month_start)
        .group_by(DefectReportDetails.priority)
        .order_by(func.count().desc())
    )
    if site_id:
        priority_query = priority_query.where(Report.site_id == site_id)
    priority_result = await db.execute(priority_query)
    defects_by_priority = [
        CategoryCount(category=row.priority.value if row.priority else "unknown", count=row.count)
        for row in priority_result
    ]

    # Progress trend data (last 30 days)
    trend_data = []
    for i in range(30):
        day = today_start - timedelta(days=29 - i)
        next_day = day + timedelta(days=1)
        day_query = (
            select(func.count())
            .select_from(Report)
            .where(
                and_(
                    Report.reported_at >= day,
                    Report.reported_at < next_day
                )
            )
        )
        if site_id:
            day_query = day_query.where(Report.site_id == site_id)
        day_count = (await db.execute(day_query)).scalar() or 0
        trend_data.append(TrendData(
            date=day.strftime("%Y-%m-%d"),
            count=day_count,
        ))

    return ProjectStats(
        total_reports_mtd=StatCard(
            title="Reports MTD",
            value=total_mtd,
            change=total_mtd - total_lm,
            change_period="vs last month",
        ),
        open_defects=StatCard(
            title="Open Defects",
            value=open_defects,
        ),
        defects_closed_this_week=StatCard(
            title="Defects Closed This Week",
            value=closed_this_week,
        ),
        overall_progress=StatCard(
            title="Avg Project Progress",
            value=round(avg_progress),
            change_period="% complete",
        ),
        defects_by_category=defects_by_category,
        defects_by_priority=defects_by_priority,
        progress_trend=trend_data,
    )


@router.get("/project/trends", response_model=TrendResponse)
async def get_project_trends(
    days: int = Query(30, ge=7, le=365),
    site_id: Optional[UUID] = None,
    current_user: User = Depends(require_supervisor),
    db: AsyncSession = Depends(get_db),
):
    """Get report trends for the last N days"""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    trend_data = []

    for i in range(days):
        day = today_start - timedelta(days=days - 1 - i)
        next_day = day + timedelta(days=1)
        day_query = select(func.count()).select_from(Report).where(
            and_(
                Report.reported_at >= day,
                Report.reported_at < next_day
            )
        )
        if site_id:
            day_query = day_query.where(Report.site_id == site_id)
        day_count = (await db.execute(day_query)).scalar() or 0
        trend_data.append(TrendData(
            date=day.strftime("%Y-%m-%d"),
            count=day_count,
        ))

    return TrendResponse(days=days, data=trend_data)
