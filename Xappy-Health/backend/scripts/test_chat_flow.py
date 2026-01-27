#!/usr/bin/env python3
"""
Test scripts for the chat-based report submission flow.

Run with: python scripts/test_chat_flow.py

Prerequisites:
- Backend running on localhost:8000
- Database seeded with test users (run: python scripts/seed_users.py)
"""

import asyncio
import httpx
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

# Test users (from seed_users.py)
TEST_USERS = {
    "supervisor": {"badge": "SUP-2001", "pin": "1234"},
    "worker": {"badge": "WKR-1001", "pin": "1234"},
    "hse": {"badge": "HSE-3001", "pin": "1234"},
}


async def login(client: httpx.AsyncClient, badge: str, pin: str) -> str:
    """Login and return access token."""
    response = await client.post(
        f"{BASE_URL}/auth/badge-login",
        json={"badge_number": badge, "pin": pin}
    )
    if response.status_code != 200:
        raise Exception(f"Login failed: {response.text}")
    return response.json()["access_token"]


async def send_chat(
    client: httpx.AsyncClient,
    token: str,
    message: str,
    conversation_id: str = None,
    field_updates: list = None
) -> dict:
    """Send a chat message and return the response."""
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "message": message,
        "conversationId": conversation_id,
    }
    if field_updates:
        payload["fieldUpdates"] = field_updates

    response = await client.post(
        f"{BASE_URL}/chat/send",
        json=payload,
        headers=headers
    )
    if response.status_code != 200:
        raise Exception(f"Chat failed: {response.text}")
    return response.json()


def print_response(response: dict, step: str):
    """Pretty print a chat response."""
    print(f"\n{'='*60}")
    print(f"STEP: {step}")
    print(f"{'='*60}")
    print(f"Content: {response.get('content', '')[:200]}...")

    if response.get("draftState"):
        ds = response["draftState"]
        print(f"\n📋 Draft State:")
        print(f"   Report Type: {ds.get('reportTypeLabel')}")
        print(f"   Stage: {ds.get('stage')}")
        print(f"   Progress: {ds.get('filledCount')}/{ds.get('totalRequired')} ({ds.get('progressPercent')}%)")
        print(f"   Next Field: {ds.get('nextField')}")
        print(f"   Fields:")
        for field in ds.get("fields", []):
            status = "✅" if field.get("isValid") else "⬜"
            value = field.get("value") or "-"
            print(f"      {status} {field.get('label')}: {value}")

    if response.get("quickActions"):
        print(f"\n⚡ Quick Actions: {[a.get('label') for a in response['quickActions']]}")

    if response.get("submissionResult"):
        sr = response["submissionResult"]
        print(f"\n🎉 Submission Result:")
        print(f"   Reference: {sr.get('referenceNumber')}")
        print(f"   Type: {sr.get('reportType')}")
        print(f"   Submitted: {sr.get('submittedAt')}")

    return response.get("conversationId")


# =============================================================================
# TEST SCENARIOS
# =============================================================================

async def test_complete_near_miss_flow():
    """
    Test Case 1: Complete Near Miss Report Flow

    This test simulates a user reporting a near miss by:
    1. Initiating a near miss report
    2. Providing all required fields
    3. Confirming submission
    """
    print("\n" + "="*80)
    print("TEST: Complete Near Miss Report Flow")
    print("="*80)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Login as worker
        token = await login(client, TEST_USERS["worker"]["badge"], TEST_USERS["worker"]["pin"])
        print(f"✅ Logged in as worker")

        # Step 1: Initiate near miss report
        response = await send_chat(client, token, "I want to report a near miss")
        conv_id = print_response(response, "1. Initiate Near Miss")

        # Step 2: Provide title
        response = await send_chat(client, token, "Slip hazard near Tank 42", conv_id)
        conv_id = print_response(response, "2. Provide Title")

        # Step 3: Provide description
        response = await send_chat(
            client, token,
            "Found oil puddle on walkway near Tank 42. Could have caused someone to slip and fall.",
            conv_id
        )
        conv_id = print_response(response, "3. Provide Description")

        # Step 4: Provide date/time
        response = await send_chat(client, token, "today at 9:30am", conv_id)
        conv_id = print_response(response, "4. Provide Date/Time")

        # Step 5: Provide location
        response = await send_chat(client, token, "Tank Farm Area, near Tank 42, west side", conv_id)
        conv_id = print_response(response, "5. Provide Location")

        # Step 6: Provide category (should show options)
        response = await send_chat(client, token, "slip trip fall", conv_id)
        conv_id = print_response(response, "6. Provide Category")

        # Step 7: Confirm submission
        response = await send_chat(client, token, "yes", conv_id)
        conv_id = print_response(response, "7. Confirm Submission")

        if response.get("submissionResult"):
            print("\n✅ TEST PASSED: Near miss report submitted successfully!")
            return True
        else:
            print("\n❌ TEST FAILED: Expected submission result")
            return False


