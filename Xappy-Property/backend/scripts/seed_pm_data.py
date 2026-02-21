"""
Seed script for Xappy Property Management Platform

Populates the database with sample data for property management features.
Run with: cd backend && python -m scripts.seed_pm_data
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.db.session import AsyncSessionLocal, engine, Base
from app.models.user import User, UserRole, UserStatus
from app.models.property import Property, PropertyType, PropertyStatus
from app.models.tenant import Tenant, TenantPipelineStage, TenantStatus
from app.models.compliance import ComplianceRecord, ComplianceType, ComplianceStatus
from app.models.maintenance import MaintenanceIssue, IssueCategory, IssuePriority, IssueStatus
from app.models.supplier import Supplier, SupplierStatus
from app.core.security import get_password_hash


async def seed_pm_users(db: AsyncSession):
    """Create property management users"""
    print("Creating property management users...")

    users_data = [
        {
            "badge_number": "PM001",
            "pin_hash": get_password_hash("1234"),
            "full_name": "Sarah Johnson",
            "email": "sarah@xappy.io",
            "phone_number": "+44 7700 900001",
            "role": UserRole.PROPERTY_MANAGER,
            "status": UserStatus.ACTIVE,
        },
        {
            "badge_number": "LL001",
            "pin_hash": get_password_hash("1234"),
            "full_name": "Michael Brown",
            "email": "michael@landlord.com",
            "phone_number": "+44 7700 900002",
            "role": UserRole.LANDLORD,
            "status": UserStatus.ACTIVE,
        },
        {
            "badge_number": "AG001",
            "pin_hash": get_password_hash("1234"),
            "full_name": "Emily Davis",
            "email": "emily@xappy.io",
            "phone_number": "+44 7700 900003",
            "role": UserRole.AGENT,
            "status": UserStatus.ACTIVE,
        },
        {
            "badge_number": "TN001",
            "pin_hash": get_password_hash("1234"),
            "full_name": "James Wilson",
            "email": "james@tenant.com",
            "phone_number": "+44 7700 900004",
            "role": UserRole.TENANT,
            "status": UserStatus.ACTIVE,
        },
        {
            "badge_number": "SP001",
            "pin_hash": get_password_hash("1234"),
            "full_name": "Dave Williams",
            "email": "dave@plumber.com",
            "phone_number": "+44 7700 900005",
            "role": UserRole.SUPPLIER,
            "status": UserStatus.ACTIVE,
        },
    ]

    created = []
    for data in users_data:
        result = await db.execute(select(User).where(User.badge_number == data["badge_number"]))
        existing = result.scalar_one_or_none()
        if existing:
            created.append(existing)
            print(f"  User {data['badge_number']} already exists")
            continue

        user = User(**data)
        db.add(user)
        created.append(user)
        print(f"  Created user: {data['full_name']} ({data['role'].value})")

    await db.flush()
    return created


async def seed_properties(db: AsyncSession, landlord_id, manager_id):
    """Create sample properties"""
    print("\nCreating properties...")

    properties_data = [
        {
            "reference": "XP-PROP-001",
            "title": "Modern 2 Bed Riverside Apartment",
            "address_line_1": "Flat 12, Riverside Court",
            "address_line_2": "Thames Walk",
            "city": "London",
            "county": "Greater London",
            "postcode": "SW1A 1AA",
            "country": "United Kingdom",
            "property_type": PropertyType.FLAT,
            "bedrooms": 2,
            "bathrooms": 1,
            "reception_rooms": 1,
            "floor_area_sqft": 750,
            "has_parking": False,
            "has_garden": False,
            "has_balcony": True,
            "pets_allowed": False,
            "smoking_allowed": False,
            "is_hmo": False,
            "epc_rating": "B",
            "status": PropertyStatus.LET,
            "rent_amount": Decimal("1850.00"),
            "deposit_amount": Decimal("2135.00"),
            "landlord_id": landlord_id,
            "property_manager_id": manager_id,
        },
        {
            "reference": "XP-PROP-002",
            "title": "Spacious 3 Bed Family Home",
            "address_line_1": "23 Victoria Gardens",
            "city": "Manchester",
            "county": "Greater Manchester",
            "postcode": "M1 2AB",
            "country": "United Kingdom",
            "property_type": PropertyType.HOUSE,
            "bedrooms": 3,
            "bathrooms": 2,
            "reception_rooms": 2,
            "floor_area_sqft": 1200,
            "has_parking": True,
            "has_garden": True,
            "has_balcony": False,
            "pets_allowed": True,
            "smoking_allowed": False,
            "is_hmo": False,
            "epc_rating": "C",
            "status": PropertyStatus.AVAILABLE,
            "rent_amount": Decimal("1450.00"),
            "deposit_amount": Decimal("1675.00"),
            "landlord_id": landlord_id,
            "property_manager_id": manager_id,
        },
        {
            "reference": "XP-PROP-003",
            "title": "Cozy 1 Bed City Centre Flat",
            "address_line_1": "15 Park Lane",
            "address_line_2": "Apartment 4B",
            "city": "Birmingham",
            "county": "West Midlands",
            "postcode": "B1 3CD",
            "country": "United Kingdom",
            "property_type": PropertyType.FLAT,
            "bedrooms": 1,
            "bathrooms": 1,
            "reception_rooms": 1,
            "floor_area_sqft": 550,
            "has_parking": False,
            "has_garden": False,
            "has_balcony": False,
            "pets_allowed": False,
            "smoking_allowed": False,
            "is_hmo": False,
            "epc_rating": "D",
            "status": PropertyStatus.MAINTENANCE,
            "rent_amount": Decimal("950.00"),
            "deposit_amount": Decimal("1100.00"),
            "landlord_id": landlord_id,
            "property_manager_id": manager_id,
        },
        {
            "reference": "XP-PROP-004",
            "title": "Large 4 Bed Detached House",
            "address_line_1": "8 Queens Road",
            "city": "Leeds",
            "county": "West Yorkshire",
            "postcode": "LS1 4EF",
            "country": "United Kingdom",
            "property_type": PropertyType.HOUSE,
            "bedrooms": 4,
            "bathrooms": 2,
            "reception_rooms": 2,
            "floor_area_sqft": 1500,
            "has_parking": True,
            "has_garden": True,
            "has_balcony": False,
            "pets_allowed": True,
            "smoking_allowed": False,
            "is_hmo": False,
            "epc_rating": "B",
            "status": PropertyStatus.AVAILABLE,
            "rent_amount": Decimal("1750.00"),
            "deposit_amount": Decimal("2020.00"),
            "landlord_id": landlord_id,
            "property_manager_id": manager_id,
        },
        {
            "reference": "XP-PROP-005",
            "title": "Luxury Penthouse with Views",
            "address_line_1": "The Penthouse, Skyline Tower",
            "address_line_2": "Canary Wharf",
            "city": "London",
            "county": "Greater London",
            "postcode": "E14 5AB",
            "country": "United Kingdom",
            "property_type": PropertyType.FLAT,
            "bedrooms": 3,
            "bathrooms": 2,
            "reception_rooms": 1,
            "floor_area_sqft": 1800,
            "has_parking": True,
            "has_garden": False,
            "has_balcony": True,
            "pets_allowed": False,
            "smoking_allowed": False,
            "is_hmo": False,
            "epc_rating": "A",
            "status": PropertyStatus.LET,
            "rent_amount": Decimal("4500.00"),
            "deposit_amount": Decimal("5200.00"),
            "landlord_id": landlord_id,
            "property_manager_id": manager_id,
        },
    ]

    created = []
    for data in properties_data:
        result = await db.execute(select(Property).where(Property.reference == data["reference"]))
        existing = result.scalar_one_or_none()
        if existing:
            created.append(existing)
            print(f"  Property {data['reference']} already exists")
            continue

        prop = Property(**data)
        db.add(prop)
        created.append(prop)
        print(f"  Created: {data['address_line_1']}")

    await db.flush()
    return created


async def seed_tenants(db: AsyncSession, property_ids):
    """Create sample tenants at different pipeline stages"""
    print("\nCreating tenants...")

    now = datetime.now(timezone.utc)

    tenants_data = [
        {
            "reference": "XP-TEN-001",
            "email": "james.wilson@email.com",
            "phone_number": "+44 7700 800001",
            "full_name": "James Wilson",
            "status": TenantStatus.ACTIVE,
            "pipeline_stage": TenantPipelineStage.TENANCY_STARTED,
            "interested_property_id": property_ids[0],
            "employment_status": "employed",
            "employer_name": "Tech Corp Ltd",
            "annual_income": 55000,
            "gdpr_consent": True,
            "gdpr_consent_at": now,
            "source": "rightmove",
        },
        {
            "reference": "XP-TEN-002",
            "email": "emma.thompson@email.com",
            "phone_number": "+44 7700 800002",
            "full_name": "Emma Thompson",
            "status": TenantStatus.PROSPECT,
            "pipeline_stage": TenantPipelineStage.CONTRACT_SENT,
            "interested_property_id": property_ids[1],
            "employment_status": "employed",
            "employer_name": "Finance Partners",
            "annual_income": 48000,
            "gdpr_consent": True,
            "gdpr_consent_at": now,
            "source": "zoopla",
        },
        {
            "reference": "XP-TEN-003",
            "email": "david.chen@email.com",
            "phone_number": "+44 7700 800003",
            "full_name": "David Chen",
            "status": TenantStatus.PROSPECT,
            "pipeline_stage": TenantPipelineStage.HOLDING_DEPOSIT_PAID,
            "interested_property_id": property_ids[3],
            "employment_status": "self_employed",
            "annual_income": 62000,
            "gdpr_consent": True,
            "gdpr_consent_at": now,
            "source": "website",
        },
        {
            "reference": "XP-TEN-004",
            "email": "sophie.martin@email.com",
            "phone_number": "+44 7700 800004",
            "full_name": "Sophie Martin",
            "status": TenantStatus.PROSPECT,
            "pipeline_stage": TenantPipelineStage.DOCUMENTS_REQUESTED,
            "interested_property_id": property_ids[1],
            "employment_status": "employed",
            "employer_name": "NHS Trust",
            "annual_income": 42000,
            "gdpr_consent": True,
            "gdpr_consent_at": now,
            "source": "rightmove",
        },
        {
            "reference": "XP-TEN-005",
            "email": "alex.kumar@email.com",
            "phone_number": "+44 7700 800005",
            "full_name": "Alex Kumar",
            "status": TenantStatus.PROSPECT,
            "pipeline_stage": TenantPipelineStage.VIEWING_SCHEDULED,
            "interested_property_id": property_ids[3],
            "employment_status": "employed",
            "employer_name": "University of Leeds",
            "annual_income": 38000,
            "gdpr_consent": True,
            "gdpr_consent_at": now,
            "source": "referral",
        },
        {
            "reference": "XP-TEN-006",
            "email": "lisa.white@email.com",
            "phone_number": "+44 7700 800006",
            "full_name": "Lisa White",
            "status": TenantStatus.PROSPECT,
            "pipeline_stage": TenantPipelineStage.ENQUIRY,
            "interested_property_id": property_ids[1],
            "source": "zoopla",
            "gdpr_consent": True,
            "gdpr_consent_at": now,
        },
    ]

    created = []
    for data in tenants_data:
        result = await db.execute(select(Tenant).where(Tenant.reference == data["reference"]))
        existing = result.scalar_one_or_none()
        if existing:
            created.append(existing)
            print(f"  Tenant {data['reference']} already exists")
            continue

        tenant = Tenant(**data)
        db.add(tenant)
        created.append(tenant)
        print(f"  Created: {data['full_name']} ({data['pipeline_stage'].value})")

    await db.flush()
    return created


async def seed_compliance(db: AsyncSession, property_ids):
    """Create compliance records"""
    print("\nCreating compliance records...")
    import hashlib

    now = datetime.now(timezone.utc)

    def generate_hash(ref, cert_num, issue_date):
        """Generate a hash for tamper-resistance"""
        data = f"{ref}:{cert_num}:{issue_date.isoformat()}"
        return hashlib.sha256(data.encode()).hexdigest()

    compliance_data = [
        # Property 1 - All valid
        {"reference": "XP-COMP-001", "property_id": property_ids[0], "compliance_type": ComplianceType.GAS_SAFETY,
         "status": ComplianceStatus.VALID, "certificate_number": "GSC-2024-001",
         "issue_date": now - timedelta(days=60), "expiry_date": now + timedelta(days=305), "supplier_name": "SafeGas Ltd"},
        {"reference": "XP-COMP-002", "property_id": property_ids[0], "compliance_type": ComplianceType.ELECTRICAL_EICR,
         "status": ComplianceStatus.VALID, "certificate_number": "EICR-2024-001",
         "issue_date": now - timedelta(days=180), "expiry_date": now + timedelta(days=1645), "supplier_name": "ElecTest Services"},
        {"reference": "XP-COMP-003", "property_id": property_ids[0], "compliance_type": ComplianceType.EPC,
         "status": ComplianceStatus.VALID, "certificate_number": "EPC-2024-001",
         "issue_date": now - timedelta(days=90), "expiry_date": now + timedelta(days=3560)},

        # Property 2 - Mixed
        {"reference": "XP-COMP-004", "property_id": property_ids[1], "compliance_type": ComplianceType.GAS_SAFETY,
         "status": ComplianceStatus.EXPIRING_SOON, "certificate_number": "GSC-2023-002",
         "issue_date": now - timedelta(days=340), "expiry_date": now + timedelta(days=25), "supplier_name": "SafeGas Ltd"},
        {"reference": "XP-COMP-005", "property_id": property_ids[1], "compliance_type": ComplianceType.ELECTRICAL_EICR,
         "status": ComplianceStatus.VALID, "certificate_number": "EICR-2023-002",
         "issue_date": now - timedelta(days=400), "expiry_date": now + timedelta(days=1425)},

        # Property 3 - Expired
        {"reference": "XP-COMP-006", "property_id": property_ids[2], "compliance_type": ComplianceType.GAS_SAFETY,
         "status": ComplianceStatus.EXPIRED, "certificate_number": "GSC-2023-003",
         "issue_date": now - timedelta(days=380), "expiry_date": now - timedelta(days=15)},
        {"reference": "XP-COMP-007", "property_id": property_ids[2], "compliance_type": ComplianceType.FIRE_ALARM,
         "status": ComplianceStatus.EXPIRED, "certificate_number": "FA-2023-003",
         "issue_date": now - timedelta(days=400), "expiry_date": now - timedelta(days=35)},

        # Property 4
        {"reference": "XP-COMP-008", "property_id": property_ids[3], "compliance_type": ComplianceType.GAS_SAFETY,
         "status": ComplianceStatus.VALID, "certificate_number": "GSC-2024-004",
         "issue_date": now - timedelta(days=30), "expiry_date": now + timedelta(days=335), "supplier_name": "SafeGas Ltd"},

        # Property 5
        {"reference": "XP-COMP-009", "property_id": property_ids[4], "compliance_type": ComplianceType.GAS_SAFETY,
         "status": ComplianceStatus.VALID, "certificate_number": "GSC-2024-005",
         "issue_date": now - timedelta(days=45), "expiry_date": now + timedelta(days=320)},
        {"reference": "XP-COMP-010", "property_id": property_ids[4], "compliance_type": ComplianceType.ELECTRICAL_EICR,
         "status": ComplianceStatus.VALID, "certificate_number": "EICR-2024-005",
         "issue_date": now - timedelta(days=100), "expiry_date": now + timedelta(days=1725)},
    ]

    created = []
    for data in compliance_data:
        result = await db.execute(select(ComplianceRecord).where(ComplianceRecord.reference == data["reference"]))
        existing = result.scalar_one_or_none()
        if existing:
            created.append(existing)
            continue

        # Add required record_hash
        data["record_hash"] = generate_hash(
            data["reference"],
            data.get("certificate_number", ""),
            data["issue_date"]
        )

        comp = ComplianceRecord(**data)
        db.add(comp)
        created.append(comp)

    await db.flush()
    print(f"  Created {len(created)} compliance records")
    return created


async def seed_maintenance(db: AsyncSession, property_ids):
    """Create maintenance issues"""
    print("\nCreating maintenance issues...")

    now = datetime.now(timezone.utc)

    issues_data = [
        {"reference": "XP-ISS-001", "property_id": property_ids[0], "title": "Boiler not heating water properly",
         "description": "The boiler is making strange noises and water is not heating to the right temperature.",
         "category": IssueCategory.PLUMBING, "priority": IssuePriority.HIGH, "status": IssueStatus.ASSIGNED,
         "location_in_property": "Kitchen", "reported_at": now - timedelta(days=2), "sla_target_hours": 24,
         "sla_deadline": now + timedelta(hours=22)},
        {"reference": "XP-ISS-002", "property_id": property_ids[2], "title": "Broken window lock",
         "description": "The lock on the bedroom window is broken and won't secure properly.",
         "category": IssueCategory.WINDOWS_DOORS, "priority": IssuePriority.MEDIUM, "status": IssueStatus.REPORTED,
         "location_in_property": "Master Bedroom", "reported_at": now - timedelta(days=1), "sla_target_hours": 72,
         "sla_deadline": now + timedelta(days=2)},
        {"reference": "XP-ISS-003", "property_id": property_ids[0], "title": "Smoke alarm beeping",
         "description": "Smoke alarm in hallway keeps beeping - battery might need replacing.",
         "category": IssueCategory.FIRE_SAFETY, "priority": IssuePriority.CRITICAL, "status": IssueStatus.IN_PROGRESS,
         "location_in_property": "Hallway", "reported_at": now - timedelta(hours=6), "sla_target_hours": 4,
         "sla_deadline": now + timedelta(hours=2)},
        {"reference": "XP-ISS-004", "property_id": property_ids[4], "title": "Air conditioning not cooling",
         "description": "AC unit is running but not producing cold air.",
         "category": IssueCategory.HEATING, "priority": IssuePriority.MEDIUM, "status": IssueStatus.ON_HOLD,
         "location_in_property": "Living Room", "reported_at": now - timedelta(days=3), "sla_target_hours": 72,
         "sla_deadline": now},
        {"reference": "XP-ISS-005", "property_id": property_ids[1], "title": "Garden fence panel damaged",
         "description": "One fence panel has blown over in the wind and needs replacing.",
         "category": IssueCategory.GARDEN_EXTERIOR, "priority": IssuePriority.LOW, "status": IssueStatus.REPORTED,
         "location_in_property": "Rear Garden", "reported_at": now - timedelta(days=5), "sla_target_hours": 168,
         "sla_deadline": now + timedelta(days=2)},
    ]

    created = []
    for data in issues_data:
        result = await db.execute(select(MaintenanceIssue).where(MaintenanceIssue.reference == data["reference"]))
        existing = result.scalar_one_or_none()
        if existing:
            created.append(existing)
            continue

        issue = MaintenanceIssue(**data)
        db.add(issue)
        created.append(issue)

    await db.flush()
    print(f"  Created {len(created)} maintenance issues")
    return created


async def seed_suppliers(db: AsyncSession):
    """Create suppliers"""
    print("\nCreating suppliers...")

    now = datetime.now(timezone.utc)

    suppliers_data = [
        {"reference": "XP-SUP-001", "business_name": "SafeGas Ltd", "contact_name": "John Smith",
         "email": "jobs@safegas.co.uk", "phone_number": "+44 800 123 4567", "primary_trade": "gas",
         "address_line_1": "123 Gas Street", "city": "London", "postcode": "SW1A 1AA",
         "skills": ["gas_safety", "boiler_repair", "central_heating"], "service_postcodes": ["SW", "SE", "KT"],
         "hourly_rate": Decimal("65.00"), "call_out_fee": Decimal("85.00"), "status": SupplierStatus.ACTIVE,
         "verified": True, "verified_at": now - timedelta(days=180), "average_rating": Decimal("4.8"),
         "total_jobs_completed": 156},
        {"reference": "XP-SUP-002", "business_name": "ElecTest Services", "contact_name": "Mike Johnson",
         "email": "info@electest.co.uk", "phone_number": "+44 800 234 5678", "primary_trade": "electrical",
         "address_line_1": "45 Electric Ave", "city": "Manchester", "postcode": "M1 2AB",
         "skills": ["electrical_testing", "rewiring", "fuse_board"], "service_postcodes": ["SW", "M"],
         "hourly_rate": Decimal("55.00"), "call_out_fee": Decimal("75.00"), "status": SupplierStatus.ACTIVE,
         "verified": True, "average_rating": Decimal("4.6"), "total_jobs_completed": 89},
        {"reference": "XP-SUP-003", "business_name": "Quick Fix Plumbing", "contact_name": "Dave Williams",
         "email": "dave@quickfixplumbing.co.uk", "phone_number": "+44 7700 111222", "primary_trade": "plumbing",
         "address_line_1": "78 Pipe Lane", "city": "London", "postcode": "E1 6AN",
         "skills": ["plumbing", "leak_repair", "bathroom_fitting"], "service_postcodes": ["E", "IG", "RM"],
         "hourly_rate": Decimal("50.00"), "call_out_fee": Decimal("60.00"), "status": SupplierStatus.ACTIVE,
         "verified": True, "average_rating": Decimal("4.5"), "total_jobs_completed": 234},
        {"reference": "XP-SUP-004", "business_name": "ABC Locksmiths", "contact_name": "Alan Cooper",
         "email": "alan@abclocksmiths.co.uk", "phone_number": "+44 7700 333444", "primary_trade": "locksmith",
         "address_line_1": "12 Key Court", "city": "London", "postcode": "WC1A 1BB",
         "skills": ["locks", "security", "emergency_access"], "service_postcodes": ["WC", "EC", "N"],
         "hourly_rate": Decimal("70.00"), "call_out_fee": Decimal("95.00"), "status": SupplierStatus.ACTIVE,
         "verified": True, "average_rating": Decimal("4.9"), "total_jobs_completed": 67, "accepts_emergency": True},
    ]

    created = []
    for data in suppliers_data:
        result = await db.execute(select(Supplier).where(Supplier.reference == data["reference"]))
        existing = result.scalar_one_or_none()
        if existing:
            created.append(existing)
            continue

        supplier = Supplier(**data)
        db.add(supplier)
        created.append(supplier)

    await db.flush()
    print(f"  Created {len(created)} suppliers")
    return created


async def main():
    """Run all seed functions"""
    print("=" * 60)
    print("XAPPY Property Management - Database Seed")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        try:
            # Create users
            users = await seed_pm_users(db)

            # Find landlord and manager
            landlord = next((u for u in users if u.role == UserRole.LANDLORD), users[0])
            manager = next((u for u in users if u.role == UserRole.PROPERTY_MANAGER), users[0])

            # Create properties
            properties = await seed_properties(db, landlord.id, manager.id)
            property_ids = [p.id for p in properties]

            # Create tenants
            await seed_tenants(db, property_ids)

            # Create compliance records
            await seed_compliance(db, property_ids)

            # Create maintenance issues
            await seed_maintenance(db, property_ids)

            # Create suppliers
            await seed_suppliers(db)

            await db.commit()

            print("\n" + "=" * 60)
            print("Seed completed successfully!")
            print("=" * 60)
            print("\nTest Login Credentials:")
            print("-" * 40)
            print("Property Manager: Badge PM001, PIN 1234")
            print("Landlord:         Badge LL001, PIN 1234")
            print("Agent:            Badge AG001, PIN 1234")
            print("Tenant:           Badge TN001, PIN 1234")
            print("Supplier:         Badge SP001, PIN 1234")
            print("-" * 40)

        except Exception as e:
            await db.rollback()
            print(f"\nError: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())
