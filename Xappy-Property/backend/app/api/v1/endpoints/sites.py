"""
XAPPY AI Sites Endpoints

Site and area management.
"""

from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.site import Site, SiteType, Area, AreaClassification
from app.models.user import User
from app.api.v1.deps import get_current_active_user, require_admin

router = APIRouter()


# Schemas
class SiteResponse(BaseModel):
    """Site response"""
    id: str
    code: str
    name: str
    site_type: str
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: str
    coordinates: Optional[dict]
    developer_name: str
    project_manager_name: Optional[str]
    project_manager_phone: Optional[str]
    employee_count: Optional[int]
    is_active: bool

    class Config:
        from_attributes = True


class AreaResponse(BaseModel):
    """Area response"""
    id: str
    site_id: str
    code: str
    name: str
    area_type: Optional[str]
    area_classification: str
    building: Optional[str]
    is_active: bool


class SiteCreateRequest(BaseModel):
    """Site create request"""
    code: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=2, max_length=255)
    site_type: SiteType
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    developer_name: str


class PaginatedSiteResponse(BaseModel):
    """Paginated sites response"""
    items: List[SiteResponse]
    total: int
    page: int
    page_size: int


@router.get("", response_model=PaginatedSiteResponse)
async def list_sites(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    site_type: Optional[SiteType] = None,
    is_active: bool = True,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List all sites"""
    query = select(Site).where(Site.is_active == is_active)

    if site_type:
        query = query.where(Site.site_type == site_type)
    if search:
        query = query.where(
            (Site.name.ilike(f"%{search}%")) |
            (Site.code.ilike(f"%{search}%"))
        )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(Site.name)

    result = await db.execute(query)
    sites = result.scalars().all()

    return PaginatedSiteResponse(
        items=[
            SiteResponse(
                id=str(s.id),
                code=s.code,
                name=s.name,
                site_type=s.site_type.value,
                address=s.address,
                city=s.city,
                state=s.state,
                country=s.country,
                coordinates=s.coordinates,
                developer_name=s.developer_name,
                project_manager_name=s.project_manager_name,
                project_manager_phone=s.project_manager_phone,
                employee_count=s.employee_count,
                is_active=s.is_active,
            )
            for s in sites
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(
    site_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get site by ID"""
    result = await db.execute(select(Site).where(Site.id == site_id))
    site = result.scalar_one_or_none()

    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    return SiteResponse(
        id=str(site.id),
        code=site.code,
        name=site.name,
        site_type=site.site_type.value,
        address=site.address,
        city=site.city,
        state=site.state,
        country=site.country,
        coordinates=site.coordinates,
        developer_name=site.developer_name,
        project_manager_name=site.project_manager_name,
        project_manager_phone=site.project_manager_phone,
        employee_count=site.employee_count,
        is_active=site.is_active,
    )


@router.post("", response_model=SiteResponse)
async def create_site(
    request: SiteCreateRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new site (admin only)"""
    # Check code uniqueness
    existing = await db.execute(
        select(Site).where(Site.code == request.code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Site code already exists",
        )

    site = Site(
        code=request.code,
        name=request.name,
        site_type=request.site_type,
        address=request.address,
        city=request.city,
        state=request.state,
        country=request.country,
        developer_name=request.developer_name,
    )
    db.add(site)
    await db.commit()
    await db.refresh(site)

    return SiteResponse(
        id=str(site.id),
        code=site.code,
        name=site.name,
        site_type=site.site_type.value,
        address=site.address,
        city=site.city,
        state=site.state,
        country=site.country,
        coordinates=site.coordinates,
        developer_name=site.developer_name,
        project_manager_name=site.project_manager_name,
        project_manager_phone=site.project_manager_phone,
        employee_count=site.employee_count,
        is_active=site.is_active,
    )


@router.get("/{site_id}/areas", response_model=List[AreaResponse])
async def list_site_areas(
    site_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List areas for a site"""
    result = await db.execute(
        select(Area).where(Area.site_id == site_id, Area.is_active == True)
    )
    areas = result.scalars().all()

    return [
        AreaResponse(
            id=str(a.id),
            site_id=str(a.site_id),
            code=a.code,
            name=a.name,
            area_type=a.area_type,
            area_classification=a.area_classification.value,
            building=a.building,
            is_active=a.is_active,
        )
        for a in areas
    ]
