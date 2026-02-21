"""
Comprehensive seed data script for XAPPY Property Development Platform
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
from app.models.site import Site, SiteType, Area, AreaClassification
from app.models.report import Report, ReportType, ReportStatus
from app.models.construction_progress import ConstructionProgressDetails, ProgressStatus, WeatherCondition
from app.models.defect_report import DefectReportDetails, DefectCategory, DefectPriority, DefectStatus
from app.models.incident import IncidentDetails, IncidentType, SeverityLevel
from app.models.inspection import InspectionDetails, InspectionType
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
    # SITES - Property Development Projects
    # ============================================================
    sites = {}
    sites_data = [
        {
            "code": "SKY-001",
            "name": "Skyline Towers",
            "site_type": SiteType.RESIDENTIAL_SOCIETY,
            "address": "Plot 45, Sector 15, Gurugram",
            "city": "Gurugram",
            "state": "Haryana",
            "country": "India",
            "developer_name": "Xappy Developers Pvt Ltd",
            "rera_number": "RERA-HR-GGN-2024-0892",
            "coordinates": {"lat": 28.4595, "lng": 77.0266},
            "total_units": 450,
            "total_floors": 35,
            "total_towers": 3,
            "employee_count": 45,
            "contractor_count": 156,
        },
        {
            "code": "MBP-002",
            "name": "Metro Business Park",
            "site_type": SiteType.COMMERCIAL_OFFICE,
            "address": "IT Park Road, Whitefield",
            "city": "Bangalore",
            "state": "Karnataka",
            "country": "India",
            "developer_name": "Xappy Commercial Ltd",
            "rera_number": "RERA-KA-BLR-2024-1456",
            "coordinates": {"lat": 12.9698, "lng": 77.7500},
            "total_units": 120,
            "total_floors": 18,
            "total_towers": 2,
            "employee_count": 28,
            "contractor_count": 89,
        },
        {
            "code": "PLM-003",
            "name": "Palm Villas",
            "site_type": SiteType.RESIDENTIAL_VILLA,
            "address": "Off Bannerghatta Road",
            "city": "Bangalore",
            "state": "Karnataka",
            "country": "India",
            "developer_name": "Xappy Premium Homes",
            "rera_number": "RERA-KA-BLR-2024-0678",
            "coordinates": {"lat": 12.8698, "lng": 77.5946},
            "total_units": 24,
            "total_floors": 3,
            "total_towers": 0,
            "employee_count": 12,
            "contractor_count": 34,
        },
        {
            "code": "CTM-004",
            "name": "Central Mall",
            "site_type": SiteType.COMMERCIAL_MALL,
            "address": "Ring Road, Rajouri Garden",
            "city": "New Delhi",
            "state": "Delhi",
            "country": "India",
            "developer_name": "Xappy Retail Spaces",
            "rera_number": "RERA-DL-2024-2341",
            "coordinates": {"lat": 28.6448, "lng": 77.1198},
            "total_units": 85,
            "total_floors": 6,
            "total_towers": 1,
            "employee_count": 35,
            "contractor_count": 112,
        },
    ]

    for site_data in sites_data:
        site = Site(id=uuid4(), **site_data)
        db.add(site)
        sites[site_data["code"]] = site
    await db.flush()
    print(f"✓ Created {len(sites)} sites")

    # ============================================================
    # AREAS - Building blocks, floors, amenities
    # ============================================================
    areas = {}
    areas_data = [
        # Skyline Towers Areas
        {"site": "SKY-001", "code": "TWR-A", "name": "Tower A", "classification": AreaClassification.RESIDENTIAL},
        {"site": "SKY-001", "code": "TWR-B", "name": "Tower B", "classification": AreaClassification.RESIDENTIAL},
        {"site": "SKY-001", "code": "TWR-C", "name": "Tower C", "classification": AreaClassification.RESIDENTIAL},
        {"site": "SKY-001", "code": "PODIUM", "name": "Podium Level", "classification": AreaClassification.AMENITY},
        {"site": "SKY-001", "code": "BSMT-1", "name": "Basement 1 - Parking", "classification": AreaClassification.PARKING},
        {"site": "SKY-001", "code": "BSMT-2", "name": "Basement 2 - Parking", "classification": AreaClassification.PARKING},
        {"site": "SKY-001", "code": "CLUB", "name": "Clubhouse", "classification": AreaClassification.AMENITY},
        {"site": "SKY-001", "code": "POOL", "name": "Swimming Pool Area", "classification": AreaClassification.AMENITY},
        {"site": "SKY-001", "code": "LAND", "name": "Landscaping & Gardens", "classification": AreaClassification.EXTERNAL},

        # Metro Business Park Areas
        {"site": "MBP-002", "code": "BLK-A", "name": "Block A - IT Offices", "classification": AreaClassification.COMMERCIAL},
        {"site": "MBP-002", "code": "BLK-B", "name": "Block B - Corporate HQ", "classification": AreaClassification.COMMERCIAL},
        {"site": "MBP-002", "code": "FOOD", "name": "Food Court", "classification": AreaClassification.AMENITY},
        {"site": "MBP-002", "code": "PARK", "name": "Multi-level Parking", "classification": AreaClassification.PARKING},
        {"site": "MBP-002", "code": "LOBBY", "name": "Main Lobby", "classification": AreaClassification.COMMERCIAL},

        # Palm Villas Areas
        {"site": "PLM-003", "code": "ROW-A", "name": "Villa Row A (1-8)", "classification": AreaClassification.RESIDENTIAL},
        {"site": "PLM-003", "code": "ROW-B", "name": "Villa Row B (9-16)", "classification": AreaClassification.RESIDENTIAL},
        {"site": "PLM-003", "code": "ROW-C", "name": "Villa Row C (17-24)", "classification": AreaClassification.RESIDENTIAL},
        {"site": "PLM-003", "code": "COMMON", "name": "Common Area & Streets", "classification": AreaClassification.EXTERNAL},

        # Central Mall Areas
        {"site": "CTM-004", "code": "GF", "name": "Ground Floor - Retail", "classification": AreaClassification.COMMERCIAL},
        {"site": "CTM-004", "code": "FF", "name": "First Floor - Fashion", "classification": AreaClassification.COMMERCIAL},
        {"site": "CTM-004", "code": "SF", "name": "Second Floor - Electronics", "classification": AreaClassification.COMMERCIAL},
        {"site": "CTM-004", "code": "TF", "name": "Third Floor - Food Court", "classification": AreaClassification.AMENITY},
        {"site": "CTM-004", "code": "MULTI", "name": "Multiplex Level", "classification": AreaClassification.AMENITY},
        {"site": "CTM-004", "code": "BSMT", "name": "Basement Parking", "classification": AreaClassification.PARKING},
    ]

    for area_data in areas_data:
        site = sites[area_data["site"]]
        area = Area(
            id=uuid4(),
            site_id=site.id,
            code=area_data["code"],
            name=area_data["name"],
            area_classification=area_data["classification"],
        )
        db.add(area)
        areas[f"{area_data['site']}-{area_data['code']}"] = area
    await db.flush()
    print(f"✓ Created {len(areas)} areas")

    # ============================================================
    # USERS - Property Development Workforce
    # ============================================================
    users = {}
    users_data = [
        # Super Admin
        ("ADMIN001", "Vikram Mehta", UserRole.ADMIN, None, "IT", "System Administrator", None),

        # Skyline Towers Staff
        ("PM001", "Rajesh Sharma", UserRole.PROJECT_MANAGER, "SKY-001", "Management", "Project Manager", None),
        ("SM001", "Priya Desai", UserRole.SITE_MANAGER, "SKY-001", "Site Ops", "Site Manager", None),
        ("SUP001", "Amit Kumar", UserRole.SUPERVISOR, "SKY-001", "Construction", "Civil Supervisor - Tower A", None),
        ("SUP002", "Suresh Patil", UserRole.SUPERVISOR, "SKY-001", "Construction", "Civil Supervisor - Tower B", None),
        ("SUP003", "Manoj Verma", UserRole.SUPERVISOR, "SKY-001", "MEP", "MEP Supervisor", None),
        ("QI001", "Anita Joshi", UserRole.QUALITY_INSPECTOR, "SKY-001", "Quality", "Quality Inspector", None),
        ("SO001", "Kiran Reddy", UserRole.SAFETY_OFFICER, "SKY-001", "Safety", "Safety Officer", None),
        ("ARC001", "Neha Gupta", UserRole.ARCHITECT, "SKY-001", "Design", "Site Architect", None),
        ("WRK001", "Ramesh Singh", UserRole.WORKER, "SKY-001", "Construction", "Mason", None),
        ("WRK002", "Ajay Yadav", UserRole.WORKER, "SKY-001", "Construction", "Carpenter", None),
        ("WRK003", "Sanjay Gupta", UserRole.WORKER, "SKY-001", "MEP", "Plumber", None),
        ("WRK004", "Deepak Sharma", UserRole.WORKER, "SKY-001", "MEP", "Electrician", None),
        ("CTR001", "Mohammed Khan", UserRole.CONTRACTOR, "SKY-001", "Contractor", "Waterproofing Specialist", "AquaShield Contractors"),
        ("CTR002", "Vijay Patel", UserRole.CONTRACTOR, "SKY-001", "Contractor", "Painting Contractor", "ColorTech Paints"),

        # Metro Business Park Staff
        ("PM002", "Sunita Nair", UserRole.PROJECT_MANAGER, "MBP-002", "Management", "Project Manager", None),
        ("SM002", "Arun Menon", UserRole.SITE_MANAGER, "MBP-002", "Site Ops", "Site Manager", None),
        ("SUP004", "Prakash Iyer", UserRole.SUPERVISOR, "MBP-002", "Construction", "Structural Supervisor", None),
        ("QI002", "Meera Krishnan", UserRole.QUALITY_INSPECTOR, "MBP-002", "Quality", "Quality Inspector", None),
        ("WRK005", "Ganesh Nambiar", UserRole.WORKER, "MBP-002", "Construction", "Steel Fixer", None),
        ("WRK006", "Joseph Thomas", UserRole.WORKER, "MBP-002", "MEP", "HVAC Technician", None),

        # Palm Villas Staff
        ("SM003", "Ravi Tiwari", UserRole.SITE_MANAGER, "PLM-003", "Site Ops", "Site Manager", None),
        ("SUP005", "Peter D'Souza", UserRole.SUPERVISOR, "PLM-003", "Construction", "Villa Supervisor", None),
        ("WRK007", "John Fernandes", UserRole.WORKER, "PLM-003", "Finishing", "Interior Worker", None),

        # Central Mall Staff
        ("PM003", "Anil Kapoor", UserRole.PROJECT_MANAGER, "CTM-004", "Management", "Project Manager", None),
        ("SM004", "Seema Malhotra", UserRole.SITE_MANAGER, "CTM-004", "Site Ops", "Site Manager", None),
        ("SUP006", "Rohit Saxena", UserRole.SUPERVISOR, "CTM-004", "Construction", "Finishing Supervisor", None),
        ("SO002", "Kavita Sharma", UserRole.SAFETY_OFFICER, "CTM-004", "Safety", "Safety Officer", None),
        ("WRK008", "Mohan Das", UserRole.WORKER, "CTM-004", "MEP", "Fire Safety Technician", None),
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
    # REPORTS - Property Development Reports
    # ============================================================
    reports_data = [
        # Construction Progress Reports
        {
            "type": ReportType.CONSTRUCTION_PROGRESS,
            "title": "Tower A - 15th Floor Slab Casting Complete",
            "description": "Completed RCC slab casting for 15th floor. Achieved 100% of planned pour. Curing started. Column marking for 16th floor in progress.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SUP001",
            "site": "SKY-001",
            "area": "SKY-001-TWR-A",
            "source": "web",
            "hours_ago": 4,
            "progress": {"building_block": "Tower A", "floor_level": "15th Floor", "planned": 100, "actual": 100, "workers": 45, "weather": "sunny", "status": "on_schedule"},
        },
        {
            "type": ReportType.CONSTRUCTION_PROGRESS,
            "title": "Tower B - MEP Rough-in 8th-10th Floor",
            "description": "Electrical conduit and plumbing rough-in work ongoing. 85% complete for 8th floor, 60% for 9th, started 10th floor.",
            "status": ReportStatus.SUBMITTED,
            "reporter": "SUP003",
            "site": "SKY-001",
            "area": "SKY-001-TWR-B",
            "source": "web",
            "hours_ago": 6,
            "progress": {"building_block": "Tower B", "floor_level": "8th-10th Floor", "planned": 80, "actual": 72, "workers": 28, "weather": "cloudy", "delays": "Waiting for electrical panels delivery", "status": "delayed"},
        },
        {
            "type": ReportType.CONSTRUCTION_PROGRESS,
            "title": "Podium - Waterproofing Work",
            "description": "Waterproofing membrane application on podium deck. 70% coverage achieved. Work progressing well ahead of schedule.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "CTR001",
            "site": "SKY-001",
            "area": "SKY-001-PODIUM",
            "source": "mobile",
            "hours_ago": 8,
            "progress": {"building_block": "Podium", "floor_level": "Deck Level", "planned": 60, "actual": 70, "workers": 12, "weather": "sunny", "status": "ahead"},
        },
        {
            "type": ReportType.CONSTRUCTION_PROGRESS,
            "title": "Block A - Facade Installation Progress",
            "description": "ACP cladding and glazing work on north elevation. Completed 12 floors out of 18. Minor alignment issues being corrected.",
            "status": ReportStatus.UNDER_REVIEW,
            "reporter": "SUP004",
            "site": "MBP-002",
            "area": "MBP-002-BLK-A",
            "source": "web",
            "hours_ago": 12,
            "progress": {"building_block": "Block A", "floor_level": "External Facade", "planned": 75, "actual": 67, "workers": 35, "weather": "windy", "delays": "Wind causing safety concerns for high-rise work", "status": "delayed"},
        },
        {
            "type": ReportType.CONSTRUCTION_PROGRESS,
            "title": "Villa Row A - Interior Finishing",
            "description": "Flooring, painting, and fixture installation for villas 1-4 complete. Villas 5-8 in progress with 60% completion.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SUP005",
            "site": "PLM-003",
            "area": "PLM-003-ROW-A",
            "source": "web",
            "hours_ago": 24,
            "progress": {"building_block": "Row A", "floor_level": "All Floors", "planned": 85, "actual": 80, "workers": 18, "weather": "sunny", "status": "on_schedule"},
        },

        # Defect/Snag Reports
        {
            "type": ReportType.DEFECT_SNAG,
            "title": "Water seepage in Unit A-1201 bathroom",
            "description": "Water seepage observed on bathroom wall near shower area. Appears to be waterproofing failure. Tenant complained of damp patches.",
            "status": ReportStatus.SUBMITTED,
            "reporter": "QI001",
            "site": "SKY-001",
            "area": "SKY-001-TWR-A",
            "source": "mobile",
            "hours_ago": 3,
            "defect": {"category": "waterproofing", "priority": "critical", "status": "open", "block": "Tower A", "unit": "A-1201", "contractor": "AquaShield Contractors", "target_date": 3},
        },
        {
            "type": ReportType.DEFECT_SNAG,
            "title": "Electrical socket not working - Unit B-504",
            "description": "Power outlet in master bedroom not functioning. Checked wiring - appears to be loose connection at DB.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "WRK004",
            "site": "SKY-001",
            "area": "SKY-001-TWR-B",
            "source": "web",
            "hours_ago": 18,
            "defect": {"category": "electrical", "priority": "high", "status": "assigned", "block": "Tower B", "unit": "B-504", "contractor": "PowerTech Electrical", "target_date": 2},
        },
        {
            "type": ReportType.DEFECT_SNAG,
            "title": "Paint peeling in living room - Unit A-803",
            "description": "Emulsion paint peeling off near window frame. Likely moisture ingress from window seal.",
            "status": ReportStatus.UNDER_REVIEW,
            "reporter": "QI001",
            "site": "SKY-001",
            "area": "SKY-001-TWR-A",
            "source": "mobile",
            "hours_ago": 48,
            "defect": {"category": "finishing", "priority": "medium", "status": "in_progress", "block": "Tower A", "unit": "A-803", "contractor": "ColorTech Paints", "target_date": 7},
        },
        {
            "type": ReportType.DEFECT_SNAG,
            "title": "HVAC not cooling properly - Office 1102",
            "description": "Central AC unit not achieving desired temperature. Thermostat shows 28C despite setting at 22C.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "QI002",
            "site": "MBP-002",
            "area": "MBP-002-BLK-B",
            "source": "web",
            "hours_ago": 24,
            "defect": {"category": "hvac", "priority": "high", "status": "assigned", "block": "Block B", "unit": "Office 1102", "contractor": "CoolAir Systems", "target_date": 1},
        },
        {
            "type": ReportType.DEFECT_SNAG,
            "title": "Floor tile crack - Shop 12",
            "description": "Hairline crack observed in vitrified tile near entrance. Possible subfloor settlement issue.",
            "status": ReportStatus.CLOSED,
            "reporter": "SUP006",
            "site": "CTM-004",
            "area": "CTM-004-GF",
            "source": "web",
            "hours_ago": 72,
            "defect": {"category": "flooring", "priority": "low", "status": "closed", "block": "Ground Floor", "unit": "Shop 12", "contractor": "TileWorks India", "target_date": 0},
        },
        {
            "type": ReportType.DEFECT_SNAG,
            "title": "Door alignment issue - Villa 5",
            "description": "Main entrance door not closing properly. Hinges need adjustment and door frame slightly warped.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "WRK007",
            "site": "PLM-003",
            "area": "PLM-003-ROW-A",
            "source": "mobile",
            "hours_ago": 36,
            "defect": {"category": "carpentry", "priority": "medium", "status": "in_progress", "block": "Row A", "unit": "Villa 5", "contractor": "WoodWorks Inc", "target_date": 5},
        },

        # Safety Incident Reports
        {
            "type": ReportType.SAFETY_INCIDENT,
            "title": "Worker injured - minor scaffolding fall",
            "description": "Worker slipped on wet scaffolding plank and fell 1.5m to lower platform. Minor bruising to leg. First aid administered on site.",
            "status": ReportStatus.UNDER_REVIEW,
            "reporter": "SO001",
            "site": "SKY-001",
            "area": "SKY-001-TWR-A",
            "source": "web",
            "hours_ago": 8,
            "incident": {"type": "fall_from_height", "severity": "first_aid", "injuries": 1, "medical": False},
        },
        {
            "type": ReportType.SAFETY_INCIDENT,
            "title": "Near miss - crane load swing",
            "description": "During material lifting, crane load swung unexpectedly due to wind gust. No injuries but load came close to scaffolding with workers.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SO001",
            "site": "SKY-001",
            "area": "SKY-001-TWR-B",
            "source": "mobile",
            "hours_ago": 28,
            "incident": {"type": "crane_incident", "severity": "property_only", "injuries": 0, "medical": False},
        },
        {
            "type": ReportType.SAFETY_INCIDENT,
            "title": "Material fall from height",
            "description": "Loose brick fell from 8th floor during brickwork. Landed in barricaded area. No injuries as exclusion zone was in place.",
            "status": ReportStatus.CLOSED,
            "reporter": "SUP002",
            "site": "SKY-001",
            "area": "SKY-001-TWR-B",
            "source": "web",
            "hours_ago": 72,
            "incident": {"type": "material_fall", "severity": "property_only", "injuries": 0, "medical": False},
        },

        # Site Inspection Reports
        {
            "type": ReportType.SITE_INSPECTION,
            "title": "Foundation inspection - Tower C",
            "description": "Structural inspection of Tower C foundation before vertical construction. All parameters within acceptable limits. Ready for column erection.",
            "status": ReportStatus.CLOSED,
            "reporter": "QI001",
            "site": "SKY-001",
            "area": "SKY-001-TWR-C",
            "source": "web",
            "hours_ago": 96,
            "inspection": {"type": "foundation_inspection", "condition": "satisfactory", "critical_findings": 0, "findings": 2},
        },
        {
            "type": ReportType.SITE_INSPECTION,
            "title": "MEP inspection - Podium services",
            "description": "Inspection of electrical, plumbing, and fire fighting installations in podium area. Minor observations noted for rectification.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "QI001",
            "site": "SKY-001",
            "area": "SKY-001-PODIUM",
            "source": "web",
            "hours_ago": 48,
            "inspection": {"type": "mep_inspection", "condition": "needs_improvement", "critical_findings": 0, "findings": 5},
        },
        {
            "type": ReportType.SITE_INSPECTION,
            "title": "Pre-handover inspection - Villa 1-4",
            "description": "Final inspection before customer handover. Villas 1 and 2 ready. Villas 3 and 4 need minor touch-ups.",
            "status": ReportStatus.UNDER_REVIEW,
            "reporter": "SM003",
            "site": "PLM-003",
            "area": "PLM-003-ROW-A",
            "source": "web",
            "hours_ago": 24,
            "inspection": {"type": "pre_handover", "condition": "needs_improvement", "critical_findings": 0, "findings": 8},
        },
        {
            "type": ReportType.SITE_INSPECTION,
            "title": "Safety inspection - Mall construction",
            "description": "Weekly safety walkthrough. PPE compliance at 95%. Two safety net gaps identified and flagged for immediate repair.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SO002",
            "site": "CTM-004",
            "area": "CTM-004-MULTI",
            "source": "web",
            "hours_ago": 12,
            "inspection": {"type": "safety_inspection", "condition": "needs_improvement", "critical_findings": 1, "findings": 3},
        },

        # Shift Handovers
        {
            "type": ReportType.SHIFT_HANDOVER,
            "title": "Day shift handover - Tower A construction",
            "description": "15th floor slab curing ongoing. Column rebar work started for 16th floor. 45 workers on site. Concrete pump scheduled for tomorrow morning.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SUP001",
            "site": "SKY-001",
            "area": "SKY-001-TWR-A",
            "source": "web",
            "hours_ago": 6,
        },
        {
            "type": ReportType.SHIFT_HANDOVER,
            "title": "Night shift handover - MEP work",
            "description": "Completed cable pulling for floors 5-7. Fire alarm loop testing scheduled. Material for tomorrow staged at loading bay.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SUP003",
            "site": "SKY-001",
            "area": "SKY-001-TWR-B",
            "source": "mobile",
            "hours_ago": 14,
        },

        # Toolbox Talks
        {
            "type": ReportType.TOOLBOX_TALK,
            "title": "Working at heights safety briefing",
            "description": "Pre-work safety briefing for scaffolding crew. Covered harness inspection, anchor points, and emergency procedures. 12 workers attended.",
            "status": ReportStatus.CLOSED,
            "reporter": "SO001",
            "site": "SKY-001",
            "area": "SKY-001-TWR-A",
            "source": "web",
            "hours_ago": 8,
        },
        {
            "type": ReportType.TOOLBOX_TALK,
            "title": "Electrical safety awareness",
            "description": "Safety talk on electrical hazards during MEP work. LOTO procedures reviewed. All electricians signed attendance.",
            "status": ReportStatus.CLOSED,
            "reporter": "SUP003",
            "site": "SKY-001",
            "area": "SKY-001-TWR-B",
            "source": "web",
            "hours_ago": 32,
        },
        {
            "type": ReportType.TOOLBOX_TALK,
            "title": "Housekeeping and material storage",
            "description": "Briefing on proper material stacking, waste disposal, and keeping walkways clear. Emphasized slip/trip hazards.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SO002",
            "site": "CTM-004",
            "area": "CTM-004-GF",
            "source": "web",
            "hours_ago": 56,
        },

        # Daily Progress Logs
        {
            "type": ReportType.DAILY_PROGRESS_LOG,
            "title": "Daily log - Skyline Towers",
            "description": "Total workers: 156. Progress reports: 3. Defects raised: 2. Safety incidents: 0. Weather: Clear. Major activities: Tower A slab casting, Tower B MEP work.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SM001",
            "site": "SKY-001",
            "area": "SKY-001-TWR-A",
            "source": "web",
            "hours_ago": 24,
        },
        {
            "type": ReportType.DAILY_PROGRESS_LOG,
            "title": "Daily log - Metro Business Park",
            "description": "Total workers: 89. Facade work paused due to wind. Interior finishing ongoing. Material delivery received.",
            "status": ReportStatus.ACKNOWLEDGED,
            "reporter": "SM002",
            "site": "MBP-002",
            "area": "MBP-002-BLK-A",
            "source": "web",
            "hours_ago": 24,
        },
    ]

    type_codes = {
        ReportType.CONSTRUCTION_PROGRESS: "CP",
        ReportType.DEFECT_SNAG: "DS",
        ReportType.SAFETY_INCIDENT: "SI",
        ReportType.SITE_INSPECTION: "IN",
        ReportType.SHIFT_HANDOVER: "SH",
        ReportType.TOOLBOX_TALK: "TT",
        ReportType.DAILY_PROGRESS_LOG: "DL",
    }

    type_counters = {t: 0 for t in ReportType}

    for report_data in reports_data:
        rtype = report_data["type"]
        type_counters[rtype] += 1
        type_code = type_codes.get(rtype, "RP")
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

        # Create detail records based on report type
        if rtype == ReportType.CONSTRUCTION_PROGRESS and "progress" in report_data:
            p = report_data["progress"]
            progress_detail = ConstructionProgressDetails(
                report_id=report_id,
                building_block=p["building_block"],
                floor_level=p["floor_level"],
                planned_progress_percent=p["planned"],
                actual_progress_percent=p["actual"],
                workers_present=p["workers"],
                weather_conditions=WeatherCondition(p["weather"]),
                delays_if_any=p.get("delays"),
                progress_status=ProgressStatus(p["status"]),
            )
            db.add(progress_detail)

        elif rtype == ReportType.DEFECT_SNAG and "defect" in report_data:
            d = report_data["defect"]
            defect_detail = DefectReportDetails(
                report_id=report_id,
                category=DefectCategory(d["category"]),
                priority=DefectPriority(d["priority"]),
                defect_status=DefectStatus(d["status"]),
                building_block=d["block"],
                unit_number=d["unit"],
                contractor_responsible=d["contractor"],
                target_completion_date=now + timedelta(days=d["target_date"]) if d["target_date"] > 0 else now - timedelta(days=1),
            )
            db.add(defect_detail)

        elif rtype == ReportType.SAFETY_INCIDENT and "incident" in report_data:
            inc = report_data["incident"]
            incident_detail = IncidentDetails(
                report_id=report_id,
                incident_type=IncidentType(inc["type"]),
                severity_actual=SeverityLevel(inc["severity"]),
                people_injured=inc.get("injuries", 0),
                medical_attention_required=inc.get("medical", False),
            )
            db.add(incident_detail)

        elif rtype == ReportType.SITE_INSPECTION and "inspection" in report_data:
            insp = report_data["inspection"]
            inspection_detail = InspectionDetails(
                report_id=report_id,
                inspection_type=InspectionType(insp["type"]),
                inspection_date=reported_at.date(),
                overall_condition=insp.get("condition", "satisfactory"),
                critical_findings_count=insp.get("critical_findings", 0),
                findings_count=insp.get("findings", 0),
            )
            db.add(inspection_detail)

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
    print("\n🏗️  XAPPY Property - Seeding Demo Data\n")
    await create_tables()

    async with AsyncSessionLocal() as db:
        await clear_data(db)
        await seed_data(db)

    print("\n✅ Database seeding completed!")
    print("\n📝 Demo Credentials (PIN: 1234 for all):")
    print("   ┌─────────────┬─────────────────────┬──────────────────────┐")
    print("   │ Badge       │ Name                │ Role                 │")
    print("   ├─────────────┼─────────────────────┼──────────────────────┤")
    print("   │ SUP001      │ Amit Kumar          │ Supervisor           │")
    print("   │ PM001       │ Rajesh Sharma       │ Project Manager      │")
    print("   │ SM001       │ Priya Desai         │ Site Manager         │")
    print("   │ QI001       │ Anita Joshi         │ Quality Inspector    │")
    print("   │ SO001       │ Kiran Reddy         │ Safety Officer       │")
    print("   │ WRK001      │ Ramesh Singh        │ Worker               │")
    print("   │ ADMIN001    │ Vikram Mehta        │ Admin                │")
    print("   └─────────────┴─────────────────────┴──────────────────────┘")
    print("")


if __name__ == "__main__":
    asyncio.run(main())
