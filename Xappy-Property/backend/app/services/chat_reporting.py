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
from app.models.construction_progress import ConstructionProgressDetails, ProgressStatus, WeatherCondition
from app.models.defect_report import DefectReportDetails, DefectCategory, DefectPriority, DefectStatus
from app.models.incident import IncidentDetails, IncidentType, SeverityLevel
from app.models.shift_handover import ShiftHandoverDetails
from app.models.toolbox_talk import ToolboxTalkDetails
from app.models.inspection import InspectionDetails, InspectionType
from app.models.user import User
from app.models.audit_trail import AuditAction
from app.services.audit import create_audit_entry


CONFIRM_WORDS = {"yes", "y", "confirm", "submit", "ok", "okay"}
CANCEL_WORDS = {"no", "cancel", "stop", "discard", "exit"}

# Query intent patterns
QUERY_PATTERNS = {
    "count": ["how many", "count", "total", "number of"],
    "list": ["show", "list", "view", "display", "my reports", "get reports"],
    "status": ["status", "pending", "submitted", "acknowledged", "closed"],
}

REPORT_TYPE_ALIASES = {
    # Construction Progress
    "progress": ReportType.CONSTRUCTION_PROGRESS,
    "construction progress": ReportType.CONSTRUCTION_PROGRESS,
    "daily progress": ReportType.CONSTRUCTION_PROGRESS,
    "site progress": ReportType.CONSTRUCTION_PROGRESS,
    # Defect/Snag
    "defect": ReportType.DEFECT_SNAG,
    "snag": ReportType.DEFECT_SNAG,
    "defect snag": ReportType.DEFECT_SNAG,
    "punch list": ReportType.DEFECT_SNAG,
    "snagging": ReportType.DEFECT_SNAG,
    # Safety Incident
    "incident": ReportType.SAFETY_INCIDENT,
    "safety incident": ReportType.SAFETY_INCIDENT,
    "accident": ReportType.SAFETY_INCIDENT,
    # Site Inspection
    "inspection": ReportType.SITE_INSPECTION,
    "site inspection": ReportType.SITE_INSPECTION,
    "quality check": ReportType.SITE_INSPECTION,
    # Daily Progress Log
    "daily log": ReportType.DAILY_PROGRESS_LOG,
    "daily report": ReportType.DAILY_PROGRESS_LOG,
    # Shift Handover
    "shift handover": ReportType.SHIFT_HANDOVER,
    "handover": ReportType.SHIFT_HANDOVER,
    # Toolbox Talk
    "toolbox": ReportType.TOOLBOX_TALK,
    "toolbox talk": ReportType.TOOLBOX_TALK,
    "safety talk": ReportType.TOOLBOX_TALK,
}

REQUIRED_FIELDS = {
    ReportType.CONSTRUCTION_PROGRESS: ["title", "description", "occurred_at", "location_description", "building_block", "actual_progress_percent"],
    ReportType.DEFECT_SNAG: ["title", "description", "occurred_at", "location_description", "category", "priority"],
    ReportType.SAFETY_INCIDENT: ["title", "description", "occurred_at", "location_description", "incident_type", "severity_actual"],
    ReportType.SITE_INSPECTION: ["title", "description", "occurred_at", "location_description", "inspection_type", "inspection_date"],
    ReportType.DAILY_PROGRESS_LOG: ["title", "description", "occurred_at", "location_description"],
    ReportType.SHIFT_HANDOVER: ["title", "description", "occurred_at", "location_description", "outgoing_shift", "incoming_shift", "handover_time"],
    ReportType.TOOLBOX_TALK: ["title", "description", "occurred_at", "location_description", "topic", "meeting_time", "duration_minutes"],
}

