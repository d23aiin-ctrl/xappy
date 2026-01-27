"""
Chat Reporting Flow

Deterministic slot-filling flow to capture reports via chat.
"""

from datetime import datetime, timezone, date, timedelta
import re
import hashlib
from typing import Any, Dict, Optional, Tuple, List
import uuid

from dateutil import parser as date_parser
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import Report, ReportType, ReportStatus, REPORT_TYPE_PREFIX
from app.models.near_miss import NearMissDetails, NearMissCategory, PotentialSeverity
from app.models.incident import IncidentDetails, IncidentType, SeverityLevel
from app.models.shift_handover import ShiftHandoverDetails
from app.models.toolbox_talk import ToolboxTalkDetails
from app.models.ptw_evidence import PTWEvidenceDetails, PTWType
from app.models.loto_evidence import LOTOEvidenceDetails
from app.models.spill_report import SpillReportDetails, SpillType
from app.models.inspection import InspectionDetails, InspectionType
from app.models.user import User
from app.models.audit_trail import AuditAction
from app.services.audit import create_audit_entry


CONFIRM_WORDS = {"yes", "y", "confirm", "submit", "ok", "okay"}
CANCEL_WORDS = {"no", "cancel", "stop", "discard", "exit"}

# Healthcare query patterns
HEALTHCARE_PATTERNS = {
    "capabilities": ["what can you do", "what do you do", "help me", "what are you", "who are you", "capabilities", "features", "how can you help"],
    "find_care": ["find care", "find doctor", "find hospital", "nearby doctor", "nearby hospital", "doctor near", "hospital near", "need doctor", "need hospital", "doctors", "hospitals"],
    "symptom_check": ["symptom", "symptoms", "feeling sick", "i have", "pain in", "headache", "fever", "cough", "cold", "stomach", "nausea", "dizzy", "chest pain"],
    "vaccinations": ["vaccination", "vaccinations", "vaccine", "vaccines", "immunization", "immunisation", "shots", "booster"],
    "lab_reports": ["lab report", "lab reports", "test results", "blood test", "medical test", "report", "results"],
    "health_tips": ["health tip", "health tips", "wellness", "healthy", "advice", "nutrition", "exercise", "diet"],
    "emergency": ["emergency", "urgent", "ambulance", "911", "1990", "accident", "bleeding", "unconscious"],
    "pregnancy": ["pregnancy", "pregnant", "baby", "childcare", "child care", "prenatal", "maternity"],
    "pharmacy": ["pharmacy", "pharmacies", "medicine", "medication", "drug store", "tablets", "pills"],
}

def detect_healthcare_intent(message: str) -> Optional[str]:
    """Detect healthcare-related intent from message."""
    lowered = normalize_text(message)
    for intent, patterns in HEALTHCARE_PATTERNS.items():
        for pattern in patterns:
            if pattern in lowered:
                return intent
    return None

