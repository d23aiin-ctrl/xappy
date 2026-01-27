# XAPPY Chat - Manual CURL Commands

Copy and paste these commands one by one to test the chat flow.

## Setup

First, set the base URL:
```bash
export BASE_URL="http://localhost:8000/api/v1"
```

---

## Step 1: Login

Login as Worker:
```bash
export TOKEN=$(curl -s -X POST "$BASE_URL/auth/badge-login" \
  -H "Content-Type: application/json" \
  -d '{"badge_number": "WKR-1001", "pin": "1234"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Token: ${TOKEN:0:50}..."
```

Login as Supervisor (for queries):
```bash
export TOKEN=$(curl -s -X POST "$BASE_URL/auth/badge-login" \
  -H "Content-Type: application/json" \
  -d '{"badge_number": "SUP-2001", "pin": "1234"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
```

---

## Demo 1: Complete Near Miss Report

### Start Report:
```bash
RESPONSE=$(curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to report a near miss"}')

echo $RESPONSE | python3 -m json.tool
export CONV_ID=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['conversationId'])")
```

### Provide Title:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Slip hazard near Tank 42\", \"conversationId\": \"$CONV_ID\"}" | python3 -m json.tool
```

### Provide Description:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Found oil on the floor that could cause slip and fall\", \"conversationId\": \"$CONV_ID\"}" | python3 -m json.tool
```

### Provide Date/Time:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"today at 9am\", \"conversationId\": \"$CONV_ID\"}" | python3 -m json.tool
```

### Provide Location:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Tank Farm Area\", \"conversationId\": \"$CONV_ID\"}" | python3 -m json.tool
```

### Provide Category:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"slip trip fall\", \"conversationId\": \"$CONV_ID\"}" | python3 -m json.tool
```

### Confirm Submission:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"yes\", \"conversationId\": \"$CONV_ID\"}" | python3 -m json.tool
```

---

## Demo 2: Query Reports

### Count Reports:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "how many reports do I have?"}' | python3 -m json.tool
```

### List Reports:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "show my reports"}' | python3 -m json.tool
```

### Filter by Type:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "show near miss reports"}' | python3 -m json.tool
```

### Filter by Status:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "show pending reports"}' | python3 -m json.tool
```

---

## Demo 3: Field Updates (Click-to-Edit API)

### Start Report:
```bash
RESPONSE=$(curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "report an inspection"}')

export CONV_ID=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['conversationId'])")
echo $RESPONSE | python3 -m json.tool
```

### Update Multiple Fields Directly:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"\",
    \"conversationId\": \"$CONV_ID\",
    \"fieldUpdates\": [
      {\"fieldName\": \"title\", \"value\": \"Weekly Safety Inspection\"},
      {\"fieldName\": \"description\", \"value\": \"Routine safety walkdown of Area B\"},
      {\"fieldName\": \"occurred_at\", \"value\": \"2024-01-09T10:00:00\"},
      {\"fieldName\": \"location_description\", \"value\": \"Production Area B\"}
    ]
  }" | python3 -m json.tool
```

---

## Demo 4: Natural Language Extraction

### Rich Description:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need to report a near miss that happened this morning around 8:30am at the tank farm near storage tank T-105. A loose valve handle almost fell on me while I was doing my routine inspection. It was an equipment malfunction issue."
  }' | python3 -m json.tool
```

---

## Checking Response Structure

### View Draft State:
```bash
curl -s -X POST "$BASE_URL/chat/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to report a near miss"}' | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('=== Response ===')
print(f\"Content: {data.get('content', '')[:100]}...\")
print(f\"Conversation ID: {data.get('conversationId')}\")
print()
ds = data.get('draftState')
if ds:
    print('=== Draft State ===')
    print(f\"Report Type: {ds.get('reportTypeLabel')}\")
    print(f\"Stage: {ds.get('stage')}\")
    print(f\"Progress: {ds.get('filledCount')}/{ds.get('totalRequired')} ({ds.get('progressPercent')}%)\")
    print(f\"Next Field: {ds.get('nextField')}\")
    print()
    print('=== Fields ===')
    for f in ds.get('fields', []):
        status = '✅' if f.get('isValid') else '⬜'
        print(f\"{status} {f.get('label')}: {f.get('value') or '-'}\")
qa = data.get('quickActions', [])
if qa:
    print()
    print(f\"=== Quick Actions ({len(qa)}) ===\")
    for a in qa[:5]:
        print(f\"  - {a.get('label')} ({a.get('actionType')})\")
"
```

---

## Tips

1. **Reset conversation**: Just don't pass `conversationId` to start fresh
2. **See full response**: Pipe to `python3 -m json.tool`
3. **Extract specific field**: Use `python3 -c "import sys, json; print(json.load(sys.stdin)['fieldName'])"`
