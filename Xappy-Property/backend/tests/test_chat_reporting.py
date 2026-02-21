from app.services.chat_reporting import process_message


def test_defect_prompts_for_title():
    """Test that a defect report message prompts for title"""
    draft, response, action = process_message("defect in unit 101", None)
    assert draft is not None
    assert action is None
    assert "title" in response.lower() or "defect" in response.lower()


def test_confirm_flow():
    """Test the confirmation flow for a defect report"""
    draft = {
        "report_type": "defect_snag",
        "fields": {
            "title": "Water leakage in bathroom",
            "description": "Water seeping through wall",
            "occurred_at": "2025-01-01T10:00:00+00:00",
            "location_description": "Tower A, Unit 1201",
            "category": "waterproofing",
            "priority": "high",
        },
        "stage": "collecting",
        "pending_field": None,
    }
    draft, response, action = process_message("done", draft)
    assert draft is not None
    assert action is None
    assert "yes" in response.lower()

    draft, response, action = process_message("yes", draft)
    assert action == "submit"


def test_extracted_fields_drive_completion():
    """Test that extracted fields from LLM drive report completion"""
    extracted = {
        "report_type": "safety_incident",
        "intent": "none",
        "fields": {
            "title": "Worker injury on scaffolding",
            "description": "Worker slipped on wet scaffolding",
            "occurred_at": "2025-01-02T08:30:00+00:00",
            "location_description": "Tower B, 5th floor",
            "incident_type": "fall_from_height",
            "severity_actual": "medium",
        },
    }
    draft, response, action = process_message(
        "incident report",
        None,
        extracted=extracted,
        intent=extracted["intent"],
    )
    assert draft is not None
    assert action is None
    assert "yes" in response.lower()


def test_construction_progress_flow():
    """Test construction progress report flow"""
    draft, response, action = process_message("log progress for tower a", None)
    assert draft is not None
    assert draft["report_type"] == "construction_progress"
    assert action is None


def test_greeting_without_report_type():
    """Test greeting message when no report type is detected"""
    draft, response, action = process_message("hello", None)
    assert draft is None
    assert action is None
    assert "xappy property" in response.lower()