def get_healthcare_response(intent: str, message: str) -> str:
    """Generate healthcare response based on intent."""

    if intent == "capabilities":
        return (
            "👋 *Hi! I'm Xappy, your healthcare assistant.*\n\n"
            "Here's what I can help you with:\n\n"
            "🏥 *Find Care* - Locate doctors & hospitals near you\n"
            "🩺 *Symptom Check* - Understand your symptoms\n"
            "💉 *Vaccinations* - Vaccine info & schedules\n"
            "📋 *Lab Reports* - Understand test results\n"
            "💡 *Health Tips* - Daily wellness advice\n"
            "🤰 *Pregnancy* - Prenatal & childcare info\n"
            "💊 *Pharmacy* - Find medicines & pharmacies\n"
            "🚨 *Emergency* - Get urgent help (1990)\n\n"
            "Just type what you need help with, and I'll guide you!\n\n"
            "_Note: I provide health guidance, not medical advice. Always consult a doctor for medical decisions._"
        )

    elif intent == "find_care":
        return (
            "🏥 *Finding Care Near You*\n\n"
            "Here are some hospitals in Sri Lanka:\n\n"
            "🏨 *National Hospital Colombo*\n"
            "   📍 Regent Street, Colombo 10\n"
            "   📞 +94 11 269 1111\n\n"
            "🏨 *Lanka Hospitals*\n"
            "   📍 578 Elvitigala Mawatha, Colombo 5\n"
            "   📞 +94 11 553 0000\n\n"
            "🏨 *Asiri Central Hospital*\n"
            "   📍 114 Norris Canal Road, Colombo 10\n"
            "   📞 +94 11 466 5500\n\n"
            "Would you like me to help you find a specific type of doctor?"
        )

    elif intent == "symptom_check":
        return (
            "🩺 *Symptom Guidance*\n\n"
            "I can help you understand your symptoms. Please note this is for guidance only, not medical advice.\n\n"
            "Tell me more about:\n"
            "• What symptoms are you experiencing?\n"
            "• How long have you had them?\n"
            "• How severe are they (mild/moderate/severe)?\n\n"
            "⚠️ *If you have chest pain, difficulty breathing, or severe symptoms, call 1990 (Suwa Seriya) immediately.*"
        )

    elif intent == "vaccinations":
        return (
            "💉 *Vaccination Information*\n\n"
            "📋 *Routine Vaccinations in Sri Lanka:*\n"
            "• BCG (at birth)\n"
            "• Hepatitis B\n"
            "• DTP (Diphtheria, Tetanus, Pertussis)\n"
            "• Polio\n"
            "• MMR (Measles, Mumps, Rubella)\n"
            "• Japanese Encephalitis\n\n"
            "🏥 *Where to get vaccinated:*\n"
            "• Government hospitals (free)\n"
            "• MOH offices\n"
            "• Private hospitals\n\n"
            "Would you like information about a specific vaccine?"
        )

    elif intent == "lab_reports":
        return (
            "📋 *Lab Reports & Test Results*\n\n"
            "I can help you understand your lab results.\n\n"
            "Common tests include:\n"
            "• 🩸 Complete Blood Count (CBC)\n"
            "• 🍬 Blood Sugar / HbA1c\n"
            "• 💛 Liver Function Tests (LFT)\n"
            "• 💜 Kidney Function Tests (KFT)\n"
            "• ❤️ Lipid Profile (Cholesterol)\n"
            "• 🦠 Thyroid Tests (TSH, T3, T4)\n\n"
            "Which test results would you like help understanding?"
        )

    elif intent == "health_tips":
        return (
            "💡 *Daily Health Tips*\n\n"
            "🥗 *Nutrition:*\n"
            "• Eat plenty of fruits and vegetables\n"
            "• Stay hydrated - drink 8 glasses of water\n"
            "• Limit sugar and processed foods\n\n"
            "🏃 *Exercise:*\n"
            "• 30 minutes of moderate activity daily\n"
            "• Take walking breaks if sitting long hours\n\n"
            "😴 *Sleep:*\n"
            "• Aim for 7-8 hours of sleep\n"
            "• Maintain a consistent sleep schedule\n\n"
            "🧘 *Mental Health:*\n"
            "• Practice deep breathing\n"
            "• Take breaks when stressed\n\n"
            "What specific health topic interests you?"
        )

    elif intent == "emergency":
        return (
            "🆘 *EMERGENCY CONTACTS*\n\n"
            "📞 *Suwa Seriya Ambulance:* 1990\n"
            "📞 *Emergency Police/Fire:* 119\n"
            "📞 *Police:* 118\n"
            "📞 *Fire & Rescue:* 110\n\n"
            "⚠️ *If you or someone is experiencing:*\n"
            "• Chest pain or heart attack symptoms\n"
            "• Difficulty breathing\n"
            "• Severe bleeding\n"
            "• Loss of consciousness\n"
            "• Signs of stroke\n\n"
            "*CALL 1990 IMMEDIATELY*\n\n"
            "Are you having an emergency right now?"
        )

    elif intent == "pregnancy":
        return (
            "🤰 *Pregnancy & Childcare*\n\n"
            "📋 *Prenatal Care:*\n"
            "• Visit your doctor regularly\n"
            "• Take folic acid supplements\n"
            "• Get recommended vaccinations\n\n"
            "👶 *Childcare Tips:*\n"
            "• Breastfeed for first 6 months\n"
            "• Follow vaccination schedule\n"
            "• Regular growth monitoring\n\n"
            "🏥 *Maternity Services:*\n"
            "• De Soysa Hospital for Women, Colombo\n"
            "• Castle Street Hospital for Women\n"
            "• District General Hospitals\n\n"
            "What specific information do you need?"
        )

    elif intent == "pharmacy":
        return (
            "💊 *Pharmacy Information*\n\n"
            "🏪 *Major Pharmacy Chains:*\n\n"
            "• *State Pharmaceuticals Corporation*\n"
            "   📍 Available in most government hospitals\n\n"
            "• *Healthguard Pharmacy*\n"
            "   📞 +94 11 250 0500\n\n"
            "• *GLOMARK Pharmacy*\n"
            "   📞 +94 11 476 0760\n\n"
            "• *Cargills Pharmacy*\n"
            "   (Available in Cargills stores)\n\n"
            "⚠️ Always buy medicines with a valid prescription.\n\n"
            "What medication information do you need?"
        )

    return None

# Query intent patterns
QUERY_PATTERNS = {
    "count": ["how many", "count", "total", "number of"],
    "list": ["show", "list", "view", "display", "my reports", "get reports"],
    "status": ["status", "pending", "submitted", "acknowledged", "closed"],
}

REPORT_TYPE_ALIASES = {
    "near miss": ReportType.NEAR_MISS,
    "near-miss": ReportType.NEAR_MISS,
    "nearmiss": ReportType.NEAR_MISS,
    "incident": ReportType.INCIDENT,
    "daily log": ReportType.DAILY_SAFETY_LOG,
    "daily safety log": ReportType.DAILY_SAFETY_LOG,
    "shift handover": ReportType.SHIFT_HANDOVER,
    "handover": ReportType.SHIFT_HANDOVER,
    "toolbox": ReportType.TOOLBOX_TALK,
    "toolbox talk": ReportType.TOOLBOX_TALK,
    "ptw": ReportType.PTW_EVIDENCE,
    "permit to work": ReportType.PTW_EVIDENCE,
    "loto": ReportType.LOTO_EVIDENCE,
    "lockout": ReportType.LOTO_EVIDENCE,
    "spill": ReportType.SPILL_REPORT,
    "inspection": ReportType.INSPECTION,
}

REQUIRED_FIELDS = {
    ReportType.NEAR_MISS: ["title", "description", "occurred_at", "location_description", "category"],
    ReportType.INCIDENT: ["title", "description", "occurred_at", "location_description", "incident_type", "severity_actual"],
    ReportType.DAILY_SAFETY_LOG: ["title", "description", "occurred_at", "location_description"],
    ReportType.SHIFT_HANDOVER: ["title", "description", "occurred_at", "location_description", "outgoing_shift", "incoming_shift", "handover_time"],
    ReportType.TOOLBOX_TALK: ["title", "description", "occurred_at", "location_description", "topic", "meeting_time", "duration_minutes"],
    ReportType.PTW_EVIDENCE: ["title", "description", "occurred_at", "location_description", "ptw_number", "ptw_type", "work_description"],
    ReportType.LOTO_EVIDENCE: ["title", "description", "occurred_at", "location_description", "equipment_name"],
    ReportType.SPILL_REPORT: ["title", "description", "occurred_at", "location_description", "spill_type", "material_name"],
    ReportType.INSPECTION: ["title", "description", "occurred_at", "location_description", "inspection_type", "inspection_date"],
}

