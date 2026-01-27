"""
Comprehensive seed data script for XAPPY AI Oil & Gas Compliance Platform
"""
import asyncio
import sys
import random
from pathlib import Path
from datetime import datetime, timedelta, timezone
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.db.session import AsyncSessionLocal, engine, Base
from app.models.user import User, UserRole, UserStatus
from app.models.site import Site, SiteType, Area, HazardClassification
from app.models.report import Report, ReportType, ReportStatus
from app.models.near_miss import NearMissDetails, NearMissCategory, PotentialSeverity
from app.core.security import get_password_hash


async def create_tables():
    """Create all database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Database tables created")


async def clear_data(db: AsyncSession):
    """Clear existing data"""
    await db.execute(text("TRUNCATE users, sites, areas, reports CASCADE"))
    await db.commit()
    print("✓ Cleared existing data")


async def seed_data(db: AsyncSession):
    """Seed comprehensive demo data"""

    now = datetime.now(timezone.utc)

    # ============================================================
    # SITES - Multiple Oil & Gas facilities
    # ============================================================
    sites = {}
    sites_data = [
        {
            "code": "MR-001",
            "name": "Mumbai Refinery",
            "site_type": SiteType.REFINERY,
            "address": "Mahul Industrial Area, Chembur",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "operating_company": "XAPPY Petrochemicals Ltd",
            "coordinates": {"lat": 19.0176, "lng": 72.9562},
            "employee_count": 850,
            "contractor_count": 320,
        },
        {
            "code": "JP-002",
            "name": "Jamnagar Processing Plant",
            "site_type": SiteType.PROCESSING_PLANT,
            "address": "GIDC Industrial Estate",
            "city": "Jamnagar",
            "state": "Gujarat",
            "country": "India",
            "operating_company": "XAPPY Petrochemicals Ltd",
            "coordinates": {"lat": 22.4707, "lng": 70.0577},
            "employee_count": 620,
            "contractor_count": 180,
        },
        {
            "code": "BH-003",
            "name": "Bombay High Offshore Platform",
            "site_type": SiteType.OFFSHORE_PLATFORM,
            "address": "Arabian Sea, 160km west of Mumbai",
            "city": "Offshore",
            "state": "Maharashtra",
            "country": "India",
            "operating_company": "XAPPY Offshore Operations",
            "coordinates": {"lat": 19.3833, "lng": 71.3667},
            "employee_count": 120,
            "contractor_count": 45,
        },
    ]

    for site_data in sites_data:
        site = Site(id=uuid4(), **site_data)
        db.add(site)
        sites[site_data["code"]] = site
    await db.flush()
    print(f"✓ Created {len(sites)} sites")

    # ============================================================
    # AREAS - Multiple zones per site
    # ============================================================
    areas = {}
    areas_data = [
        # Mumbai Refinery Areas
        {"site": "MR-001", "code": "CDU-1", "name": "Crude Distillation Unit 1", "hazard": HazardClassification.ZONE_1},
        {"site": "MR-001", "code": "CDU-2", "name": "Crude Distillation Unit 2", "hazard": HazardClassification.ZONE_1},
        {"site": "MR-001", "code": "FCC", "name": "Fluid Catalytic Cracker", "hazard": HazardClassification.ZONE_0},
        {"site": "MR-001", "code": "HDS", "name": "Hydrodesulfurization Unit", "hazard": HazardClassification.ZONE_1},
        {"site": "MR-001", "code": "TANK-FARM", "name": "Tank Farm Area", "hazard": HazardClassification.ZONE_2},
        {"site": "MR-001", "code": "LOADING", "name": "Loading & Dispatch Bay", "hazard": HazardClassification.ZONE_2},
        {"site": "MR-001", "code": "WORKSHOP", "name": "Maintenance Workshop", "hazard": HazardClassification.SAFE},
        {"site": "MR-001", "code": "ADMIN", "name": "Administration Building", "hazard": HazardClassification.SAFE},
        {"site": "MR-001", "code": "CONTROL", "name": "Central Control Room", "hazard": HazardClassification.SAFE},
        # Jamnagar Areas
        {"site": "JP-002", "code": "PROC-A", "name": "Processing Unit A", "hazard": HazardClassification.ZONE_1},
        {"site": "JP-002", "code": "PROC-B", "name": "Processing Unit B", "hazard": HazardClassification.ZONE_1},
        {"site": "JP-002", "code": "STORAGE", "name": "Chemical Storage", "hazard": HazardClassification.ZONE_2},
        {"site": "JP-002", "code": "UTILITY", "name": "Utility Block", "hazard": HazardClassification.SAFE},
        # Offshore Platform Areas
        {"site": "BH-003", "code": "WELLHEAD", "name": "Wellhead Platform", "hazard": HazardClassification.ZONE_0},
        {"site": "BH-003", "code": "PROCESS", "name": "Process Deck", "hazard": HazardClassification.ZONE_1},
        {"site": "BH-003", "code": "LIVING", "name": "Living Quarters", "hazard": HazardClassification.SAFE},
        {"site": "BH-003", "code": "HELIDECK", "name": "Helideck", "hazard": HazardClassification.ZONE_2},
    ]

    for area_data in areas_data:
        site = sites[area_data["site"]]
        area = Area(
            id=uuid4(),
            site_id=site.id,
            code=area_data["code"],
            name=area_data["name"],
            hazard_classification=area_data["hazard"],
        )
        db.add(area)
        areas[f"{area_data['site']}-{area_data['code']}"] = area
    await db.flush()
    print(f"✓ Created {len(areas)} areas")

    # ============================================================
    # USERS - Realistic workforce
    # ============================================================
    users = {}
    users_data = [
        # Super Admin
        ("ADMIN001", "Vikram Mehta", UserRole.SUPER_ADMIN, None, "IT", "System Administrator", None),

        # Mumbai Refinery Staff
        ("HSE001", "Rajesh Sharma", UserRole.HSE_MANAGER, "MR-001", "HSE", "HSE Manager", None),
        ("HSE002", "Priya Desai", UserRole.HSE_OFFICER, "MR-001", "HSE", "HSE Officer", None),
        ("SUP001", "Amit Kumar", UserRole.SUPERVISOR, "MR-001", "Operations", "Shift Supervisor - CDU", None),
        ("SUP002", "Suresh Patil", UserRole.SUPERVISOR, "MR-001", "Operations", "Shift Supervisor - FCC", None),
        ("SUP003", "Manoj Verma", UserRole.SUPERVISOR, "MR-001", "Maintenance", "Maintenance Supervisor", None),
        ("WRK001", "Ramesh Singh", UserRole.WORKER, "MR-001", "Operations", "Panel Operator", None),
        ("WRK002", "Ajay Yadav", UserRole.WORKER, "MR-001", "Operations", "Field Operator", None),
        ("WRK003", "Sanjay Gupta", UserRole.WORKER, "MR-001", "Operations", "Field Operator", None),
        ("WRK004", "Deepak Sharma", UserRole.WORKER, "MR-001", "Maintenance", "Fitter", None),
        ("WRK005", "Ravi Tiwari", UserRole.WORKER, "MR-001", "Maintenance", "Electrician", None),
        ("CTR001", "Mohammed Khan", UserRole.CONTRACTOR, "MR-001", "Contractor", "Scaffolder", "SafeBuild Contractors"),
        ("CTR002", "Vijay Patel", UserRole.CONTRACTOR, "MR-001", "Contractor", "Welder", "MetalWorks India"),

        # Jamnagar Plant Staff
        ("HSE003", "Anita Joshi", UserRole.HSE_MANAGER, "JP-002", "HSE", "HSE Manager", None),
        ("SUP004", "Kiran Reddy", UserRole.SUPERVISOR, "JP-002", "Operations", "Plant Supervisor", None),
        ("WRK006", "Prakash Nair", UserRole.WORKER, "JP-002", "Operations", "Process Technician", None),
        ("WRK007", "Ganesh Iyer", UserRole.WORKER, "JP-002", "Operations", "Process Technician", None),

        # Offshore Platform Staff
        ("HSE004", "Sunil Menon", UserRole.HSE_OFFICER, "BH-003", "HSE", "Offshore HSE Officer", None),
        ("SUP005", "Arun Nambiar", UserRole.SUPERVISOR, "BH-003", "Operations", "Platform Supervisor", None),
        ("WRK008", "Joseph Thomas", UserRole.WORKER, "BH-003", "Operations", "Derrickman", None),
        ("WRK009", "Peter D'Souza", UserRole.WORKER, "BH-003", "Operations", "Roustabout", None),
    ]

    for i, (badge, name, role, site_code, dept, title, contractor) in enumerate(users_data):
        site_id = sites[site_code].id if site_code else None
        user = User(
            id=uuid4(),
            badge_number=badge,
            full_name=name,
            role=role,
            status=UserStatus.ACTIVE,
            site_id=site_id,
            department=dept,
            job_title=title,
            contractor_company=contractor,
            phone_number=f"+919876543{i:03d}",
            pin_hash=get_password_hash("1234"),
        )
        db.add(user)
        users[badge] = user
    await db.flush()
    print(f"✓ Created {len(users)} users")

    # ============================================================
    # REPORTS - Comprehensive safety reports
    # ============================================================
    reports_data = [
        # Near Miss Reports
        {
            "type": ReportType.NEAR_MISS,
            "title": "Forklift near collision with pedestrian",
            "description": "Forklift operator reversed without checking blind spot. Worker narrowly avoided being struck near Tank Farm entrance. No injuries but potential for serious harm.",
            "status": ReportStatus.SUBMITTED,
            "reporter": "WRK002",
            "site": "MR-001",
            "area": "MR-001-TANK-FARM",
            "source": "whatsapp",
            "hours_ago": 2,
            "nm_category": NearMissCategory.VEHICLE,
            "nm_severity": PotentialSeverity.HIGH,
            "nm_actions": "Area secured, forklift operator briefed on blind spot awareness",
        },
        {
            "type": ReportType.NEAR_MISS,
            "title": "Unsecured scaffold board fell from height",
            "description": "During scaffold erection at CDU-1, an unsecured board fell 8 meters. Area was barricaded but board landed near the exclusion zone boundary.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "CTR001",
            "site": "MR-001",
            "area": "MR-001-CDU-1",
            "source": "whatsapp",
            "hours_ago": 6,
            "nm_category": NearMissCategory.FALLING_OBJECT,
            "nm_severity": PotentialSeverity.CATASTROPHIC,
            "nm_actions": "Work stopped, scaffold inspection ordered, exclusion zone extended",
        },
        {
            "type": ReportType.NEAR_MISS,
            "title": "Gas leak detected at flange connection",
            "description": "Portable gas detector alarmed during routine patrol. Small hydrocarbon leak found at flange joint on product line. Area evacuated, leak isolated within 15 minutes.",
            "status": ReportStatus.UNDER_REVIEW,
            "reporter": "WRK003",
            "site": "MR-001",
            "area": "MR-001-FCC",
            "source": "voice",
            "hours_ago": 18,
            "nm_category": NearMissCategory.GAS_LEAK,
            "nm_severity": PotentialSeverity.CATASTROPHIC,
            "nm_actions": "Area evacuated, ESD activated, flange isolated and repair scheduled",
        },
        {
            "type": ReportType.NEAR_MISS,
            "title": "Dropped object from crane during lift",
            "description": "Lifting sling slipped during equipment lift causing valve assembly to drop 2m. Drop zone was clear but rigging procedure was not followed correctly.",
            "status": ReportStatus.CLOSED,
            "reporter": "SUP003",
            "site": "MR-001",
            "area": "MR-001-HDS",
            "source": "web",
            "hours_ago": 48,
            "nm_category": NearMissCategory.FALLING_OBJECT,
            "nm_severity": PotentialSeverity.HIGH,
            "nm_actions": "Lifting operations suspended, rigging team retrained",
        },
        {
            "type": ReportType.NEAR_MISS,
            "title": "Pressure relief valve near activation",
            "description": "PRV-2034 reached 95% of set pressure during startup. Quick operator response prevented full lift. Root cause being investigated.",
            "status": ReportStatus.SUBMITTED,
            "reporter": "WRK001",
            "site": "MR-001",
            "area": "MR-001-CDU-2",
            "source": "whatsapp",
            "hours_ago": 4,
            "nm_category": NearMissCategory.PRESSURE_RELEASE,
            "nm_severity": PotentialSeverity.HIGH,
            "nm_actions": "Startup procedure paused, pressure brought under control manually",
        },

        # Incidents
        {
            "type": ReportType.INCIDENT,
            "title": "First aid case - minor chemical splash",
            "description": "During sample collection, small amount of caustic solution splashed on operator's glove. Glove prevented skin contact. Employee followed emergency wash procedure as precaution.",
            "status": ReportStatus.CLOSED,
            "reporter": "WRK006",
            "site": "JP-002",
            "area": "JP-002-PROC-A",
            "source": "web",
            "hours_ago": 72,
        },
        {
            "type": ReportType.INCIDENT,
            "title": "Slip and fall on wet surface",
            "description": "Contractor slipped on wet grating near wash station. Minor bruising to knee. Area had been recently cleaned, wet floor signs were in place but not visible from approach direction.",
            "status": ReportStatus.UNDER_REVIEW,
            "reporter": "CTR002",
            "site": "MR-001",
            "area": "MR-001-WORKSHOP",
            "source": "whatsapp",
            "hours_ago": 24,
        },

        # Toolbox Talks
        {
            "type": ReportType.TOOLBOX_TALK,
            "title": "Hot work safety procedures",
            "description": "Pre-shift toolbox talk covering hot work permit requirements, fire watch duties, and emergency response procedures for turnaround activities.",
            "status": ReportStatus.CLOSED,
            "reporter": "SUP001",
            "site": "MR-001",
            "area": "MR-001-CDU-1",
            "source": "web",
            "hours_ago": 8,
        },
        {
            "type": ReportType.TOOLBOX_TALK,
            "title": "Working at heights - harness inspection",
            "description": "Safety briefing on fall protection equipment inspection, proper harness wearing technique, and anchor point selection.",
            "status": ReportStatus.CLOSED,
            "reporter": "SUP002",
            "site": "MR-001",
            "area": "MR-001-FCC",
            "source": "web",
            "hours_ago": 32,
        },
        {
            "type": ReportType.TOOLBOX_TALK,
            "title": "Monsoon safety awareness",
            "description": "Discussion on increased slip hazards, lightning safety, and modified work procedures during monsoon season.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SUP004",
            "site": "JP-002",
            "area": "JP-002-PROC-B",
            "source": "web",
            "hours_ago": 56,
        },
        {
            "type": ReportType.TOOLBOX_TALK,
            "title": "Offshore emergency evacuation drill",
            "description": "Pre-drill briefing covering muster stations, lifeboat assignments, and communication protocols for upcoming emergency drill.",
            "status": ReportStatus.CLOSED,
            "reporter": "SUP005",
            "site": "BH-003",
            "area": "BH-003-LIVING",
            "source": "voice",
            "hours_ago": 12,
        },

        # Shift Handovers
        {
            "type": ReportType.SHIFT_HANDOVER,
            "title": "Day to Night shift handover - CDU Operations",
            "description": "Unit running stable at 85% capacity. Pump P-101A on standby due to seal leak. Turnaround prep work ongoing in Area B. No permit carryovers.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SUP001",
            "site": "MR-001",
            "area": "MR-001-CONTROL",
            "source": "voice",
            "hours_ago": 4,
        },
        {
            "type": ReportType.SHIFT_HANDOVER,
            "title": "Night to Day shift handover - Platform Operations",
            "description": "Production steady at 4,200 bbl/day. Weather deteriorating - 2m swells expected. Helicopter ops may be suspended. All safety systems green.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SUP005",
            "site": "BH-003",
            "area": "BH-003-PROCESS",
            "source": "voice",
            "hours_ago": 16,
        },

        # PTW Evidence
        {
            "type": ReportType.PTW_EVIDENCE,
            "title": "Hot work permit verification - Vessel V-301",
            "description": "Verified gas test results, fire watch in position, fire extinguishers placed. Work area barricaded. Permit HW-2024-0892 active.",
            "status": ReportStatus.CLOSED,
            "reporter": "HSE002",
            "site": "MR-001",
            "area": "MR-001-CDU-1",
            "source": "whatsapp",
            "hours_ago": 10,
        },
        {
            "type": ReportType.PTW_EVIDENCE,
            "title": "Confined space entry authorization - Tank T-204",
            "description": "Atmosphere tested and certified. Rescue team on standby. Communication check completed. Entry permit CSE-2024-0156 issued.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "HSE001",
            "site": "MR-001",
            "area": "MR-001-TANK-FARM",
            "source": "web",
            "hours_ago": 6,
        },

        # LOTO Evidence
        {
            "type": ReportType.LOTO_EVIDENCE,
            "title": "LOTO verification - Pump P-205 maintenance",
            "description": "Energy isolation verified for pump motor and process lines. 3 locks applied - electrical, suction valve, discharge valve. Zero energy verification completed.",
            "status": ReportStatus.CLOSED,
            "reporter": "SUP003",
            "site": "MR-001",
            "area": "MR-001-HDS",
            "source": "whatsapp",
            "hours_ago": 20,
        },

        # Spill Reports
        {
            "type": ReportType.SPILL_REPORT,
            "title": "Minor diesel spill during truck loading",
            "description": "Approximately 5 liters of diesel spilled due to hose disconnect during tanker loading. Spill contained within loading bay bund. Cleanup completed using absorbent materials.",
            "status": ReportStatus.CLOSED,
            "reporter": "WRK002",
            "site": "MR-001",
            "area": "MR-001-LOADING",
            "source": "whatsapp",
            "hours_ago": 36,
        },
        {
            "type": ReportType.SPILL_REPORT,
            "title": "Hydraulic oil leak from crane",
            "description": "Hydraulic line failure on mobile crane caused 20L oil spill on concrete pad. Spill kit deployed immediately. Contaminated soil bagged for disposal.",
            "status": ReportStatus.UNDER_REVIEW,
            "reporter": "CTR001",
            "site": "MR-001",
            "area": "MR-001-WORKSHOP",
            "source": "whatsapp",
            "hours_ago": 28,
        },

        # Inspections
        {
            "type": ReportType.INSPECTION,
            "title": "Weekly fire extinguisher inspection - Admin Block",
            "description": "All 12 extinguishers inspected. FE-08 requires service - pressure gauge in yellow zone. Replacement ordered. All others serviceable.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "HSE002",
            "site": "MR-001",
            "area": "MR-001-ADMIN",
            "source": "web",
            "hours_ago": 48,
        },
        {
            "type": ReportType.INSPECTION,
            "title": "Safety shower and eyewash station test",
            "description": "Monthly test of all emergency showers and eyewash stations in processing area. Unit EW-12 flow rate below standard - maintenance notified.",
            "status": ReportStatus.CLOSED,
            "reporter": "HSE003",
            "site": "JP-002",
            "area": "JP-002-PROC-A",
            "source": "web",
            "hours_ago": 96,
        },
        {
            "type": ReportType.INSPECTION,
            "title": "Scaffold inspection before use",
            "description": "Pre-use inspection of scaffold at Column C-401. All components secure, toe boards in place, access ladder tied off. Green tag issued.",
            "status": ReportStatus.CLOSED,
            "reporter": "SUP003",
            "site": "MR-001",
            "area": "MR-001-CDU-1",
            "source": "whatsapp",
            "hours_ago": 14,
        },
        {
            "type": ReportType.INSPECTION,
            "title": "Lifeboat readiness check",
            "description": "Weekly lifeboat inspection completed. All equipment present, engine started successfully, provisions within date. Ready for deployment.",
            "status": ReportStatus.CLOSED,
            "reporter": "HSE004",
            "site": "BH-003",
            "area": "BH-003-LIVING",
            "source": "web",
            "hours_ago": 72,
        },

        # Daily Safety Logs
        {
            "type": ReportType.DAILY_SAFETY_LOG,
            "title": "Daily safety log - Mumbai Refinery",
            "description": "No LTI. 2 near misses reported. 4 PTW issued. 156 personnel on site. Weather: Clear, 32C. All safety systems operational.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "HSE001",
            "site": "MR-001",
            "area": "MR-001-CONTROL",
            "source": "web",
            "hours_ago": 24,
        },
        {
            "type": ReportType.DAILY_SAFETY_LOG,
            "title": "Daily safety log - Offshore Platform",
            "description": "No incidents. Helicopter ops normal. POB: 87. Sea state: Moderate. Flaring ongoing due to compressor maintenance.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "HSE004",
            "site": "BH-003",
            "area": "BH-003-PROCESS",
            "source": "web",
            "hours_ago": 24,
        },
    ]

    type_codes = {
        ReportType.NEAR_MISS: "NM",
        ReportType.INCIDENT: "IN",
        ReportType.TOOLBOX_TALK: "TT",
        ReportType.SHIFT_HANDOVER: "SH",
        ReportType.PTW_EVIDENCE: "PW",
        ReportType.LOTO_EVIDENCE: "LO",
        ReportType.SPILL_REPORT: "SP",
        ReportType.INSPECTION: "IS",
        ReportType.DAILY_SAFETY_LOG: "DL",
    }

    type_counters = {t: 0 for t in ReportType}

    for report_data in reports_data:
        rtype = report_data["type"]
        type_counters[rtype] += 1
        type_code = type_codes[rtype]
        reported_at = now - timedelta(hours=report_data["hours_ago"])

        report_id = uuid4()
        report = Report(
            id=report_id,
            reference_number=f"XP-{type_code}-{reported_at.strftime('%Y%m%d')}-{type_counters[rtype]:04d}",
            report_type=rtype,
            title=report_data["title"],
            description=report_data["description"],
            status=report_data["status"],
            reporter_id=users[report_data["reporter"]].id,
            site_id=sites[report_data["site"]].id,
            area_id=areas[report_data["area"]].id,
            location_description=areas[report_data["area"]].name,
            source=report_data["source"],
            reported_at=reported_at,
            occurred_at=reported_at - timedelta(minutes=random.randint(5, 60)),
        )
        db.add(report)

        # Create NearMissDetails for near-miss reports
        if rtype == ReportType.NEAR_MISS:
            near_miss_detail = NearMissDetails(
                report_id=report_id,
                category=report_data.get("nm_category", NearMissCategory.OTHER),
                potential_severity=report_data.get("nm_severity", PotentialSeverity.MEDIUM),
                immediate_actions_taken=report_data.get("nm_actions"),
                people_in_area=random.randint(2, 10),
            )
            db.add(near_miss_detail)

    await db.commit()
    print(f"✓ Created {len(reports_data)} reports (with detail records)")

    # Print summary
    print("\n📊 Data Summary:")
    print(f"   Sites: {len(sites)}")
    print(f"   Areas: {len(areas)}")
    print(f"   Users: {len(users)}")
    print(f"   Reports: {len(reports_data)}")
    for rtype, count in type_counters.items():
        if count > 0:
            print(f"      - {rtype.value}: {count}")


async def main():
    print("\n🌱 XAPPY AI - Seeding Comprehensive Demo Data\n")
    await create_tables()

    async with AsyncSessionLocal() as db:
        await clear_data(db)
        await seed_data(db)

    print("\n✅ Database seeding completed!")
    print("\n📝 Demo Credentials (PIN: 1234 for all):")
    print("   ┌─────────────┬─────────────────────┬──────────────────┐")
    print("   │ Badge       │ Name                │ Role             │")
    print("   ├─────────────┼─────────────────────┼──────────────────┤")
    print("   │ SUP001      │ Amit Kumar          │ Supervisor       │")
    print("   │ HSE001      │ Rajesh Sharma       │ HSE Manager      │")
    print("   │ HSE002      │ Priya Desai         │ HSE Officer      │")
    print("   │ WRK001      │ Ramesh Singh        │ Worker           │")
    print("   │ ADMIN001    │ Vikram Mehta        │ Super Admin      │")
    print("   └─────────────┴─────────────────────┴──────────────────┘")
    print("")


if __name__ == "__main__":
    asyncio.run(main())