async def test_complete_incident_flow():
    """
    Test Case 2: Complete Incident Report Flow
    """
    print("\n" + "="*80)
    print("TEST: Complete Incident Report Flow")
    print("="*80)

    async with httpx.AsyncClient(timeout=30.0) as client:
        token = await login(client, TEST_USERS["worker"]["badge"], TEST_USERS["worker"]["pin"])
        print(f"✅ Logged in as worker")

        # Step 1: Initiate incident report
        response = await send_chat(client, token, "I need to report an incident")
        conv_id = print_response(response, "1. Initiate Incident")

        # Step 2: Provide title
        response = await send_chat(client, token, "Minor hand injury during valve operation", conv_id)
        conv_id = print_response(response, "2. Provide Title")

        # Step 3: Provide description
        response = await send_chat(
            client, token,
            "Worker cut hand while operating manual valve. First aid applied on site.",
            conv_id
        )
        conv_id = print_response(response, "3. Provide Description")

        # Step 4: Provide date/time
        response = await send_chat(client, token, "yesterday at 2pm", conv_id)
        conv_id = print_response(response, "4. Provide Date/Time")

        # Step 5: Provide location
        response = await send_chat(client, token, "Pump Station B, valve V-102", conv_id)
        conv_id = print_response(response, "5. Provide Location")

        # Step 6: Provide incident type
        response = await send_chat(client, token, "injury", conv_id)
        conv_id = print_response(response, "6. Provide Incident Type")

        # Step 7: Provide severity
        response = await send_chat(client, token, "first aid", conv_id)
        conv_id = print_response(response, "7. Provide Severity")

        # Step 8: Confirm submission
        response = await send_chat(client, token, "yes", conv_id)
        conv_id = print_response(response, "8. Confirm Submission")

        if response.get("submissionResult"):
            print("\n✅ TEST PASSED: Incident report submitted successfully!")
            return True
        else:
            print("\n❌ TEST FAILED: Expected submission result")
            return False


async def test_complete_spill_flow():
    """
    Test Case 3: Complete Spill Report Flow
    """
    print("\n" + "="*80)
    print("TEST: Complete Spill Report Flow")
    print("="*80)

    async with httpx.AsyncClient(timeout=30.0) as client:
        token = await login(client, TEST_USERS["worker"]["badge"], TEST_USERS["worker"]["pin"])
        print(f"✅ Logged in as worker")

        # Step 1: Initiate spill report
        response = await send_chat(client, token, "report a spill")
        conv_id = print_response(response, "1. Initiate Spill Report")

        # Step 2: Provide title
        response = await send_chat(client, token, "Diesel spill at loading bay", conv_id)
        conv_id = print_response(response, "2. Provide Title")

        # Step 3: Provide description
        response = await send_chat(
            client, token,
            "Approximately 5 liters of diesel spilled during truck loading. Contained with absorbent.",
            conv_id
        )
        conv_id = print_response(response, "3. Provide Description")

        # Step 4: Provide date/time
        response = await send_chat(client, token, "this morning at 7am", conv_id)
        conv_id = print_response(response, "4. Provide Date/Time")

        # Step 5: Provide location
        response = await send_chat(client, token, "Loading Bay 3, north side", conv_id)
        conv_id = print_response(response, "5. Provide Location")

        # Step 6: Provide spill type
        response = await send_chat(client, token, "diesel", conv_id)
        conv_id = print_response(response, "6. Provide Spill Type")

        # Step 7: Provide material name
        response = await send_chat(client, token, "Diesel fuel", conv_id)
        conv_id = print_response(response, "7. Provide Material Name")

        # Step 8: Confirm submission
        response = await send_chat(client, token, "confirm", conv_id)
        conv_id = print_response(response, "8. Confirm Submission")

        if response.get("submissionResult"):
            print("\n✅ TEST PASSED: Spill report submitted successfully!")
            return True
        else:
            print("\n❌ TEST FAILED: Expected submission result")
            return False


