"""
XAPPY Supplier Service

Skill-based supplier matching and routing.
"""

from typing import Optional, List, Dict, Tuple
from uuid import UUID
from decimal import Decimal
import math

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_

from app.models.supplier import Supplier, SupplierStatus
from app.models.maintenance import IssueCategory, IssuePriority


# Map issue categories to required skills/trades
CATEGORY_SKILLS_MAP: Dict[IssueCategory, List[str]] = {
    IssueCategory.PLUMBING: ["plumbing", "plumber", "water", "drainage"],
    IssueCategory.ELECTRICAL: ["electrical", "electrician", "wiring"],
    IssueCategory.HEATING: ["heating", "boiler", "gas", "hvac", "central_heating"],
    IssueCategory.APPLIANCES: ["appliances", "electrical", "white_goods"],
    IssueCategory.STRUCTURAL: ["building", "structural", "construction", "brickwork"],
    IssueCategory.WINDOWS_DOORS: ["glazing", "carpentry", "joinery", "windows", "doors"],
    IssueCategory.ROOFING: ["roofing", "roofer", "guttering"],
    IssueCategory.DAMP_MOULD: ["damp", "mould", "ventilation", "damp_proofing"],
    IssueCategory.PEST_CONTROL: ["pest_control", "pest", "vermin"],
    IssueCategory.GARDEN_EXTERIOR: ["gardening", "landscaping", "exterior", "fencing"],
    IssueCategory.SECURITY: ["security", "locksmith", "alarm", "locks"],
    IssueCategory.FIRE_SAFETY: ["fire_safety", "fire", "alarms", "electrical"],
    IssueCategory.GAS: ["gas", "gas_safe", "heating", "boiler"],
    IssueCategory.CLEANING: ["cleaning", "cleaner", "end_of_tenancy"],
    IssueCategory.GENERAL: ["handyman", "general", "maintenance", "multi_trade"],
    IssueCategory.OTHER: ["general", "handyman", "maintenance"],
}

# Trades that require specific certifications
CERTIFIED_TRADES = {
    "gas": "gas_safe_registered",
    "gas_safe": "gas_safe_registered",
    "boiler": "gas_safe_registered",
    "electrical": "niceic_registered",
    "electrician": "niceic_registered",
}


