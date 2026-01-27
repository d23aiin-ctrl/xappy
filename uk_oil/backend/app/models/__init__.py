"""
XAPPY AI Database Models

All SQLAlchemy ORM models for the Oil & Gas compliance platform.
"""

from .user import User, UserRole, UserStatus
from .site import Site, SiteType, Area, HazardClassification
from .report import Report, ReportType, ReportStatus
from .near_miss import NearMissDetails, NearMissCategory
from .incident import IncidentDetails, IncidentType, SeverityLevel
from .shift_handover import ShiftHandoverDetails
from .toolbox_talk import ToolboxTalkDetails
from .ptw_evidence import PTWEvidenceDetails, PTWType
from .loto_evidence import LOTOEvidenceDetails
from .spill_report import SpillReportDetails, SpillType
from .inspection import InspectionDetails, InspectionType
from .media_attachment import MediaAttachment, MediaType
from .audit_trail import AuditTrail, AuditAction
from .conversation import Conversation, Message, ConversationStatus, MessageType, MessageDirection

__all__ = [
    # User & Site
    "User", "UserRole", "UserStatus",
    "Site", "SiteType", "Area", "HazardClassification",
    # Reports
    "Report", "ReportType", "ReportStatus",
    "NearMissDetails", "NearMissCategory",
    "IncidentDetails", "IncidentType", "SeverityLevel",
    "ShiftHandoverDetails",
    "ToolboxTalkDetails",
    "PTWEvidenceDetails", "PTWType",
    "LOTOEvidenceDetails",
    "SpillReportDetails", "SpillType",
    "InspectionDetails", "InspectionType",
    # Media & Audit
    "MediaAttachment", "MediaType",
    "AuditTrail", "AuditAction",
    # Conversation
    "Conversation", "Message", "ConversationStatus", "MessageType", "MessageDirection",
]