FIELD_LABELS = {
    "title": "short title",
    "description": "description",
    "occurred_at": "when it occurred (date/time)",
    "location_description": "location",
    "category": "near-miss category",
    "incident_type": "incident type",
    "severity_actual": "incident severity",
    "outgoing_shift": "outgoing shift",
    "incoming_shift": "incoming shift",
    "handover_time": "handover time",
    "topic": "toolbox talk topic",
    "meeting_time": "meeting time",
    "duration_minutes": "meeting duration (minutes)",
    "ptw_number": "PTW number",
    "ptw_type": "PTW type",
    "work_description": "work description",
    "equipment_name": "equipment name",
    "spill_type": "spill type",
    "material_name": "material name",
    "inspection_type": "inspection type",
    "inspection_date": "inspection date",
}

# Field name aliases for flexible parsing
FIELD_ALIASES = {
    "desc": "description",
    "details": "description",
    "what happened": "description",
    "location": "location_description",
    "where": "location_description",
    "place": "location_description",
    "when": "occurred_at",
    "time": "occurred_at",
    "date": "occurred_at",
    "datetime": "occurred_at",
    "type": "incident_type",
    "severity": "severity_actual",
    "cat": "category",
}

FIELD_OPTIONS = {
    "category": [c.value for c in NearMissCategory],
    "incident_type": [c.value for c in IncidentType],
    "severity_actual": [c.value for c in SeverityLevel],
    "spill_type": [c.value for c in SpillType],
    "inspection_type": [c.value for c in InspectionType],
    "ptw_type": [c.value for c in PTWType],
}

def normalize_text(value: str) -> str:
    """Normalize text for comparison - handles common variations."""
    return (
        value.strip()
        .lower()
        .replace("_", " ")
        .replace("-", " ")
        .replace(",", "")  # Remove trailing commas
        .replace(".", "")  # Remove trailing periods
        .strip()
    )


def parse_enum(enum_cls, value: str):
    """Parse enum with fuzzy matching - handles variations like 'vehicle-related' → 'vehicle'."""
    if not value:
        return None
    normalized = normalize_text(value)

    # First try exact match
    for item in enum_cls:
        if normalized == normalize_text(item.value):
            return item

    # Try partial match (e.g., "vehicle-related" contains "vehicle")
    for item in enum_cls:
        item_normalized = normalize_text(item.value)
        if item_normalized in normalized or normalized in item_normalized:
            return item

    # Try matching first word (e.g., "slip trip fall" matches on "slip")
    first_word = normalized.split()[0] if normalized else ""
    for item in enum_cls:
        item_first = normalize_text(item.value).split()[0] if item.value else ""
        if first_word == item_first:
            return item

    return None


def parse_datetime_value(value: str) -> Optional[datetime]:
    """Parse datetime with support for relative terms like 'today', 'yesterday', 'this morning'."""
    if not value:
        return None

    now = datetime.now(timezone.utc)
    lowered = value.lower().strip()

    # Extract time first (e.g., "8:30am", "2pm", "14:00", "11am")
    hour, minute = None, 0
    time_patterns = [
        r'(\d{1,2}):(\d{2})\s*(am|pm)',  # 8:30am, 8:30pm
        r'(\d{1,2}):(\d{2})',  # 14:00, 08:30
        r'(\d{1,2})\s*(am|pm)',  # 2pm, 8am, 11am
    ]

    for pattern in time_patterns:
        match = re.search(pattern, lowered, re.IGNORECASE)
        if match:
            groups = match.groups()
            hour = int(groups[0])

            # Handle minutes
            if len(groups) >= 2 and groups[1] and groups[1].isdigit():
                minute = int(groups[1])

            # Handle am/pm
            am_pm = None
            for g in groups:
                if g and g.lower() in ('am', 'pm'):
                    am_pm = g.lower()
                    break

            if am_pm == 'pm' and hour < 12:
                hour += 12
            elif am_pm == 'am' and hour == 12:
                hour = 0
            break

    # Determine base date
    base_date = now.date()
    is_relative = False

    if "today" in lowered or "this morning" in lowered or "this afternoon" in lowered or "this evening" in lowered:
        base_date = now.date()
        is_relative = True
    elif "yesterday" in lowered:
        base_date = now.date() - timedelta(days=1)
        is_relative = True
    elif "tomorrow" in lowered:
        base_date = now.date() + timedelta(days=1)
        is_relative = True

    # If we have a time and it's a relative reference (or no specific date found), use base_date
    if hour is not None and is_relative:
        return datetime(base_date.year, base_date.month, base_date.day, hour, minute, tzinfo=timezone.utc)

    # Handle time-of-day references without specific time
    if is_relative and hour is None:
        if 'morning' in lowered:
            hour = 9
        elif 'lunch' in lowered:
            hour = 12
        elif 'afternoon' in lowered:
            hour = 14
        elif 'evening' in lowered:
            hour = 18
        else:
            hour = now.hour
        return datetime(base_date.year, base_date.month, base_date.day, hour, minute, tzinfo=timezone.utc)

    # If we found a time but no relative indicator, assume today
    if hour is not None:
        return datetime(now.year, now.month, now.day, hour, minute, tzinfo=timezone.utc)

    # Fall back to dateutil parser
    try:
        parsed = date_parser.parse(value, fuzzy=True, default=now)
    except (ValueError, TypeError):
        return None

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)

    # If the parsed year is in the past, assume current year
    if parsed.year < now.year:
        parsed = parsed.replace(year=now.year)

    return parsed


