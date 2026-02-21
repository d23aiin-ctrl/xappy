import asyncio
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from datetime import datetime, timezone, date, timedelta

from sqlalchemy import select, func

from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole, UserStatus
from app.models.site import Site, SiteType, Area, HazardClassification
from app.models.report import Report, ReportType, ReportStatus, REPORT_TYPE_PREFIX
from app.models.near_miss import NearMissDetails, NearMissCategory, PotentialSeverity
from app.models.incident import IncidentDetails, IncidentType, SeverityLevel
from app.models.spill_report import SpillReportDetails, SpillType
from app.models.inspection import InspectionDetails, InspectionType
from app.models.ptw_evidence import PTWEvidenceDetails, PTWType
from app.models.loto_evidence import LOTOEvidenceDetails
from app.models.toolbox_talk import ToolboxTalkDetails
from app.models.shift_handover import ShiftHandoverDetails
from app.models.audit_trail import AuditAction
from app.core.security import get_password_hash
from app.services.audit import create_audit_entry


async def main() -> None:
    async with AsyncSessionLocal() as db:
        site = await get_or_create_site(db)
        area = await get_or_create_area(db, site)
        supervisor = await get_or_create_user(
            db,
            badge_number="SUP001",
            phone_number="+911234567890",
            full_name="Supervisor One",
            role=UserRole.SUPERVISOR,
            site_id=site.id,
        )
        await get_or_create_user(
            db,
            badge_number="HSE001",
            phone_number="+911234567891",
            full_name="HSE Manager One",
            role=UserRole.HSE_MANAGER,
            site_id=site.id,
        )
        await get_or_create_user(
            db,
            badge_number="SUP002",
            phone_number="+911234567892",
            full_name="Supervisor Two",
            role=UserRole.SUPERVISOR,
            site_id=site.id,
        )
        await get_or_create_user(
            db,
            badge_number="HSE002",
            phone_number="+911234567893",
            full_name="HSE Officer Two",
            role=UserRole.HSE_OFFICER,
            site_id=site.id,
        )
        await get_or_create_user(
            db,
            badge_number="WRK001",
            phone_number="+911234567894",
            full_name="Worker One",
            role=UserRole.WORKER,
            site_id=site.id,
        )
        await get_or_create_user(
            db,
            badge_number="WRK002",
            phone_number="+911234567895",
            full_name="Worker Two",
            role=UserRole.WORKER,
            site_id=site.id,
        )

        reports_count = await db.execute(select(func.count()).select_from(Report))
        if (reports_count.scalar() or 0) > 0:
            print("Reports already exist. Skipping report seeding.")
            await db.commit()
            return

        today = datetime.now(timezone.utc)
        await seed_reports(db, supervisor, area, today)
        await db.commit()
        print("Created demo users and sample reports.")


async def get_or_create_site(db: AsyncSessionLocal) -> Site:
    result = await db.execute(select(Site).where(Site.code == "PLANT-001"))
    site = result.scalar_one_or_none()
    if site:
        return site
    site = Site(
        code="PLANT-001",
        name="Xappy Demo Plant",
        site_type=SiteType.REFINERY,
        country="India",
        operating_company="Xappy Energy",
        is_active=True,
    )
    db.add(site)
    await db.flush()
    return site


async def get_or_create_area(db: AsyncSessionLocal, site: Site) -> Area:
    result = await db.execute(
        select(Area).where(Area.site_id == site.id, Area.code == "AREA-01")
    )
    area = result.scalar_one_or_none()
    if area:
        return area
    area = Area(
        site_id=site.id,
        code="AREA-01",
        name="Unit 1 Processing",
        hazard_classification=HazardClassification.ZONE_1,
        is_active=True,
    )
    db.add(area)
    await db.flush()
    return area


async def get_or_create_user(
    db: AsyncSessionLocal,
    badge_number: str,
    phone_number: str,
    full_name: str,
    role: UserRole,
    site_id,
) -> User:
    result = await db.execute(select(User).where(User.badge_number == badge_number))
    user = result.scalar_one_or_none()
    if user:
        return user
    user = User(
        badge_number=badge_number,
        phone_number=phone_number,
        full_name=full_name,
        role=role,
        status=UserStatus.ACTIVE,
        pin_hash=get_password_hash("1234"),
        phone_verified=True,
        site_id=site_id,
    )
    db.add(user)
    await db.flush()
    return user


