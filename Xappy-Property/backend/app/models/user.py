"""
XAPPY Property User Model

User accounts for workers, supervisors, and enterprise users.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    String, Boolean, DateTime, Enum, Index, ForeignKey, Text
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base


class UserRole(str, enum.Enum):
    """User role types in XAPPY Property"""
    # Construction roles (legacy)
    WORKER = "worker"                       # Construction workers
    SUPERVISOR = "supervisor"               # Site supervisors
    SITE_MANAGER = "site_manager"           # Site managers
    PROJECT_MANAGER = "project_manager"     # Project managers
    CONTRACTOR = "contractor"               # Contractor companies
    ARCHITECT = "architect"                 # Architects
    QUALITY_INSPECTOR = "quality_inspector" # Quality inspectors
    SAFETY_OFFICER = "safety_officer"       # Safety officers
    HSE_MANAGER = "hse_manager"             # HSE managers (shared DB)
    HSE_OFFICER = "hse_officer"             # HSE officers (shared DB)
    COMPLIANCE_OFFICER = "compliance_officer"  # Compliance officers (shared DB)
    OPERATIONS_DIRECTOR = "operations_director"  # Operations directors (shared DB)

    # Property management roles (new)
    LANDLORD = "landlord"                   # Property owner (Lite access)
    PROPERTY_MANAGER = "property_manager"   # Portfolio manager (full access)
    AGENT = "agent"                         # Viewings & field updates
    SUPPLIER = "supplier"                   # Maintenance supplier (job access only)
    TENANT = "tenant"                       # Tenant (own data only)

    # Admin roles
    ADMIN = "admin"                         # System admin
    SUPER_ADMIN = "super_admin"             # Super admin


class UserStatus(str, enum.Enum):
    """User account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


class User(Base):
    """
    User model for all platform users.

    Workers are identified primarily by badge_number.
    Phone number is used for communication.
    """
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Primary identifiers
    badge_number: Mapped[Optional[str]] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=True,
        comment="Worker badge/employee ID - primary identifier for field workers"
    )
    phone_number: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
        comment="Phone number with country code"
    )
    email: Mapped[Optional[str]] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True
    )

    # Profile
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Role & Status
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole),
        default=UserRole.WORKER,
        nullable=False,
        index=True
    )
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus),
        default=UserStatus.ACTIVE,
        nullable=False,
        index=True
    )

    # Site assignment
    site_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("sites.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Worker-specific fields
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    job_title: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    contractor_company: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Company name for contractor workers"
    )
    shift_pattern: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True,
        comment="Shift pattern (A/B/C/D)"
    )

    # Authentication
    pin_hash: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Hashed PIN for badge login"
    )
    password_hash: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Hashed password for admin login"
    )
    phone_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Preferences
    preferred_language: Mapped[str] = mapped_column(
        String(10),
        default="en",
        comment="Preferred language (en, hi, etc.)"
    )
    # Keep property naming while mapping to legacy/shared DB column.
    notifications_enabled: Mapped[bool] = mapped_column(
        "whatsapp_opted_in",
        Boolean,
        default=True,
        comment="User has opted in for notifications"
    )

    # Emergency contact
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Certifications & Training (for workers)
    certifications: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {name, expiry_date, issued_by}"
    )

    # Metadata
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Timestamps
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationships
    site: Mapped[Optional["Site"]] = relationship("Site", back_populates="users")
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="reporter", foreign_keys="Report.reporter_id")
    acknowledged_reports: Mapped[List["Report"]] = relationship("Report", back_populates="acknowledged_by", foreign_keys="Report.acknowledged_by_id")
    conversations: Mapped[List["Conversation"]] = relationship("Conversation", back_populates="user")

    __table_args__ = (
        Index("ix_users_site_role", "site_id", "role"),
        Index("ix_users_status_role", "status", "role"),
    )

    def __repr__(self) -> str:
        return f"<User {self.badge_number or self.phone_number} ({self.role.value})>"

    @property
    def display_name(self) -> str:
        """Get display name for the user"""
        return self.full_name or self.badge_number or self.phone_number

    @property
    def is_supervisor_or_above(self) -> bool:
        """Check if user has supervisor-level access (construction context)"""
        return self.role in [
            UserRole.SUPERVISOR,
            UserRole.SITE_MANAGER,
            UserRole.PROJECT_MANAGER,
            UserRole.QUALITY_INSPECTOR,
            UserRole.SAFETY_OFFICER,
            UserRole.HSE_MANAGER,
            UserRole.HSE_OFFICER,
            UserRole.COMPLIANCE_OFFICER,
            UserRole.OPERATIONS_DIRECTOR,
            UserRole.ARCHITECT,
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
        ]

    @property
    def is_admin(self) -> bool:
        """Check if user has admin access"""
        return self.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]

    @property
    def is_property_manager_or_above(self) -> bool:
        """Check if user has property manager level access"""
        return self.role in [
            UserRole.PROPERTY_MANAGER,
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
        ]

    @property
    def is_landlord_or_above(self) -> bool:
        """Check if user has landlord level access"""
        return self.role in [
            UserRole.LANDLORD,
            UserRole.PROPERTY_MANAGER,
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
        ]

    @property
    def is_tenant(self) -> bool:
        """Check if user is a tenant"""
        return self.role == UserRole.TENANT

    @property
    def is_supplier(self) -> bool:
        """Check if user is a maintenance supplier"""
        return self.role == UserRole.SUPPLIER

    @property
    def is_agent(self) -> bool:
        """Check if user is a property agent"""
        return self.role == UserRole.AGENT