def parse_date_value(value: str) -> Optional[date]:
    parsed = parse_datetime_value(value)
    return parsed.date() if parsed else None


def parse_int(value: str) -> Optional[int]:
    try:
        return int("".join(ch for ch in value if ch.isdigit()))
    except (TypeError, ValueError):
        return None


PARSERS = {
    "category": lambda v: parse_enum(NearMissCategory, v),
    "incident_type": lambda v: parse_enum(IncidentType, v),
    "severity_actual": lambda v: parse_enum(SeverityLevel, v),
    "spill_type": lambda v: parse_enum(SpillType, v),
    "inspection_type": lambda v: parse_enum(InspectionType, v),
    "ptw_type": lambda v: parse_enum(PTWType, v),
    "occurred_at": parse_datetime_value,
    "handover_time": parse_datetime_value,
    "meeting_time": parse_datetime_value,
    "inspection_date": parse_date_value,
    "duration_minutes": parse_int,
}


def detect_report_type(message: str) -> Optional[ReportType]:
    lowered = normalize_text(message)
    for alias, report_type in REPORT_TYPE_ALIASES.items():
        if alias in lowered:
            return report_type
    return None


def get_missing_fields(report_type: ReportType, fields: Dict[str, Any]) -> List[str]:
    missing = []
    for field in REQUIRED_FIELDS.get(report_type, []):
        if fields.get(field) in (None, "", []):
            missing.append(field)
    return missing


def format_summary(report_type: ReportType, fields: Dict[str, Any]) -> str:
    """Format a concise summary for WhatsApp display."""
    report_type_label = report_type.value.replace("_", " ").title()
    lines = [f"📋 *{report_type_label}*\n"]

    # Shorter labels for WhatsApp
    short_labels = {
        "title": "Title",
        "description": "Details",
        "occurred_at": "When",
        "location_description": "Where",
        "category": "Category",
        "incident_type": "Type",
        "severity_actual": "Severity",
        "outgoing_shift": "From Shift",
        "incoming_shift": "To Shift",
        "handover_time": "Time",
        "topic": "Topic",
        "meeting_time": "Time",
        "duration_minutes": "Duration",
        "ptw_number": "PTW #",
        "ptw_type": "Type",
        "work_description": "Work",
        "equipment_name": "Equipment",
        "spill_type": "Type",
        "material_name": "Material",
        "inspection_type": "Type",
        "inspection_date": "Date",
    }

    for key in REQUIRED_FIELDS.get(report_type, []):
        value = fields.get(key)
        if value is None:
            continue

        # Format value based on type
        if isinstance(value, str) and 'T' in value and len(value) > 10:
            # ISO datetime string - parse and format nicely
            try:
                dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
                value = dt.strftime("%d %b, %I:%M %p").lstrip("0")
            except:
                pass
        elif isinstance(value, datetime):
            value = value.strftime("%d %b, %I:%M %p").lstrip("0")
        elif isinstance(value, date):
            value = value.strftime("%d %b %Y")
        elif hasattr(value, "value"):
            value = value.value.replace("_", " ").title()
        elif isinstance(value, str):
            # Truncate long descriptions
            if len(value) > 60:
                value = value[:57] + "..."

        label = short_labels.get(key, key.replace("_", " ").title())
        lines.append(f"• *{label}:* {value}")

    return "\n".join(lines)


def parse_field_value(field: str, message: str) -> Tuple[Optional[Any], Optional[str]]:
    parser = PARSERS.get(field)
    if parser:
        parsed = parser(message)
        if parsed is None:
            options = FIELD_OPTIONS.get(field)
            if options:
                formatted_options = [opt.replace("_", " ").title() for opt in options]
                return None, (
                    f"Hmm, I didn't quite catch that. 🤔\n\n"
                    f"For *{FIELD_LABELS.get(field, field)}*, please choose one of these:\n"
                    f"{', '.join(formatted_options)}"
                )
            return None, f"I need a valid {FIELD_LABELS.get(field, field)}. Could you try again?"
        if isinstance(parsed, datetime):
            return parsed.isoformat(), None
        if isinstance(parsed, date):
            return parsed.isoformat(), None
        if hasattr(parsed, "value"):
            return parsed.value, None
        return parsed, None
    if not message.strip():
        return None, f"I need a valid {FIELD_LABELS.get(field, field)}. Could you try again?"
    return message.strip(), None


def is_confirm(message: str) -> bool:
    return normalize_text(message) in CONFIRM_WORDS


def is_cancel(message: str) -> bool:
    return normalize_text(message) in CANCEL_WORDS


async def generate_reference_number(
    db: AsyncSession,
    report_type: ReportType,
) -> str:
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    prefix = f"XP-{REPORT_TYPE_PREFIX[report_type]}-{today}"
    lock_key = int.from_bytes(hashlib.sha256(prefix.encode()).digest()[:8], "big", signed=True)
    await db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": lock_key})

    result = await db.execute(
        select(func.count())
        .select_from(Report)
        .where(Report.reference_number.like(f"{prefix}-%"))
    )
    count = result.scalar() or 0
    return f"{prefix}-{count + 1:04d}"


