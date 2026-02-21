"""
XAPPY Property Database Models

All SQLAlchemy ORM models for the Property Development and Management platform.
"""

# User & Site (existing)
from .user import User, UserRole, UserStatus
from .site import Site, SiteType, Area, AreaClassification

# Construction Reports (existing)
from .report import Report, ReportType, ReportStatus
from .construction_progress import ConstructionProgressDetails, ProgressStatus
from .defect_report import DefectReportDetails, DefectCategory, DefectPriority, DefectStatus
from .incident import IncidentDetails, IncidentType, SeverityLevel
from .shift_handover import ShiftHandoverDetails
from .toolbox_talk import ToolboxTalkDetails
from .inspection import InspectionDetails, InspectionType

# Media & Audit (existing)
from .media_attachment import MediaAttachment, MediaType
from .audit_trail import AuditTrail, AuditAction
from .conversation import Conversation, Message, ConversationStatus, MessageType, MessageDirection

# Property Management (new - Phase 2A)
from .property import Property, PropertyType, PropertyStatus, FurnishingType
from .tenant import Tenant, TenantPipelineStage, TenantPipelineHistory, TenantStatus
from .tenancy import Tenancy, TenancyStatus, TenancyType, DepositScheme
from .questionnaire import (
    Questionnaire, QuestionnaireQuestion, QualificationResponse,
    QuestionType, QuestionnaireStatus, ResponseStatus
)

# Documents & Deposits (new - Phase 2B)
from .tenant_document import (
    TenantDocument, DocumentAccessLog,
    DocumentType, DocumentStatus
)
from .deposit import HoldingDeposit, HoldingDepositStatus, PaymentMethod

# Contracts (new - Phase 2C)
from .contract import (
    ContractTemplate, TenancyAgreement, SignatureAuditEntry,
    TemplateStatus, AgreementStatus, SignatureStatus
)

# Maintenance (new - Phase 3A)
from .maintenance import (
    MaintenanceIssue, MaintenanceJob,
    IssueCategory, IssuePriority, IssueStatus, JobStatus, SLA_TARGETS
)
from .supplier import Supplier, SupplierStatus, SupplierType

# Cost & Compliance (new - Phase 3B)
from .job_cost import JobCost, CostType, CostStatus, PaymentStatus
from .compliance import (
    ComplianceRecord, ComplianceReminder,
    ComplianceType, ComplianceStatus, ReminderStatus,
    DEFAULT_VALIDITY, REMINDER_SCHEDULE
)

__all__ = [
    # User & Site
    "User", "UserRole", "UserStatus",
    "Site", "SiteType", "Area", "AreaClassification",

    # Construction Reports
    "Report", "ReportType", "ReportStatus",
    "ConstructionProgressDetails", "ProgressStatus",
    "DefectReportDetails", "DefectCategory", "DefectPriority", "DefectStatus",
    "IncidentDetails", "IncidentType", "SeverityLevel",
    "ShiftHandoverDetails",
    "ToolboxTalkDetails",
    "InspectionDetails", "InspectionType",

    # Media & Audit
    "MediaAttachment", "MediaType",
    "AuditTrail", "AuditAction",
    "Conversation", "Message", "ConversationStatus", "MessageType", "MessageDirection",

    # Property Management (Phase 2A)
    "Property", "PropertyType", "PropertyStatus", "FurnishingType",
    "Tenant", "TenantPipelineStage", "TenantPipelineHistory", "TenantStatus",
    "Tenancy", "TenancyStatus", "TenancyType", "DepositScheme",
    "Questionnaire", "QuestionnaireQuestion", "QualificationResponse",
    "QuestionType", "QuestionnaireStatus", "ResponseStatus",

    # Documents & Deposits (Phase 2B)
    "TenantDocument", "DocumentAccessLog", "DocumentType", "DocumentStatus",
    "HoldingDeposit", "HoldingDepositStatus", "PaymentMethod",

    # Contracts (Phase 2C)
    "ContractTemplate", "TenancyAgreement", "SignatureAuditEntry",
    "TemplateStatus", "AgreementStatus", "SignatureStatus",

    # Maintenance (Phase 3A)
    "MaintenanceIssue", "MaintenanceJob",
    "IssueCategory", "IssuePriority", "IssueStatus", "JobStatus", "SLA_TARGETS",
    "Supplier", "SupplierStatus", "SupplierType",

    # Cost & Compliance (Phase 3B)
    "JobCost", "CostType", "CostStatus", "PaymentStatus",
    "ComplianceRecord", "ComplianceReminder",
    "ComplianceType", "ComplianceStatus", "ReminderStatus",
    "DEFAULT_VALIDITY", "REMINDER_SCHEDULE",
]