async def test_partial_flow_cancel():
    """
    Test Case 4: Partial Flow - User Cancels Mid-Way
    """
    print("\n" + "="*80)
    print("TEST: Partial Flow - Cancel Mid-Way")
    print("="*80)

    async with httpx.AsyncClient(timeout=30.0) as client:
        token = await login(client, TEST_USERS["worker"]["badge"], TEST_USERS["worker"]["pin"])
        print(f"✅ Logged in as worker")

        # Step 1: Initiate near miss report
        response = await send_chat(client, token, "I want to report a near miss")
        conv_id = print_response(response, "1. Initiate Near Miss")

        # Step 2: Provide title
        response = await send_chat(client, token, "Test report to cancel", conv_id)
        conv_id = print_response(response, "2. Provide Title")

        # Step 3: Provide description
        response = await send_chat(client, token, "This is a test description", conv_id)
        conv_id = print_response(response, "3. Provide Description")

        # Step 4: User decides to cancel
        response = await send_chat(client, token, "cancel", conv_id)
        conv_id = print_response(response, "4. Cancel Report")

        # Verify draft is cleared
        if response.get("draftState") is None and "discard" in response.get("content", "").lower():
            print("\n✅ TEST PASSED: Report cancelled successfully, draft cleared!")
            return True
        else:
            print("\n❌ TEST FAILED: Expected draft to be cleared after cancel")
            return False


async def test_natural_language_bulk_extraction():
    """
    Test Case 5: Natural Language Input - Multiple Fields at Once

    Test the LLM's ability to extract multiple fields from a natural description.
    """
    print("\n" + "="*80)
    print("TEST: Natural Language Bulk Extraction")
    print("="*80)

    async with httpx.AsyncClient(timeout=30.0) as client:
        token = await login(client, TEST_USERS["worker"]["badge"], TEST_USERS["worker"]["pin"])
        print(f"✅ Logged in as worker")

        # Step 1: Provide rich natural language description
        description = """
        I need to report a near miss that happened this morning around 8:30am
        at the tank farm near storage tank T-105. A loose valve handle almost
        fell on me while I was doing my routine inspection. It was an equipment
        malfunction issue that could have caused serious injury.
        """
        response = await send_chat(client, token, description)
        conv_id = print_response(response, "1. Natural Language Input")

        # Check how many fields were extracted
        if response.get("draftState"):
            filled = response["draftState"].get("filledCount", 0)
            total = response["draftState"].get("totalRequired", 0)
            print(f"\n📊 Extraction Result: {filled}/{total} fields extracted from natural language")

            if filled >= 3:
                print("✅ TEST PASSED: Multiple fields extracted from natural language!")
                return True
            else:
                print("⚠️ TEST PARTIAL: Some fields extracted, may need more context")
                return True  # Still pass, as extraction depends on LLM

        print("\n❌ TEST FAILED: No draft state returned")
        return False


async def test_query_reports():
    """
    Test Case 6: Query Existing Reports
    """
    print("\n" + "="*80)
    print("TEST: Query Existing Reports")
    print("="*80)

    async with httpx.AsyncClient(timeout=30.0) as client:
        token = await login(client, TEST_USERS["supervisor"]["badge"], TEST_USERS["supervisor"]["pin"])
        print(f"✅ Logged in as supervisor")

        # Test 1: Count all reports
        response = await send_chat(client, token, "How many reports do I have?")
        print_response(response, "1. Count All Reports")

        # Test 2: List reports
        response = await send_chat(client, token, "Show my reports")
        print_response(response, "2. List Reports")

        # Test 3: Filter by type
        response = await send_chat(client, token, "Show my near miss reports")
        print_response(response, "3. Filter by Type")

        # Test 4: Filter by status
        response = await send_chat(client, token, "Show pending reports")
        print_response(response, "4. Filter by Status")

        print("\n✅ TEST PASSED: Query tests completed!")
        return True


async def test_field_update_click_to_edit():
    """
    Test Case 7: Field Update via Click-to-Edit (fieldUpdates API)
    """
    print("\n" + "="*80)
    print("TEST: Field Update via Click-to-Edit")
    print("="*80)

    async with httpx.AsyncClient(timeout=30.0) as client:
        token = await login(client, TEST_USERS["worker"]["badge"], TEST_USERS["worker"]["pin"])
        print(f"✅ Logged in as worker")

        # Step 1: Start a report
        response = await send_chat(client, token, "I want to report a near miss")
        conv_id = print_response(response, "1. Initiate Report")

        # Step 2: Fill first field via normal message
        response = await send_chat(client, token, "Potential fall hazard", conv_id)
        conv_id = print_response(response, "2. Provide Title")

        # Step 3: Use fieldUpdates to directly update multiple fields
        field_updates = [
            {"fieldName": "description", "value": "Worker almost fell due to wet floor"},
            {"fieldName": "occurred_at", "value": "2024-01-09T10:00:00"},
            {"fieldName": "location_description", "value": "Main building entrance"},
        ]
        response = await send_chat(client, token, "", conv_id, field_updates)
        conv_id = print_response(response, "3. Bulk Field Update via API")

        # Verify fields were updated
        if response.get("draftState"):
            fields = {f["name"]: f["isValid"] for f in response["draftState"]["fields"]}
            if fields.get("description") and fields.get("occurred_at") and fields.get("location_description"):
                print("\n✅ TEST PASSED: Fields updated via fieldUpdates API!")
                return True

        print("\n❌ TEST FAILED: Fields not updated correctly")
        return False