async def create_report_from_draft(
    db: AsyncSession,
    user: User,
    conversation_id: Optional[uuid.UUID],
    draft: Dict[str, Any],
    request_meta: Optional[Dict[str, str]] = None,
) -> Report:
    report_type = ReportType(draft["report_type"])
    fields = draft.get("fields", {})

    def coerce(field: str, value: Any) -> Any:
        if value is None:
            return None
        parser = PARSERS.get(field)
        if not parser:
            return value
        return parser(value) if isinstance(value, str) else value

    coerced = {key: coerce(key, value) for key, value in fields.items()}
    reference_number = await generate_reference_number(db, report_type)

    report = Report(
        reference_number=reference_number,
        report_type=report_type,
        reporter_id=user.id,
        site_id=user.site_id,
        title=coerced["title"],
        description=coerced["description"],
        location_description=coerced["location_description"],
        occurred_at=coerced["occurred_at"],
        reported_at=datetime.now(timezone.utc),
        submitted_at=datetime.now(timezone.utc),
        status=ReportStatus.SUBMITTED,
        source="chat",
        conversation_id=conversation_id,
    )
    db.add(report)
    await db.flush()

    if report_type == ReportType.NEAR_MISS:
        db.add(NearMissDetails(
            report_id=report.id,
            category=coerced["category"],
            potential_severity=PotentialSeverity.MEDIUM,
        ))
    elif report_type == ReportType.INCIDENT:
        db.add(IncidentDetails(
            report_id=report.id,
            incident_type=coerced["incident_type"],
            severity_actual=coerced["severity_actual"],
        ))
    elif report_type == ReportType.SHIFT_HANDOVER:
        db.add(ShiftHandoverDetails(
            report_id=report.id,
            outgoing_shift=coerced["outgoing_shift"],
            incoming_shift=coerced["incoming_shift"],
            handover_time=coerced["handover_time"],
        ))
    elif report_type == ReportType.TOOLBOX_TALK:
        db.add(ToolboxTalkDetails(
            report_id=report.id,
            topic=coerced["topic"],
            meeting_time=coerced["meeting_time"],
            duration_minutes=coerced["duration_minutes"],
        ))
    elif report_type == ReportType.PTW_EVIDENCE:
        db.add(PTWEvidenceDetails(
            report_id=report.id,
            ptw_number=coerced["ptw_number"],
            ptw_type=coerced["ptw_type"],
            work_description=coerced["work_description"],
        ))
    elif report_type == ReportType.LOTO_EVIDENCE:
        db.add(LOTOEvidenceDetails(
            report_id=report.id,
            equipment_name=coerced["equipment_name"],
        ))
    elif report_type == ReportType.SPILL_REPORT:
        db.add(SpillReportDetails(
            report_id=report.id,
            spill_type=coerced["spill_type"],
            material_name=coerced["material_name"],
        ))
    elif report_type == ReportType.INSPECTION:
        db.add(InspectionDetails(
            report_id=report.id,
            inspection_type=coerced["inspection_type"],
            inspection_date=coerced["inspection_date"],
        ))

    await create_audit_entry(
        db=db,
        report=report,
        action=AuditAction.SUBMITTED,
        actor=user,
        field_changed="status",
        old_value=None,
        new_value={"status": report.status.value},
        notes="Report submitted via chat",
        source=report.source,
        request_id=request_meta.get("request_id") if request_meta else None,
        ip_address=request_meta.get("client_ip") if request_meta else None,
        user_agent=request_meta.get("user_agent") if request_meta else None,
    )

    return report


def merge_extracted_fields(
    draft: Dict[str, Any],
    extracted: Dict[str, Any],
) -> None:
    """Merge extracted fields into draft, handling aliases."""
    fields = draft.setdefault("fields", {})
    for key, value in (extracted or {}).items():
        if value in (None, "", []):
            continue

        # Normalize key using aliases
        normalized_key = FIELD_ALIASES.get(key.lower(), key)

        if fields.get(normalized_key) in (None, "", []):
            fields[normalized_key] = value