class SupplierService:
    """
    Service for supplier matching and management.

    Features:
    - Skill-based routing
    - Location/area matching
    - Certification verification
    - Availability checking
    - Performance scoring
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def get_required_skills(category: IssueCategory) -> List[str]:
        """Get list of relevant skills for an issue category."""
        return CATEGORY_SKILLS_MAP.get(category, ["general", "handyman"])

    @staticmethod
    def get_required_certification(skill: str) -> Optional[str]:
        """Get required certification for a skill/trade."""
        return CERTIFIED_TRADES.get(skill.lower())

    @staticmethod
    def calculate_distance(
        lat1: float, lon1: float,
        lat2: float, lon2: float
    ) -> float:
        """
        Calculate distance between two points in miles.

        Uses Haversine formula.
        """
        R = 3959  # Earth's radius in miles

        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)

        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c

    def score_supplier(
        self,
        supplier: Supplier,
        required_skills: List[str],
        is_emergency: bool = False,
        postcode_prefix: Optional[str] = None,
    ) -> float:
        """
        Calculate a matching score for a supplier.

        Higher score = better match.
        """
        score = 0.0

        # Skill matching (0-30 points)
        supplier_skills = [s.lower() for s in supplier.skills]
        primary_trade = supplier.primary_trade.lower()

        skill_matches = sum(
            1 for skill in required_skills
            if skill.lower() in supplier_skills or skill.lower() == primary_trade
        )

        if skill_matches > 0:
            score += 10 + (skill_matches * 5)  # Base 10 + 5 per match

        # Primary trade exact match bonus
        if primary_trade in [s.lower() for s in required_skills]:
            score += 10

        # Emergency availability (0-20 points)
        if is_emergency:
            if supplier.accepts_emergency and supplier.emergency_available:
                score += 20
            elif supplier.accepts_emergency:
                score += 10
            # Penalize if doesn't accept emergency
            if not supplier.accepts_emergency:
                score -= 10

        # Location matching (0-15 points)
        if postcode_prefix and supplier.service_postcodes:
            if postcode_prefix in supplier.service_postcodes:
                score += 15
            elif any(postcode_prefix.startswith(p[:2]) for p in supplier.service_postcodes):
                score += 8

        # Performance metrics (0-25 points)
        if supplier.average_rating:
            score += float(supplier.average_rating) * 4  # Max 20 points

        if supplier.on_time_percentage:
            score += float(supplier.on_time_percentage) / 20  # Max 5 points

        # Experience bonus
        if supplier.total_jobs_completed >= 50:
            score += 5
        elif supplier.total_jobs_completed >= 20:
            score += 3
        elif supplier.total_jobs_completed >= 10:
            score += 1

        # Insurance verification
        if supplier.has_valid_insurance:
            score += 5

        # Verified supplier bonus
        if supplier.verified:
            score += 5

        return score

    async def find_matching_suppliers(
        self,
        category: IssueCategory,
        postcode: str,
        is_emergency: bool = False,
        required_skills: Optional[List[str]] = None,
        max_results: int = 10,
        property_coords: Optional[Tuple[float, float]] = None,
    ) -> List[Tuple[Supplier, float]]:
        """
        Find suppliers matching the given criteria.

        Args:
            category: Issue category
            postcode: Property postcode
            is_emergency: Whether this is an emergency callout
            required_skills: Additional required skills
            max_results: Maximum number of results
            property_coords: Optional (lat, lng) for distance calculation

        Returns:
            List of (supplier, score) tuples, sorted by score
        """
        # Get base skill requirements
        skills = self.get_required_skills(category)
        if required_skills:
            skills = list(set(skills + required_skills))

        # Check for certification requirements
        required_cert = None
        for skill in skills:
            cert = self.get_required_certification(skill)
            if cert:
                required_cert = cert
                break

        # Build query
        query = select(Supplier).where(
            and_(
                Supplier.status == SupplierStatus.ACTIVE,
                Supplier.verified == True,
            )
        )

        # Add certification filter if needed
        if required_cert == "gas_safe_registered":
            query = query.where(Supplier.gas_safe_registered == True)
        elif required_cert == "niceic_registered":
            query = query.where(Supplier.niceic_registered == True)

        # Emergency filter
        if is_emergency:
            query = query.where(Supplier.accepts_emergency == True)

        result = await self.db.execute(query)
        suppliers = result.scalars().all()

        # Extract postcode prefix for matching
        postcode_prefix = postcode.split()[0] if ' ' in postcode else postcode[:3]

        # Score and filter suppliers
        scored_suppliers = []
        for supplier in suppliers:
            # Check if supplier has at least one matching skill
            supplier_skills = [s.lower() for s in supplier.skills]
            has_skill_match = any(
                skill.lower() in supplier_skills or
                skill.lower() == supplier.primary_trade.lower()
                for skill in skills
            )

            if not has_skill_match:
                continue

            # Calculate score
            score = self.score_supplier(
                supplier=supplier,
                required_skills=skills,
                is_emergency=is_emergency,
                postcode_prefix=postcode_prefix,
            )

            # Calculate distance if coordinates available
            distance = None
            if property_coords and supplier.coordinates:
                sup_coords = supplier.coordinates
                if 'lat' in sup_coords and 'lng' in sup_coords:
                    distance = self.calculate_distance(
                        property_coords[0], property_coords[1],
                        sup_coords['lat'], sup_coords['lng']
                    )

                    # Check service radius
                    if distance > supplier.service_radius_miles:
                        continue

                    # Distance bonus (closer = better)
                    if distance <= 5:
                        score += 10
                    elif distance <= 10:
                        score += 5

            scored_suppliers.append((supplier, score, distance))

        # Sort by score (descending)
        scored_suppliers.sort(key=lambda x: x[1], reverse=True)

        # Return top results
        return [(s[0], s[1]) for s in scored_suppliers[:max_results]]

    async def get_supplier_availability(
        self,
        supplier_id: UUID,
        date: Optional[str] = None
    ) -> Dict:
        """
        Get supplier's availability.

        Args:
            supplier_id: Supplier ID
            date: Optional specific date to check (YYYY-MM-DD)

        Returns:
            Availability information
        """
        result = await self.db.execute(
            select(Supplier).where(Supplier.id == supplier_id)
        )
        supplier = result.scalar_one_or_none()

        if not supplier:
            return {"error": "Supplier not found"}

        return {
            "supplier_id": str(supplier_id),
            "accepts_emergency": supplier.accepts_emergency,
            "emergency_available_now": supplier.emergency_available,
            "availability_schedule": supplier.availability or {},
        }

    async def update_supplier_metrics(
        self,
        supplier_id: UUID,
        job_completed: bool = False,
        job_declined: bool = False,
        rating: Optional[int] = None,
        was_on_time: Optional[bool] = None,
        first_fix: Optional[bool] = None,
    ) -> None:
        """
        Update supplier performance metrics after a job.

        Args:
            supplier_id: Supplier ID
            job_completed: Whether a job was completed
            job_declined: Whether a job was declined
            rating: Job rating (1-5)
            was_on_time: Whether job was completed on time
            first_fix: Whether issue was fixed on first visit
        """
        result = await self.db.execute(
            select(Supplier).where(Supplier.id == supplier_id)
        )
        supplier = result.scalar_one_or_none()

        if not supplier:
            return

        # Update job counts
        if job_completed:
            supplier.total_jobs_completed += 1
        if job_declined:
            supplier.total_jobs_declined += 1

        # Update rating (running average)
        if rating and 1 <= rating <= 5:
            if supplier.average_rating:
                # Calculate new average
                total_ratings = supplier.total_jobs_completed
                current_avg = float(supplier.average_rating)
                new_avg = ((current_avg * (total_ratings - 1)) + rating) / total_ratings
                supplier.average_rating = Decimal(str(round(new_avg, 2)))
            else:
                supplier.average_rating = Decimal(str(rating))

        # Update on-time percentage (simplified)
        if was_on_time is not None and supplier.total_jobs_completed > 0:
            current_pct = float(supplier.on_time_percentage or 0)
            total = supplier.total_jobs_completed
            on_time_count = int(current_pct * (total - 1) / 100)
            if was_on_time:
                on_time_count += 1
            supplier.on_time_percentage = Decimal(str(round(on_time_count / total * 100, 2)))

        # Update first-fix rate
        if first_fix is not None and supplier.total_jobs_completed > 0:
            current_rate = float(supplier.first_fix_rate or 0)
            total = supplier.total_jobs_completed
            first_fix_count = int(current_rate * (total - 1) / 100)
            if first_fix:
                first_fix_count += 1
            supplier.first_fix_rate = Decimal(str(round(first_fix_count / total * 100, 2)))

        await self.db.commit()