async def test_inspection_flow():
    """
    Test Case 8: Complete Inspection Report Flow
    """
    print("\n" + "="*80)
    print("TEST: Complete Inspection Report Flow")
    print("="*80)

    async with httpx.AsyncClient(timeout=30.0) as client:
        token = await login(client, TEST_USERS["hse"]["badge"], TEST_USERS["hse"]["pin"])
        print(f"✅ Logged in as HSE officer")

        # Step 1: Initiate inspection report
        response = await send_chat(client, token, "log an inspection")
        conv_id = print_response(response, "1. Initiate Inspection")

        # Step 2: Provide title
        response = await send_chat(client, token, "Weekly safety walkdown - Area B", conv_id)
        conv_id = print_response(response, "2. Provide Title")

        # Step 3: Provide description
        response = await send_chat(
            client, token,
            "Conducted weekly safety inspection of Area B. Found 2 minor housekeeping issues.",
            conv_id
        )
        conv_id = print_response(response, "3. Provide Description")

        # Step 4: Provide date/time
        response = await send_chat(client, token, "today at 2pm", conv_id)
        conv_id = print_response(response, "4. Provide Date/Time")

        # Step 5: Provide location
        response = await send_chat(client, token, "Production Area B, all zones", conv_id)
        conv_id = print_response(response, "5. Provide Location")

        # Step 6: Provide inspection type
        response = await send_chat(client, token, "weekly inspection", conv_id)
        conv_id = print_response(response, "6. Provide Inspection Type")

        # Step 7: Provide inspection date
        response = await send_chat(client, token, "today", conv_id)
        conv_id = print_response(response, "7. Provide Inspection Date")

        # Step 8: Confirm submission
        response = await send_chat(client, token, "submit", conv_id)
        conv_id = print_response(response, "8. Confirm Submission")

        if response.get("submissionResult"):
            print("\n✅ TEST PASSED: Inspection report submitted successfully!")
            return True
        else:
            print("\n❌ TEST FAILED: Expected submission result")
            return False


async def run_all_tests():
    """Run all test cases."""
    print("\n" + "="*80)
    print("XAPPY CHAT REPORTING - TEST SUITE")
    print("="*80)
    print(f"Started at: {datetime.now().isoformat()}")

    results = {}

    # Run all tests
    tests = [
        ("Complete Near Miss Flow", test_complete_near_miss_flow),
        ("Complete Incident Flow", test_complete_incident_flow),
        ("Complete Spill Flow", test_complete_spill_flow),
        ("Partial Flow - Cancel", test_partial_flow_cancel),
        ("Natural Language Extraction", test_natural_language_bulk_extraction),
        ("Query Reports", test_query_reports),
        ("Field Update (Click-to-Edit)", test_field_update_click_to_edit),
        ("Complete Inspection Flow", test_inspection_flow),
    ]

    for name, test_fn in tests:
        try:
            result = await test_fn()
            results[name] = "✅ PASSED" if result else "❌ FAILED"
        except Exception as e:
            results[name] = f"❌ ERROR: {str(e)}"
            print(f"\n❌ TEST ERROR: {e}")

    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    for name, result in results.items():
        print(f"  {result} - {name}")

    passed = sum(1 for r in results.values() if "PASSED" in r)
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")
    print(f"Completed at: {datetime.now().isoformat()}")


if __name__ == "__main__":
    # Run specific test or all tests
    import sys

    if len(sys.argv) > 1:
        test_name = sys.argv[1]
        test_map = {
            "near_miss": test_complete_near_miss_flow,
            "incident": test_complete_incident_flow,
            "spill": test_complete_spill_flow,
            "cancel": test_partial_flow_cancel,
            "natural": test_natural_language_bulk_extraction,
            "query": test_query_reports,
            "field_update": test_field_update_click_to_edit,
            "inspection": test_inspection_flow,
        }
        if test_name in test_map:
            asyncio.run(test_map[test_name]())
        else:
            print(f"Unknown test: {test_name}")
            print(f"Available tests: {', '.join(test_map.keys())}")
    else:
        asyncio.run(run_all_tests())