def reference_number(report_type: ReportType, date_value: datetime, sequence: int) -> str:
    date_str = date_value.strftime("%Y%m%d")
    prefix = REPORT_TYPE_PREFIX[report_type]
    return f"XP-{prefix}-{date_str}-{sequence:04d}"


async def seed_reports(
    db: AsyncSessionLocal,
    reporter: User,
    area: Area,
    today: datetime,
) -> None:
    sequence = 1

    def next_ref(rtype: ReportType) -> str:
        nonlocal sequence
        value = reference_number(rtype, today, sequence)
        sequence += 1
        return value

    report = await create_report(
        db,
        reporter,
        area,
        today - timedelta(hours=2),
        ReportType.NEAR_MISS,
        "Forklift near miss",
        "Forklift nearly struck a pallet during maneuvering.",
        "Warehouse Bay 3",
        NearMissDetails(
            category=NearMissCategory.VEHICLE,
            potential_severity=PotentialSeverity.MEDIUM,
            immediate_actions_taken="Area cleared and spotter assigned.",
        ),
        "Seed near-miss report",
    )
    report.status = ReportStatus.ACKNOWLEDGED
    report.acknowledged_at = today - timedelta(hours=1)
    await create_audit_entry(
        db=db,
        report=report,
        action=AuditAction.ACKNOWLEDGED,
        actor=reporter,
        field_changed="status",
        old_value={"status": ReportStatus.SUBMITTED.value},
        new_value={"status": ReportStatus.ACKNOWLEDGED.value},
        notes="Acknowledged in seed data",
        source=report.source,
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(days=1, hours=3),
        ReportType.NEAR_MISS,
        "Dropped object near miss",
        "A tool fell from scaffolding but no one was injured.",
        "Unit 1 scaffolding",
        NearMissDetails(
            category=NearMissCategory.FALLING_OBJECT,
            potential_severity=PotentialSeverity.HIGH,
            immediate_actions_taken="Work stopped and area cordoned off.",
        ),
        "Seed near-miss report 2",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(hours=5),
        ReportType.INCIDENT,
        "Minor slip injury",
        "Technician slipped on wet floor and sustained minor injury.",
        "Pump Room 2",
        IncidentDetails(
            incident_type=IncidentType.INJURY,
            severity_actual=SeverityLevel.FIRST_AID,
            immediate_actions_taken="First aid provided.",
        ),
        "Seed incident report",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(days=2),
        ReportType.INCIDENT,
        "Property damage event",
        "Minor impact caused damage to guard rail.",
        "Loading bay",
        IncidentDetails(
            incident_type=IncidentType.PROPERTY_DAMAGE,
            severity_actual=SeverityLevel.PROPERTY_ONLY,
            immediate_actions_taken="Area secured and damage documented.",
        ),
        "Seed incident report 2",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(hours=3),
        ReportType.SPILL_REPORT,
        "Diesel spill",
        "Small diesel spill during refueling.",
        "Tank Farm",
        SpillReportDetails(
            spill_type=SpillType.DIESEL,
            material_name="Diesel Fuel",
            contained=True,
            cleanup_initiated=True,
        ),
        "Seed spill report",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(days=3),
        ReportType.SPILL_REPORT,
        "Hydraulic fluid leak",
        "Leak identified during routine checks.",
        "Maintenance bay",
        SpillReportDetails(
            spill_type=SpillType.HYDRAULIC_FLUID,
            material_name="Hydraulic Fluid",
            contained=False,
            cleanup_initiated=False,
        ),
        "Seed spill report 2",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(hours=6),
        ReportType.INSPECTION,
        "Daily walkdown",
        "Routine inspection completed with minor findings.",
        "Unit 1",
        InspectionDetails(
            inspection_type=InspectionType.DAILY_WALKDOWN,
            inspection_date=today.date(),
            summary_notes="Minor housekeeping required.",
        ),
        "Seed inspection report",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(days=4),
        ReportType.INSPECTION,
        "Weekly inspection",
        "Weekly inspection of storage area.",
        "Storage yard",
        InspectionDetails(
            inspection_type=InspectionType.WEEKLY_INSPECTION,
            inspection_date=(today - timedelta(days=4)).date(),
            summary_notes="Follow-up required for signage.",
        ),
        "Seed inspection report 2",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(hours=1),
        ReportType.PTW_EVIDENCE,
        "PTW evidence capture",
        "Permit-to-work evidence logged before job start.",
        "Unit 1",
        PTWEvidenceDetails(
            ptw_number="PTW-1001",
            ptw_type=PTWType.HOT_WORK,
            work_description="Pipe welding work",
            ppe_verified=True,
            crew_briefed=True,
        ),
        "Seed PTW evidence report",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(days=5),
        ReportType.PTW_EVIDENCE,
        "PTW evidence capture",
        "Evidence logged for excavation permit.",
        "North yard",
        PTWEvidenceDetails(
            ptw_number="PTW-1002",
            ptw_type=PTWType.EXCAVATION,
            work_description="Trenching work",
            ppe_verified=False,
            crew_briefed=True,
        ),
        "Seed PTW evidence report 2",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(hours=4),
        ReportType.LOTO_EVIDENCE,
        "LOTO evidence capture",
        "Isolation verification completed.",
        "Compressor Station",
        LOTOEvidenceDetails(
            equipment_name="Compressor C-12",
            zero_energy_confirmed=True,
        ),
        "Seed LOTO evidence report",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(days=6),
        ReportType.LOTO_EVIDENCE,
        "LOTO evidence capture",
        "Isolation verified for maintenance.",
        "Pump Station",
        LOTOEvidenceDetails(
            equipment_name="Pump P-04",
            zero_energy_confirmed=False,
        ),
        "Seed LOTO evidence report 2",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(hours=7),
        ReportType.TOOLBOX_TALK,
        "Toolbox talk",
        "Safety briefing on confined space entry.",
        "Workshop",
        ToolboxTalkDetails(
            topic="Confined Space Safety",
            meeting_time=today - timedelta(hours=7),
            duration_minutes=20,
            attendee_count=12,
        ),
        "Seed toolbox talk report",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(days=7),
        ReportType.TOOLBOX_TALK,
        "Toolbox talk",
        "Briefing on housekeeping expectations.",
        "Warehouse",
        ToolboxTalkDetails(
            topic="Housekeeping",
            meeting_time=today - timedelta(days=7),
            duration_minutes=15,
            attendee_count=10,
        ),
        "Seed toolbox talk report 2",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(hours=8),
        ReportType.SHIFT_HANDOVER,
        "Shift handover",
        "End-of-shift summary logged.",
        "Control Room",
        ShiftHandoverDetails(
            outgoing_shift="A",
            incoming_shift="B",
            handover_time=today - timedelta(hours=8),
            safety_status_summary="All operations stable.",
        ),
        "Seed shift handover report",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(days=8),
        ReportType.SHIFT_HANDOVER,
        "Shift handover",
        "Night shift summary recorded.",
        "Control Room",
        ShiftHandoverDetails(
            outgoing_shift="C",
            incoming_shift="D",
            handover_time=today - timedelta(days=8),
            safety_status_summary="Routine operations.",
        ),
        "Seed shift handover report 2",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(hours=9),
        ReportType.DAILY_SAFETY_LOG,
        "Daily safety log",
        "Observed housekeeping issues near dock.",
        "Dock Area",
        None,
        "Seed daily safety log",
    )

    await create_report(
        db,
        reporter,
        area,
        today - timedelta(days=9),
        ReportType.DAILY_SAFETY_LOG,
        "Daily safety log",
        "PPE reminders issued during morning round.",
        "Gate 2",
        None,
        "Seed daily safety log 2",
    )


async def create_report(
    db: AsyncSessionLocal,
    reporter: User,
    area: Area,
    occurred_at: datetime,
    report_type: ReportType,
    title: str,
    description: str,
    location: str,
    details,
    audit_note: str,
) -> Report:
    report = Report(
        reference_number=reference_number(report_type, occurred_at, int(occurred_at.timestamp()) % 10000),
        report_type=report_type,
        reporter_id=reporter.id,
        site_id=area.site_id,
        area_id=area.id,
        title=title,
        description=description,
        location_description=location,
        occurred_at=occurred_at,
        reported_at=occurred_at,
        submitted_at=occurred_at,
        status=ReportStatus.SUBMITTED,
        source="web",
    )
    db.add(report)
    await db.flush()
    if details is not None:
        details.report_id = report.id
        db.add(details)
    await create_audit_entry(
        db=db,
        report=report,
        action=AuditAction.SUBMITTED,
        actor=reporter,
        field_changed="status",
        old_value=None,
        new_value={"status": report.status.value},
        notes=audit_note,
        source=report.source,
    )
    return report


if __name__ == "__main__":
    asyncio.run(main())