def process_message(
    message: str,
    draft: Optional[Dict[str, Any]],
    extracted: Optional[Dict[str, Any]] = None,
    intent: Optional[str] = None,
) -> Tuple[Optional[Dict[str, Any]], str, Optional[str]]:
    if not draft:
        report_type = None
        if extracted and extracted.get("report_type"):
            try:
                report_type = ReportType(extracted["report_type"])
            except ValueError:
                report_type = None
        if not report_type:
            report_type = detect_report_type(message)
        if not report_type:
            # Check for healthcare intent first
            healthcare_intent = detect_healthcare_intent(message)
            if healthcare_intent:
                response = get_healthcare_response(healthcare_intent, message)
                if response:
                    return None, response, None

            # Default Xappy greeting
            return None, (
                "Hi, I'm Xappy! 👋 Your trusted healthcare companion.\n\n"
                "I can help you with:\n"
                "🔍 *Find Care* - Hospitals & doctors nearby\n"
                "🩺 *Symptom Check* - Get guidance on symptoms\n"
                "💉 *Vaccinations* - Programs & schedules\n"
                "📋 *Lab Reports* - Understand your results\n"
                "💡 *Health Tips* - Daily wellness advice\n"
                "🆘 *Emergency Help* - Quick access to help\n\n"
                "How can I help you today? Just type your question!"
            ), None
        draft = {
            "report_type": report_type.value,
            "fields": {},
            "pending_field": None,
            "stage": "collecting",
        }

        # Merge extracted fields from LLM immediately
        extracted_fields = extracted.get("fields") if extracted else None
        if extracted_fields:
            merge_extracted_fields(draft, extracted_fields)

        # Add friendly acknowledgement for report type
        report_type_greetings = {
            ReportType.NEAR_MISS: "Got it! 📝 Let's log that *near miss* report.",
            ReportType.INCIDENT: "I'll help you report that *incident* right away. 🚨",
            ReportType.SPILL_REPORT: "Let's document that *spill* incident. 💧",
            ReportType.INSPECTION: "Starting an *inspection* log. ✅",
            ReportType.SHIFT_HANDOVER: "Let's record this *shift handover*. 📋",
            ReportType.TOOLBOX_TALK: "I'll help you log that *toolbox talk*. 🗣️",
            ReportType.DAILY_SAFETY_LOG: "Let's create your *daily safety log*. 📊",
            ReportType.PTW_EVIDENCE: "Recording *permit to work* evidence. 📄",
            ReportType.LOTO_EVIDENCE: "Let's document the *LOTO* procedure. 🔒",
        }
        greeting = report_type_greetings.get(report_type, f"Starting a *{report_type.value.replace('_', ' ')}* report.")

        # Check what fields are still missing after extraction
        missing = get_missing_fields(report_type, draft["fields"])

        # If all fields are filled, go straight to confirmation
        if not missing:
            summary = format_summary(report_type, draft["fields"])
            draft["stage"] = "confirming"
            return draft, (
                f"{greeting}\n\n"
                "I've got all the details from your message! Here's your report:\n\n"
                f"{summary}\n\n"
                "Does this look correct? Reply *yes* to submit or *no* to discard."
            ), None

        # Otherwise ask for the first missing field
        next_field = missing[0]
        draft["pending_field"] = next_field
        friendly_prompts = {
            "title": "What should we call this report? Give me a brief title.",
            "description": "Can you describe what happened?",
            "occurred_at": "When did this happen?",
            "location_description": "Where did this occur?",
        }
        first_prompt = friendly_prompts.get(next_field, f"What's the {FIELD_LABELS.get(next_field, next_field)}?")

        # Show progress if some fields were extracted
        filled_count = len(REQUIRED_FIELDS.get(report_type, [])) - len(missing)
        if filled_count > 0:
            return draft, f"{greeting}\n\nI got {filled_count} details from your message. Just need a few more:\n\n{first_prompt}", None
        else:
            return draft, f"{greeting}\n\n{first_prompt}", None

    # NOTE: Do NOT change report_type once draft is created
    # The LLM might extract "incident" from descriptions, which would break the flow

    extracted_fields = extracted.get("fields") if extracted else None
    if extracted_fields:
        merge_extracted_fields(draft, extracted_fields)

    if draft.get("stage") == "confirming":
        if intent == "confirm" or is_confirm(message):
            return draft, "Perfect! ✨ Submitting your report now...", "submit"
        if intent == "cancel" or is_cancel(message):
            return None, "No problem, I've discarded that draft. 👍\n\nJust let me know when you want to report something else!", "cancel"

        # Check if user is starting a completely new report instead of confirming
        new_report_type = detect_report_type(message)
        if new_report_type:
            # User wants to start a new report - discard old draft and start fresh
            draft = {
                "report_type": new_report_type.value,
                "fields": {},
                "pending_field": None,
                "stage": "collecting",
            }
            # Merge any extracted fields
            extracted_fields = extracted.get("fields") if extracted else None
            if extracted_fields:
                merge_extracted_fields(draft, extracted_fields)

            # Return the new report flow
            report_type_greetings = {
                ReportType.NEAR_MISS: "Got it! 📝 Let's log that *near miss* report.",
                ReportType.INCIDENT: "I'll help you report that *incident* right away. 🚨",
                ReportType.SPILL_REPORT: "Let's document that *spill* incident. 💧",
                ReportType.INSPECTION: "Starting an *inspection* log. ✅",
                ReportType.SHIFT_HANDOVER: "Let's record this *shift handover*. 📋",
                ReportType.TOOLBOX_TALK: "I'll help you log that *toolbox talk*. 🗣️",
                ReportType.DAILY_SAFETY_LOG: "Let's create your *daily safety log*. 📊",
                ReportType.PTW_EVIDENCE: "Recording *permit to work* evidence. 📄",
                ReportType.LOTO_EVIDENCE: "Let's document the *LOTO* procedure. 🔒",
            }
            greeting = report_type_greetings.get(new_report_type, f"Starting a *{new_report_type.value.replace('_', ' ')}* report.")

            missing = get_missing_fields(new_report_type, draft["fields"])
            if not missing:
                summary = format_summary(new_report_type, draft["fields"])
                draft["stage"] = "confirming"
                return draft, (
                    f"{greeting}\n\n"
                    "I've got all the details from your message! Here's your report:\n\n"
                    f"{summary}\n\n"
                    "Does this look correct? Reply *yes* to submit or *no* to discard."
                ), None

            next_field = missing[0]
            draft["pending_field"] = next_field
            filled_count = len(REQUIRED_FIELDS.get(new_report_type, [])) - len(missing)
            if filled_count > 0:
                first_prompt = f"Just need a few more details. What's the {FIELD_LABELS.get(next_field, next_field)}?"
                return draft, f"{greeting}\n\nI got {filled_count} details. {first_prompt}", None
            else:
                friendly_prompts = {
                    "title": "What should we call this report?",
                    "description": "Can you describe what happened?",
                }
                first_prompt = friendly_prompts.get(next_field, f"What's the {FIELD_LABELS.get(next_field, next_field)}?")
                return draft, f"{greeting}\n\n{first_prompt}", None

        return draft, "Would you like me to submit this report?\n\nReply *yes* to submit or *no* to discard.", None

    pending_field = draft.get("pending_field")
    if pending_field:
        if extracted_fields and extracted_fields.get(pending_field) not in (None, "", []):
            draft["fields"][pending_field] = extracted_fields[pending_field]
            draft["pending_field"] = None
        else:
            parsed, error = parse_field_value(pending_field, message)
            if error:
                return draft, error, None
            draft["fields"][pending_field] = parsed
            draft["pending_field"] = None

    report_type = ReportType(draft["report_type"])
    missing = get_missing_fields(report_type, draft["fields"])
    if missing:
        next_field = missing[0]
        draft["pending_field"] = next_field
        prompt = FIELD_LABELS.get(next_field, next_field)
        options = FIELD_OPTIONS.get(next_field)

        # Conversational prompts based on field type
        friendly_prompts = {
            "title": "What should we call this report? Give me a brief title.",
            "description": "Can you describe what happened in more detail?",
            "occurred_at": "When did this happen? (e.g., 'today at 2pm' or 'yesterday morning')",
            "location_description": "Where did this occur? (e.g., 'near pump station 3')",
            "category": "What category best fits this near miss?",
            "incident_type": "What type of incident was this?",
            "severity_actual": "How severe was this incident?",
            "spill_type": "What type of spill was it?",
            "material_name": "What material was spilled?",
            "inspection_type": "What type of inspection is this?",
            "inspection_date": "When was this inspection conducted?",
            "topic": "What was the toolbox talk topic?",
            "meeting_time": "When did the meeting take place?",
            "duration_minutes": "How long was the meeting? (in minutes)",
            "outgoing_shift": "Which shift is handing over?",
            "incoming_shift": "Which shift is taking over?",
            "handover_time": "What time is the handover?",
            "ptw_number": "What's the PTW number?",
            "ptw_type": "What type of permit is this?",
            "work_description": "Briefly describe the work being done.",
            "equipment_name": "What equipment was locked out?",
        }

        base_prompt = friendly_prompts.get(next_field, f"Please provide the {prompt}.")

        if options:
            formatted_options = [opt.replace("_", " ").title() for opt in options]
            return draft, f"{base_prompt}\n\nOptions: {', '.join(formatted_options)}", None
        return draft, base_prompt, None

    summary = format_summary(report_type, draft["fields"])
    draft["stage"] = "confirming"
    return draft, (
        "Great! ✅ I've got all the details. Here's your report:\n\n"
        f"{summary}\n\n"
        "Does this look correct? Reply *yes* to submit or *no* to discard."
    ), None


