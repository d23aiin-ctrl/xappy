"""
XAPPY AI Dashboard Endpoints

Statistics and analytics for dashboards.
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
from app.models.near_miss import NearMissDetails, NearMissCategory
from app.models.user import User
from app.api.v1.deps import get_current_active_user, require_supervisor, require_hse

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
    """Supervisor dashboard stats"""
    total_reports_today: StatCard
    pending_acknowledgment: StatCard
    near_miss_this_week: StatCard
    incidents_this_month: StatCard
    reports_by_type: List[CategoryCount]
    recent_reports: List[dict]


class HSEStats(BaseModel):
    """HSE dashboard stats"""
    total_reports_mtd: StatCard
    near_miss_rate: StatCard
    acknowledgment_rate: StatCard
    average_close_time: StatCard
    reports_by_category: List[CategoryCount]
    reports_trend: List[TrendData]
    top_locations: List[CategoryCount]


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

    # Near-miss this week
    nm_week_query = select(func.count()).select_from(Report).where(
        and_(
            Report.report_type == ReportType.NEAR_MISS,
            Report.reported_at >= week_start
        )
    )
    if site_filter:
        nm_week_query = nm_week_query.where(Report.site_id == site_filter)
    nm_week = (await db.execute(nm_week_query)).scalar() or 0

    # Incidents this month
    inc_month_query = select(func.count()).select_from(Report).where(
        and_(
            Report.report_type == ReportType.INCIDENT,
            Report.reported_at >= month_start
        )
    )
    if site_filter:
        inc_month_query = inc_month_query.where(Report.site_id == site_filter)
    inc_month = (await db.execute(inc_month_query)).scalar() or 0

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
        near_miss_this_week=StatCard(
            title="Near-Miss This Week",
            value=nm_week,
        ),
        incidents_this_month=StatCard(
            title="Incidents This Month",
            value=inc_month,
        ),
        reports_by_type=reports_by_type,
        recent_reports=recent_reports,
    )


@router.get("/hse/stats", response_model=HSEStats)
async def get_hse_stats(
    site_id: Optional[UUID] = None,
    current_user: User = Depends(require_hse),
    db: AsyncSession = Depends(get_db),
):
    """Get HSE dashboard statistics"""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
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

    # Near-miss count MTD
    nm_mtd_query = select(func.count()).select_from(Report).where(
        and_(
            Report.report_type == ReportType.NEAR_MISS,
            Report.reported_at >= month_start
        )
    )
    if site_id:
        nm_mtd_query = nm_mtd_query.where(Report.site_id == site_id)
    nm_mtd = (await db.execute(nm_mtd_query)).scalar() or 0

    # Acknowledgment rate
    ack_query = select(func.count()).select_from(Report).where(
        and_(
            Report.reported_at >= month_start,
            Report.status.in_([
                ReportStatus.ACKNOWLEDGED,
                ReportStatus.UNDER_REVIEW,
                ReportStatus.CLOSED
            ])
        )
    )
    if site_id:
        ack_query = ack_query.where(Report.site_id == site_id)
    ack_count = (await db.execute(ack_query)).scalar() or 0
    ack_rate = round((ack_count / total_mtd * 100) if total_mtd > 0 else 0)

    # Reports by category (for near-miss)
    cat_query = (
        select(NearMissDetails.category, func.count().label("count"))
        .join(Report, Report.id == NearMissDetails.report_id)
        .where(Report.reported_at >= month_start)
        .group_by(NearMissDetails.category)
        .order_by(func.count().desc())
        .limit(10)
    )
    if site_id:
        cat_query = cat_query.where(Report.site_id == site_id)
    cat_result = await db.execute(cat_query)
    reports_by_category = [
        CategoryCount(category=row.category.value, count=row.count)
        for row in cat_result
    ]

    # Trend data (last 30 days)
    trend_data = []
    for i in range(30):
        day = today_start - timedelta(days=29 - i)
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

    return HSEStats(
        total_reports_mtd=StatCard(
            title="Reports MTD",
            value=total_mtd,
            change=total_mtd - total_lm,
            change_period="vs last month",
        ),
        near_miss_rate=StatCard(
            title="Near-Miss Reports",
            value=nm_mtd,
        ),
        acknowledgment_rate=StatCard(
            title="Acknowledgment Rate",
            value=ack_rate,
            change_period="% of reports",
        ),
        average_close_time=StatCard(
            title="Avg Close Time",
            value=48,  # TODO: Calculate actual
            change_period="hours",
        ),
        reports_by_category=reports_by_category,
        reports_trend=trend_data,
        top_locations=[],  # TODO: Implement
    )


@router.get("/hse/trends", response_model=TrendResponse)
async def get_hse_trends(
    days: int = Query(30, ge=7, le=365),
    site_id: Optional[UUID] = None,
    current_user: User = Depends(require_hse),
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