FIELD_LABELS = {
    "title": "short title",
    "description": "description",
    "occurred_at": "when it occurred (date/time)",
    "location_description": "location",
    # Construction Progress
    "building_block": "building/tower/block",
    "floor_level": "floor level",
    "actual_progress_percent": "actual progress (%)",
    "workers_present": "workers on site",
    "weather_conditions": "weather conditions",
    "delays_if_any": "delays if any",
    # Defect/Snag
    "category": "defect category",
    "priority": "priority level",
    "unit_number": "unit/flat number",
    "contractor_responsible": "responsible contractor",
    "target_completion_date": "target completion date",
    # Incident
    "incident_type": "incident type",
    "severity_actual": "severity level",
    # Inspection
    "inspection_type": "inspection type",
    "inspection_date": "inspection date",
    # Shift Handover
    "outgoing_shift": "outgoing shift",
    "incoming_shift": "incoming shift",
    "handover_time": "handover time",
    # Toolbox Talk
    "topic": "toolbox talk topic",
    "meeting_time": "meeting time",
    "duration_minutes": "meeting duration (minutes)",
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
    "block": "building_block",
    "tower": "building_block",
    "building": "building_block",
    "floor": "floor_level",
    "progress": "actual_progress_percent",
    "unit": "unit_number",
    "flat": "unit_number",
    "apartment": "unit_number",
}

