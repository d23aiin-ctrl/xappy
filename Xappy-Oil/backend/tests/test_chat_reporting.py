from app.services.chat_reporting import process_message


def test_near_miss_prompts_for_title():
    draft, response, action = process_message("near miss at pump", None)
    assert draft is not None
    assert action is None
    assert "short title" in response.lower()


def test_confirm_flow():
    draft = {
        "report_type": "near_miss",
        "fields": {
            "title": "Forklift near miss",
            "description": "Near miss with pallet",
            "occurred_at": "2025-01-01T10:00:00+00:00",
            "location_description": "Warehouse bay 3",
            "category": "vehicle",
        },
        "stage": "collecting",
        "pending_field": None,
    }
    draft, response, action = process_message("done", draft)
    assert draft is not None
    assert action is None
    assert "reply yes" in response.lower()

    draft, response, action = process_message("yes", draft)
    assert action == "submit"


def test_extracted_fields_drive_completion():
    extracted = {
        "report_type": "incident",
        "intent": "none",
        "fields": {
            "title": "Minor injury",
            "description": "Slip and fall",
            "occurred_at": "2025-01-02T08:30:00+00:00",
            "location_description": "Dock 2",
            "incident_type": "injury",
            "severity_actual": "first_aid",
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
    assert "reply yes" in response.lower()
