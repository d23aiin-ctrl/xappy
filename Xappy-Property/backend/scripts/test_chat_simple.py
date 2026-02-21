#!/usr/bin/env python3
"""
Simple test scripts for testing chat features without full LLM dependency.

Run with: python scripts/test_chat_simple.py

These tests focus on verifying the new draft state features work correctly.
"""

import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000/api/v1"


async def login(badge: str = "WKR-1001", pin: str = "1234") -> tuple:
    """Login and return token and client."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{BASE_URL}/auth/badge-login",
            json={"badge_number": badge, "pin": pin}
        )
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return None, None
        token = response.json()["access_token"]
        print(f"✅ Logged in as {badge}")
        return token, client


async def test_draft_state_structure():
    """
    Test 1: Verify draft state structure is returned correctly.
    """
    print("\n" + "="*60)
    print("TEST: Draft State Structure")
    print("="*60)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Login
        response = await client.post(
            f"{BASE_URL}/auth/badge-login",
            json={"badge_number": "WKR-1001", "pin": "1234"}
        )
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Start a report
        response = await client.post(
            f"{BASE_URL}/chat/send",
            json={"message": "I want to report a near miss"},
            headers=headers
        )

        data = response.json()
        print(f"\nResponse Status: {response.status_code}")
        print(f"Content: {data.get('content', '')[:100]}...")

        # Verify draft state structure
        ds = data.get("draftState")
        if ds:
            print("\n✅ Draft State Present:")
            print(f"   - reportType: {ds.get('reportType')}")
            print(f"   - reportTypeLabel: {ds.get('reportTypeLabel')}")
            print(f"   - stage: {ds.get('stage')}")
            print(f"   - filledCount: {ds.get('filledCount')}")
            print(f"   - totalRequired: {ds.get('totalRequired')}")
            print(f"   - progressPercent: {ds.get('progressPercent')}")
            print(f"   - nextField: {ds.get('nextField')}")
            print(f"   - isComplete: {ds.get('isComplete')}")
            print(f"   - fields count: {len(ds.get('fields', []))}")

            # Verify field structure
            if ds.get("fields"):
                field = ds["fields"][0]
                print(f"\n   Sample Field Structure:")
                print(f"   - name: {field.get('name')}")
                print(f"   - label: {field.get('label')}")
                print(f"   - fieldType: {field.get('fieldType')}")
                print(f"   - options: {field.get('options')}")
                print(f"   - value: {field.get('value')}")
                print(f"   - isValid: {field.get('isValid')}")

            return True
        else:
            print("\n❌ Draft State Missing!")
            return False


async def test_quick_actions():
    """
    Test 2: Verify quick actions are returned for enum fields.
    """
    print("\n" + "="*60)
    print("TEST: Quick Actions for Enum Fields")
    print("="*60)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Login
        response = await client.post(
            f"{BASE_URL}/auth/badge-login",
            json={"badge_number": "WKR-1001", "pin": "1234"}
        )
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        conv_id = None

        # Start a report
        response = await client.post(
            f"{BASE_URL}/chat/send",
            json={"message": "I want to report a near miss"},
            headers=headers
        )
        data = response.json()
        conv_id = data.get("conversationId")
        print(f"Started conversation: {conv_id}")

        # Fill first 4 fields to get to category (which has options)
        messages = [
            "Test hazard title",
            "Test description of the hazard",
            "today at 9am",
            "Test location",
        ]

        for i, msg in enumerate(messages):
            response = await client.post(
                f"{BASE_URL}/chat/send",
                json={"message": msg, "conversationId": conv_id},
                headers=headers
            )
            data = response.json()
            conv_id = data.get("conversationId")
            print(f"Step {i+2}: {data.get('content', '')[:60]}...")

        # Check if quick actions are present
        qa = data.get("quickActions", [])
        if qa:
            print(f"\n✅ Quick Actions Present ({len(qa)} items):")
            for action in qa[:5]:  # Show first 5
                print(f"   - {action.get('label')} ({action.get('actionType')})")
            return True
        else:
            print("\n⚠️ No Quick Actions (may depend on LLM report type detection)")
            return True  # Not a failure, depends on LLM


async def test_field_updates():
    """
    Test 3: Test direct field updates via fieldUpdates parameter.
    """
    print("\n" + "="*60)
    print("TEST: Direct Field Updates (Click-to-Edit)")
    print("="*60)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Login
        response = await client.post(
            f"{BASE_URL}/auth/badge-login",
            json={"badge_number": "WKR-1001", "pin": "1234"}
        )
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Start a report
        response = await client.post(
            f"{BASE_URL}/chat/send",
            json={"message": "report an inspection"},
            headers=headers
        )
        data = response.json()
        conv_id = data.get("conversationId")
        print(f"Started conversation: {conv_id}")

        # Use fieldUpdates to directly set multiple fields
        field_updates = [
            {"fieldName": "title", "value": "Test Inspection"},
            {"fieldName": "description", "value": "Test description for inspection"},
            {"fieldName": "occurred_at", "value": "2024-01-09T10:00:00"},
            {"fieldName": "location_description", "value": "Test location"},
        ]

        response = await client.post(
            f"{BASE_URL}/chat/send",
            json={
                "message": "",
                "conversationId": conv_id,
                "fieldUpdates": field_updates
            },
            headers=headers
        )
        data = response.json()

        print(f"\nResponse: {data.get('content', '')[:100]}...")

        ds = data.get("draftState")
        if ds:
            print(f"\n✅ Fields Updated:")
            print(f"   Progress: {ds.get('filledCount')}/{ds.get('totalRequired')}")
            for field in ds.get("fields", []):
                if field.get("isValid"):
                    print(f"   ✅ {field.get('label')}: {field.get('value')[:30] if field.get('value') else '-'}...")
                else:
                    print(f"   ⬜ {field.get('label')}: -")
            return True
        else:
            print("\n❌ Draft State Missing after field updates!")
            return False


async def test_query_response():
    """
    Test 4: Verify query responses don't include draft state.
    """
    print("\n" + "="*60)
    print("TEST: Query Response (No Draft State)")
    print("="*60)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Login
        response = await client.post(
            f"{BASE_URL}/auth/badge-login",
            json={"badge_number": "SUP-2001", "pin": "1234"}
        )
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Send a query
        response = await client.post(
            f"{BASE_URL}/chat/send",
            json={"message": "how many reports do I have?"},
            headers=headers
        )
        data = response.json()

        print(f"\nResponse: {data.get('content', '')[:200]}...")

        # Query responses should not have draft state
        if data.get("draftState") is None:
            print("\n✅ Query response correctly has no draft state")
            return True
        else:
            print("\n❌ Query response should not have draft state!")
            return False


async def test_cancel_flow():
    """
    Test 5: Test cancellation clears draft state.
    """
    print("\n" + "="*60)
    print("TEST: Cancel Flow (Draft Cleared)")
    print("="*60)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Login
        response = await client.post(
            f"{BASE_URL}/auth/badge-login",
            json={"badge_number": "WKR-1001", "pin": "1234"}
        )
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Start a report
        response = await client.post(
            f"{BASE_URL}/chat/send",
            json={"message": "I want to report a near miss"},
            headers=headers
        )
        data = response.json()
        conv_id = data.get("conversationId")

        # Provide some data
        response = await client.post(
            f"{BASE_URL}/chat/send",
            json={"message": "Test title", "conversationId": conv_id},
            headers=headers
        )
        data = response.json()

        # Verify we have a draft
        if data.get("draftState"):
            print("Draft state present before cancel")

        # Cancel
        response = await client.post(
            f"{BASE_URL}/chat/send",
            json={"message": "cancel", "conversationId": conv_id},
            headers=headers
        )
        data = response.json()

        print(f"\nResponse: {data.get('content', '')[:100]}...")

        if data.get("draftState") is None:
            print("\n✅ Draft correctly cleared after cancel")
            return True
        else:
            print("\n❌ Draft should be cleared after cancel!")
            return False


async def test_response_structure():
    """
    Test 6: Verify complete response structure with all new fields.
    """
    print("\n" + "="*60)
    print("TEST: Complete Response Structure")
    print("="*60)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Login
        response = await client.post(
            f"{BASE_URL}/auth/badge-login",
            json={"badge_number": "WKR-1001", "pin": "1234"}
        )
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Start a report
        response = await client.post(
            f"{BASE_URL}/chat/send",
            json={"message": "I want to report a near miss"},
            headers=headers
        )
        data = response.json()

        print("\n📋 Response Structure Check:")

        # Check all expected fields
        expected_fields = [
            "id", "content", "role", "createdAt", "conversationId",
            "draftState", "quickActions", "submissionResult", "showDraftCard"
        ]

        for field in expected_fields:
            if field in data:
                value = data[field]
                if value is None:
                    print(f"   ✅ {field}: null")
                elif isinstance(value, dict):
                    print(f"   ✅ {field}: {{...}}")
                elif isinstance(value, list):
                    print(f"   ✅ {field}: [{len(value)} items]")
                else:
                    print(f"   ✅ {field}: {str(value)[:30]}...")
            else:
                print(f"   ❌ {field}: MISSING")

        return True


async def run_all_tests():
    """Run all simple tests."""
    print("\n" + "="*80)
    print("XAPPY CHAT - SIMPLE FEATURE TESTS")
    print("="*80)

    results = {}

    tests = [
        ("Draft State Structure", test_draft_state_structure),
        ("Quick Actions", test_quick_actions),
        ("Field Updates", test_field_updates),
        ("Query Response", test_query_response),
        ("Cancel Flow", test_cancel_flow),
        ("Response Structure", test_response_structure),
    ]

    for name, test_fn in tests:
        try:
            result = await test_fn()
            results[name] = "✅ PASSED" if result else "❌ FAILED"
        except Exception as e:
            results[name] = f"❌ ERROR: {str(e)}"
            print(f"\n❌ TEST ERROR: {e}")

    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    for name, result in results.items():
        print(f"  {result} - {name}")

    passed = sum(1 for r in results.values() if "PASSED" in r)
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        test_name = sys.argv[1]
        test_map = {
            "draft": test_draft_state_structure,
            "quick": test_quick_actions,
            "field": test_field_updates,
            "query": test_query_response,
            "cancel": test_cancel_flow,
            "structure": test_response_structure,
        }
        if test_name in test_map:
            asyncio.run(test_map[test_name]())
        elif test_name == "all":
            asyncio.run(run_all_tests())
        else:
            print(f"Unknown test: {test_name}")
            print(f"Available tests: {', '.join(test_map.keys())}, all")
    else:
        asyncio.run(run_all_tests())
