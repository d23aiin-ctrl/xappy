"""
Site and Area schemas
"""
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.site import SiteType, HazardClassification


class SiteBase(BaseModel):
    """Base site schema"""
    code: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=1, max_length=200)
    site_type: SiteType
    location: str
    state: str
    country: str = "India"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class SiteCreate(SiteBase):
    """Site creation schema"""
    pass


class SiteResponse(BaseModel):
    """Site response schema"""
    id: UUID
    code: str
    name: str
    site_type: SiteType
    location: str
    state: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SiteListResponse(BaseModel):
    """Site list response"""
    items: List[SiteResponse]
    total: int
    skip: int
    limit: int


class AreaBase(BaseModel):
    """Base area schema"""
    code: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=1, max_length=200)
    hazard_classification: HazardClassification
    description: Optional[str] = None
    parent_area_id: Optional[UUID] = None


class AreaCreate(AreaBase):
    """Area creation schema"""
    site_id: UUID


class AreaResponse(BaseModel):
    """Area response schema"""
    id: UUID
    site_id: UUID
    code: str
    name: str
    hazard_classification: HazardClassification
    description: Optional[str] = None
    parent_area_id: Optional[UUID] = None
    is_active: bool

    class Config:
        from_attributes = True