def detect_query_intent(message: str) -> Optional[Dict[str, Any]]:
    """Detect if the message is asking about existing reports."""
    lowered = normalize_text(message)

    # Check for query patterns
    query_type = None
    for qtype, patterns in QUERY_PATTERNS.items():
        for pattern in patterns:
            if pattern in lowered:
                query_type = qtype
                break
        if query_type:
            break

    if not query_type:
        return None

    # Detect if asking about specific report type
    report_type = None
    for alias, rtype in REPORT_TYPE_ALIASES.items():
        if alias in lowered:
            report_type = rtype
            break

    # Detect status filter
    status_filter = None
    status_keywords = {
        "pending": "submitted",  # Map pending to submitted
        "submitted": "submitted",
        "acknowledged": "acknowledged",
        "closed": "closed",
        "under review": "under_review",
        "archived": "archived",
    }
    for keyword, status_value in status_keywords.items():
        if keyword in lowered:
            status_filter = status_value
            break

    return {
        "query_type": query_type,
        "report_type": report_type.value if report_type else None,
        "status_filter": status_filter,
    }


async def query_reports(
    db: AsyncSession,
    user: User,
    query_intent: Dict[str, Any],
) -> str:
    """Execute a report query and return a formatted response."""
    query_type = query_intent.get("query_type", "count")
    report_type_filter = query_intent.get("report_type")
    status_filter = query_intent.get("status_filter")

    # Build base query
    base_query = select(Report).where(Report.reporter_id == user.id)

    if report_type_filter:
        base_query = base_query.where(Report.report_type == ReportType(report_type_filter))

    if status_filter:
        base_query = base_query.where(Report.status == ReportStatus(status_filter.lower()))

    if query_type == "count":
        # Count reports
        count_query = select(func.count()).select_from(base_query.subquery())
        result = await db.execute(count_query)
        count = result.scalar() or 0

        # Build descriptive filter text
        filter_parts = []
        if status_filter:
            filter_parts.append(status_filter)
        if report_type_filter:
            # Make report type readable
            readable_type = report_type_filter.replace("_", " ")
            filter_parts.append(readable_type)

        filter_text = " ".join(filter_parts) + " " if filter_parts else ""
        report_word = "report" if count == 1 else "reports"

        if count == 0:
            if filter_parts:
                return f"📊 You don't have any {filter_text.strip()} reports."
            return "📊 You don't have any reports yet. Start by saying 'I want to report a near miss' or similar."

        # Clean up filter text (replace underscores with spaces)
        filter_text_clean = filter_text.replace("_", " ")

        # Avoid "report report" duplication
        if filter_text_clean and "report" in filter_text_clean.lower():
            return f"📊 You have *{count}* {filter_text_clean.strip()}{'s' if count != 1 else ''}."

        return f"📊 You have *{count}* {filter_text_clean}{report_word}."

    elif query_type in ("list", "status"):
        # List recent reports
        list_query = base_query.order_by(Report.created_at.desc()).limit(5)
        result = await db.execute(list_query)
        reports = result.scalars().all()

        if not reports:
            if report_type_filter or status_filter:
                filter_desc = []
                if status_filter:
                    filter_desc.append(status_filter)
                if report_type_filter:
                    filter_desc.append(report_type_filter.replace("_", " "))
                return f"📋 No {' '.join(filter_desc)} reports found."
            return "📋 You don't have any reports yet.\n\n💡 _Tip:_ Start by saying 'I want to report a near miss' or 'report an incident'."

        # Build header
        filter_desc = ""
        if status_filter or report_type_filter:
            parts = []
            if status_filter:
                parts.append(status_filter)
            if report_type_filter:
                parts.append(report_type_filter.replace("_", " "))
            filter_desc = f" ({' '.join(parts)})"

        lines = [f"📋 *Your Recent Reports{filter_desc}:*\n"]

        for i, r in enumerate(reports, 1):
            status_emoji = {
                ReportStatus.SUBMITTED: "🟡",
                ReportStatus.ACKNOWLEDGED: "🟢",
                ReportStatus.CLOSED: "✅",
                ReportStatus.DRAFT: "⚪",
                ReportStatus.UNDER_REVIEW: "🔵",
                ReportStatus.ARCHIVED: "📁",
            }.get(r.status, "📄")

            date_str = r.created_at.strftime("%d %b %Y") if r.created_at else "N/A"
            type_label = r.report_type.value.replace("_", " ").title()

            lines.append(f"{i}. {status_emoji} *{r.title}*")
            lines.append(f"   Ref: {r.reference_number} | Type: {type_label}")
            lines.append(f"   Status: {r.status.value.title()} | Date: {date_str}")
            lines.append("")

        # Add summary counts by status
        count_query = (
            select(Report.status, func.count())
            .where(Report.reporter_id == user.id)
            .group_by(Report.status)
        )
        result = await db.execute(count_query)
        counts = {row[0].value: row[1] for row in result.all()}

        if counts:
            total = sum(counts.values())
            lines.append(f"📊 *Summary:* {total} total reports")
            summary_parts = [f"{status.replace('_', ' ').title()}: {cnt}" for status, cnt in counts.items()]
            lines.append("   " + " | ".join(summary_parts))

        return "\n".join(lines)

    return "❓ I can help you check your reports.\n\n*Try asking:*\n• 'How many reports do I have?'\n• 'Show my reports'\n• 'List my near miss reports'"