FIELD_OPTIONS = {
    "category": [c.value for c in DefectCategory],
    "priority": [c.value for c in DefectPriority],
    "incident_type": [c.value for c in IncidentType],
    "severity_actual": [c.value for c in SeverityLevel],
    "inspection_type": [c.value for c in InspectionType],
    "weather_conditions": [c.value for c in WeatherCondition],
    "progress_status": [c.value for c in ProgressStatus],
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
    """Parse enum with fuzzy matching - handles variations."""
    if not value:
        return None
    normalized = normalize_text(value)

    # First try exact match
    for item in enum_cls:
        if normalized == normalize_text(item.value):
            return item

    # Try partial match
    for item in enum_cls:
        item_normalized = normalize_text(item.value)
        if item_normalized in normalized or normalized in item_normalized:
            return item

    # Try matching first word
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


def parse_float(value: str) -> Optional[float]:
    try:
        return float("".join(ch for ch in value if ch.isdigit() or ch == '.'))
    except (TypeError, ValueError):
        return None


PARSERS = {
    "category": lambda v: parse_enum(DefectCategory, v),
    "priority": lambda v: parse_enum(DefectPriority, v),
    "incident_type": lambda v: parse_enum(IncidentType, v),
    "severity_actual": lambda v: parse_enum(SeverityLevel, v),
    "inspection_type": lambda v: parse_enum(InspectionType, v),
    "weather_conditions": lambda v: parse_enum(WeatherCondition, v),
    "progress_status": lambda v: parse_enum(ProgressStatus, v),
    "occurred_at": parse_datetime_value,
    "handover_time": parse_datetime_value,
    "meeting_time": parse_datetime_value,
    "inspection_date": parse_date_value,
    "target_completion_date": parse_date_value,
    "duration_minutes": parse_int,
    "workers_present": parse_int,
    "actual_progress_percent": parse_float,
    "planned_progress_percent": parse_float,
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
    """Format a concise summary for display."""
    report_type_label = report_type.value.replace("_", " ").title()
    lines = [f"*{report_type_label}*\n"]

    # Shorter labels
    short_labels = {
        "title": "Title",
        "description": "Details",
        "occurred_at": "When",
        "location_description": "Where",
        "building_block": "Block/Tower",
        "floor_level": "Floor",
        "actual_progress_percent": "Progress",
        "workers_present": "Workers",
        "weather_conditions": "Weather",
        "delays_if_any": "Delays",
        "category": "Category",
        "priority": "Priority",
        "unit_number": "Unit",
        "contractor_responsible": "Contractor",
        "target_completion_date": "Target Date",
        "incident_type": "Type",
        "severity_actual": "Severity",
        "inspection_type": "Type",
        "inspection_date": "Date",
        "outgoing_shift": "From Shift",
        "incoming_shift": "To Shift",
        "handover_time": "Time",
        "topic": "Topic",
        "meeting_time": "Time",
        "duration_minutes": "Duration",
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
        elif isinstance(value, (int, float)):
            if key == "actual_progress_percent":
                value = f"{value}%"

        label = short_labels.get(key, key.replace("_", " ").title())
        lines.append(f"- *{label}:* {value}")

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
                    f"I didn't quite catch that.\n\n"
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

    if report_type == ReportType.CONSTRUCTION_PROGRESS:
        db.add(ConstructionProgressDetails(
            report_id=report.id,
            building_block=coerced.get("building_block"),
            floor_level=coerced.get("floor_level"),
            actual_progress_percent=coerced.get("actual_progress_percent"),
            workers_present=coerced.get("workers_present"),
            weather_conditions=coerced.get("weather_conditions"),
            delays_if_any=coerced.get("delays_if_any"),
        ))
    elif report_type == ReportType.DEFECT_SNAG:
        db.add(DefectReportDetails(
            report_id=report.id,
            category=coerced["category"],
            priority=coerced["priority"],
            building_block=coerced.get("building_block"),
            floor_level=coerced.get("floor_level"),
            unit_number=coerced.get("unit_number"),
            contractor_responsible=coerced.get("contractor_responsible"),
            target_completion_date=coerced.get("target_completion_date"),
        ))
    elif report_type == ReportType.SAFETY_INCIDENT:
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
    elif report_type == ReportType.SITE_INSPECTION:
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
            # Default Xappy Property greeting
            return None, (
                "Hi, I'm Xappy Property Assistant!\n\n"
                "I can help you with:\n"
                "- *Progress Reports* - Log construction progress\n"
                "- *Defect/Snag Reports* - Report defects and snags\n"
                "- *Safety Incidents* - Report site safety incidents\n"
                "- *Site Inspections* - Log inspection findings\n"
                "- *Shift Handovers* - Record handover notes\n"
                "- *Toolbox Talks* - Document safety meetings\n\n"
                "How can I help you today? Just type what you need!"
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
            ReportType.CONSTRUCTION_PROGRESS: "Got it! Let's log that *construction progress* report.",
            ReportType.DEFECT_SNAG: "I'll help you report that *defect/snag* right away.",
            ReportType.SAFETY_INCIDENT: "Let's document that *safety incident*.",
            ReportType.SITE_INSPECTION: "Starting a *site inspection* log.",
            ReportType.DAILY_PROGRESS_LOG: "Let's create your *daily progress log*.",
            ReportType.SHIFT_HANDOVER: "Let's record this *shift handover*.",
            ReportType.TOOLBOX_TALK: "I'll help you log that *toolbox talk*.",
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
            "building_block": "Which building/tower/block is this for?",
            "actual_progress_percent": "What's the current progress percentage?",
        }
        first_prompt = friendly_prompts.get(next_field, f"What's the {FIELD_LABELS.get(next_field, next_field)}?")

        # Show progress if some fields were extracted
        filled_count = len(REQUIRED_FIELDS.get(report_type, [])) - len(missing)
        if filled_count > 0:
            return draft, f"{greeting}\n\nI got {filled_count} details from your message. Just need a few more:\n\n{first_prompt}", None
        else:
            return draft, f"{greeting}\n\n{first_prompt}", None

    # NOTE: Do NOT change report_type once draft is created

    extracted_fields = extracted.get("fields") if extracted else None
    if extracted_fields:
        merge_extracted_fields(draft, extracted_fields)

    if draft.get("stage") == "confirming":
        if intent == "confirm" or is_confirm(message):
            return draft, "Submitting your report now...", "submit"
        if intent == "cancel" or is_cancel(message):
            return None, "No problem, I've discarded that draft.\n\nJust let me know when you want to report something else!", "cancel"

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
                ReportType.CONSTRUCTION_PROGRESS: "Got it! Let's log that *construction progress* report.",
                ReportType.DEFECT_SNAG: "I'll help you report that *defect/snag* right away.",
                ReportType.SAFETY_INCIDENT: "Let's document that *safety incident*.",
                ReportType.SITE_INSPECTION: "Starting a *site inspection* log.",
                ReportType.DAILY_PROGRESS_LOG: "Let's create your *daily progress log*.",
                ReportType.SHIFT_HANDOVER: "Let's record this *shift handover*.",
                ReportType.TOOLBOX_TALK: "I'll help you log that *toolbox talk*.",
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
            "location_description": "Where did this occur? (e.g., 'Tower A, 5th floor')",
            "building_block": "Which building/tower/block?",
            "floor_level": "Which floor level?",
            "actual_progress_percent": "What's the current progress percentage? (0-100)",
            "workers_present": "How many workers are on site?",
            "weather_conditions": "What are the weather conditions?",
            "delays_if_any": "Are there any delays? If so, please describe.",
            "category": "What category best fits this defect?",
            "priority": "What's the priority level?",
            "unit_number": "What's the unit/flat number?",
            "contractor_responsible": "Which contractor is responsible?",
            "target_completion_date": "When should this be fixed by?",
            "incident_type": "What type of incident was this?",
            "severity_actual": "How severe was this incident?",
            "inspection_type": "What type of inspection is this?",
            "inspection_date": "When was this inspection conducted?",
            "topic": "What was the toolbox talk topic?",
            "meeting_time": "When did the meeting take place?",
            "duration_minutes": "How long was the meeting? (in minutes)",
            "outgoing_shift": "Which shift is handing over?",
            "incoming_shift": "Which shift is taking over?",
            "handover_time": "What time is the handover?",
        }

        base_prompt = friendly_prompts.get(next_field, f"Please provide the {prompt}.")

        if options:
            formatted_options = [opt.replace("_", " ").title() for opt in options]
            return draft, f"{base_prompt}\n\nOptions: {', '.join(formatted_options)}", None
        return draft, base_prompt, None

    summary = format_summary(report_type, draft["fields"])
    draft["stage"] = "confirming"
    return draft, (
        "Great! I've got all the details. Here's your report:\n\n"
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
                return f"You don't have any {filter_text.strip()} reports."
            return "You don't have any reports yet. Start by saying 'I want to report a defect' or similar."

        # Clean up filter text (replace underscores with spaces)
        filter_text_clean = filter_text.replace("_", " ")

        # Avoid "report report" duplication
        if filter_text_clean and "report" in filter_text_clean.lower():
            return f"You have *{count}* {filter_text_clean.strip()}{'s' if count != 1 else ''}."

        return f"You have *{count}* {filter_text_clean}{report_word}."

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
                return f"No {' '.join(filter_desc)} reports found."
            return "You don't have any reports yet.\n\n_Tip:_ Start by saying 'I want to report a defect' or 'log progress'."

        # Build header
        filter_desc = ""
        if status_filter or report_type_filter:
            parts = []
            if status_filter:
                parts.append(status_filter)
            if report_type_filter:
                parts.append(report_type_filter.replace("_", " "))
            filter_desc = f" ({' '.join(parts)})"

        lines = [f"*Your Recent Reports{filter_desc}:*\n"]

        for i, r in enumerate(reports, 1):
            status_emoji = {
                ReportStatus.SUBMITTED: "O",
                ReportStatus.ACKNOWLEDGED: "+",
                ReportStatus.CLOSED: "X",
                ReportStatus.DRAFT: "-",
                ReportStatus.UNDER_REVIEW: "~",
                ReportStatus.ARCHIVED: "#",
            }.get(r.status, "-")

            date_str = r.created_at.strftime("%d %b %Y") if r.created_at else "N/A"
            type_label = r.report_type.value.replace("_", " ").title()

            lines.append(f"{i}. [{status_emoji}] *{r.title}*")
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
            lines.append(f"*Summary:* {total} total reports")
            summary_parts = [f"{status.replace('_', ' ').title()}: {cnt}" for status, cnt in counts.items()]
            lines.append("   " + " | ".join(summary_parts))

        return "\n".join(lines)

    return "I can help you check your reports.\n\n*Try asking:*\n- 'How many reports do I have?'\n- 'Show my reports'\n- 'List my defect reports'"


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
        elif field_name in ("inspection_date", "target_completion_date"):
            field_type = "date"
        elif field_name in ("duration_minutes", "workers_present"):
            field_type = "number"
        elif field_name in ("actual_progress_percent", "planned_progress_percent"):
            field_type = "percentage"
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