def build_field_definitions(
    report_type: ReportType,
    fields: Dict[str, Any],
    pending_field: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Build structured field definitions for frontend rendering."""
    definitions = []
    required = REQUIRED_FIELDS.get(report_type, [])

    for field_name in required:
        value = fields.get(field_name)

        # Determine field type
        if field_name in FIELD_OPTIONS:
            field_type = "enum"
        elif field_name in ("occurred_at", "handover_time", "meeting_time"):
            field_type = "datetime"
        elif field_name == "inspection_date":
            field_type = "date"
        elif field_name == "duration_minutes":
            field_type = "number"
        else:
            field_type = "text"

        # Format value for display
        display_value = value
        if value is not None:
            if hasattr(value, "value"):
                display_value = value.value
            elif isinstance(value, (datetime, date)):
                display_value = value.isoformat()

        # Get options for enum fields
        options = FIELD_OPTIONS.get(field_name)
        formatted_options = None
        if options:
            formatted_options = [opt.replace("_", " ").title() for opt in options]

        definitions.append({
            "name": field_name,
            "label": FIELD_LABELS.get(field_name, field_name.replace("_", " ").title()),
            "field_type": field_type,
            "options": formatted_options,
            "value": display_value,
            "is_valid": value not in (None, "", []),
        })

    return definitions


def build_draft_state(draft: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Build complete draft state for frontend rendering."""
    if not draft:
        return None

    report_type_str = draft.get("report_type")
    if not report_type_str:
        return None

    try:
        report_type = ReportType(report_type_str)
    except ValueError:
        return None

    fields = draft.get("fields", {})
    pending_field = draft.get("pending_field")
    field_definitions = build_field_definitions(report_type, fields, pending_field)

    filled = sum(1 for f in field_definitions if f["is_valid"])
    total = len(field_definitions)

    return {
        "report_type": report_type.value,
        "report_type_label": report_type.value.replace("_", " ").title(),
        "stage": draft.get("stage", "collecting"),
        "fields": field_definitions,
        "filled_count": filled,
        "total_required": total,
        "progress_percent": round((filled / total * 100), 1) if total > 0 else 0,
        "next_field": pending_field,
        "is_complete": filled == total,
    }


def build_quick_actions(
    draft: Optional[Dict[str, Any]],
    pending_field: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Build quick action buttons for current context."""
    actions = []

    if not draft:
        return actions

    stage = draft.get("stage", "collecting")

    if stage == "confirming":
        actions.extend([
            {
                "action_type": "confirm",
                "label": "Submit Report",
                "value": "confirm",
                "field_name": None,
            },
            {
                "action_type": "cancel",
                "label": "Discard",
                "value": "cancel",
                "field_name": None,
            },
        ])
    elif stage == "collecting" and pending_field:
        # Show options for enum fields
        if pending_field in FIELD_OPTIONS:
            for option in FIELD_OPTIONS[pending_field]:
                actions.append({
                    "action_type": "field_option",
                    "label": option.replace("_", " ").title(),
                    "value": option,
                    "field_name": pending_field,
                })

    return actions


def apply_field_updates(
    draft: Dict[str, Any],
    updates: List[Dict[str, Any]],
) -> Tuple[Dict[str, Any], List[str]]:
    """Apply direct field updates from click-to-edit."""
    errors = []
    fields = draft.setdefault("fields", {})

    for update in updates:
        field_name = update.get("field_name") or update.get("fieldName")
        value = update.get("value")

        if not field_name:
            continue

        parsed, error = parse_field_value(field_name, str(value) if value else "")
        if error:
            errors.append(f"{FIELD_LABELS.get(field_name, field_name)}: {error}")
        else:
            fields[field_name] = parsed

    # Clear pending field if it was just filled
    if draft.get("pending_field") in fields and fields.get(draft.get("pending_field")):
        draft["pending_field"] = None

    return draft, errors
