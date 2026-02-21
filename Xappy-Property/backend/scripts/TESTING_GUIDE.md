# XAPPY Chat Testing Guide

## Quick Start

1. **Start Backend**: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: http://localhost:3000

## Test Users

| Role | Badge | PIN |
|------|-------|-----|
| Supervisor | SUP-2001 | 1234 |
| Worker | WKR-1001 | 1234 |
| HSE Officer | HSE-3001 | 1234 |

## Manual Test Scenarios

### Test 1: Complete Near Miss Report (Happy Path)

**Steps:**
1. Login as Worker (WKR-1001, PIN: 1234)
2. Click "Near Miss" quick action or type: "I want to report a near miss"
3. **Expected:** See DraftCard with 5 fields, 0% progress
4. Type: "Slip hazard near Tank 42"
5. **Expected:** DraftCard shows title filled, progress ~20%
6. Type: "Found oil on the walkway that could cause someone to slip"
7. **Expected:** Description filled, progress ~40%
8. Type: "today at 9am"
9. **Expected:** Date/time filled, progress ~60%
10. Type: "Tank Farm Area, near Tank 42"
11. **Expected:** Location filled, progress ~80%
12. **Expected:** See category options as clickable buttons
13. Click "Slip Trip Fall" button (or type: "slip trip fall")
14. **Expected:** See ConfirmationCard with all 5 fields
15. Click "Submit Report"
16. **Expected:** See SubmissionSuccessCard with reference number

---

### Test 2: Partial Report with Cancel

**Steps:**
1. Login as Worker
2. Type: "I want to report an incident"
3. **Expected:** See DraftCard for Incident (6 fields)
4. Type: "Test incident title"
5. Type: "Test description"
6. Type: "no" or click "Discard" button (if in confirmation stage)
7. **Expected:** Report discarded, can start new one

---

### Test 3: Query Existing Reports

**Steps:**
1. Login as Supervisor (SUP-2001)
2. Click "My Reports" or type: "how many reports do I have?"
3. **Expected:** See count with emoji formatting
4. Type: "show my reports"
5. **Expected:** See list of recent reports with status emojis
6. Type: "show pending reports"
7. **Expected:** See filtered list by status

---

### Test 4: Click-to-Edit Field

**Steps:**
1. Login as Worker
2. Start a near miss report
3. Fill the title field
4. **Expected:** See DraftCard with title filled
5. Click on the title field in the DraftCard
6. **Expected:** Field becomes editable
7. Change the text and click checkmark
8. **Expected:** Field updates without sending a message

---

### Test 5: Natural Language Description

**Steps:**
1. Login as Worker
2. Type a detailed description:
   ```
   I need to report a near miss that happened this morning around 8:30am
   at the tank farm near storage tank T-105. A loose valve handle almost
   fell on me while I was doing my routine inspection.
   ```
3. **Expected:** LLM extracts multiple fields at once
4. **Expected:** DraftCard shows several fields already filled

---

### Test 6: Voice Input

**Steps:**
1. Login as Worker
2. Click "Dictate" button
3. Say: "I want to report a near miss at the loading bay"
4. **Expected:** Text appears in input field
5. Click "Stop" then "Send"
6. **Expected:** Report initiated from voice input

---

### Test 7: Spill Report Flow

**Steps:**
1. Login as Worker
2. Type: "report a spill"
3. **Expected:** See DraftCard for Spill Report (6 fields)
4. Complete all fields including:
   - spill_type (should show options: diesel, crude_oil, etc.)
   - material_name
5. Submit and verify success

---

### Test 8: Inspection Report Flow

**Steps:**
1. Login as HSE Officer (HSE-3001)
2. Click "Inspection" or type: "log an inspection"
3. **Expected:** See DraftCard for Inspection (6 fields)
4. Complete including:
   - inspection_type (should show options)
   - inspection_date
5. Submit and verify success

---

## API Test Scripts

Run from `backend/` directory:

```bash
# Activate virtual environment
source venv/bin/activate

# Run all simple tests
python scripts/test_chat_simple.py all

# Run specific test
python scripts/test_chat_simple.py draft    # Test draft state structure
python scripts/test_chat_simple.py quick    # Test quick actions
python scripts/test_chat_simple.py field    # Test field updates
python scripts/test_chat_simple.py query    # Test query response
python scripts/test_chat_simple.py cancel   # Test cancel flow
python scripts/test_chat_simple.py structure # Test response structure

# Run full flow tests
python scripts/test_chat_flow.py near_miss  # Complete near miss flow
python scripts/test_chat_flow.py incident   # Complete incident flow
python scripts/test_chat_flow.py spill      # Complete spill flow
python scripts/test_chat_flow.py inspection # Complete inspection flow
python scripts/test_chat_flow.py query      # Test report queries
python scripts/test_chat_flow.py cancel     # Test partial flow with cancel
```

---

## Expected UI Components

### 1. DraftCard (during field collection)
- Header with report type icon and name
- Progress bar (0-100%)
- Field list with:
  - Field labels
  - Current values (or "Click to add...")
  - Status icons (✅ filled, ⬜ empty)
  - Edit buttons

### 2. FieldOptions (clickable buttons)
- Blue pill buttons for enum options
- Appears when current field has predefined options

### 3. ConfirmationCard (when all fields filled)
- Summary of all fields
- Edit button on each field
- "Discard" button (gray)
- "Submit Report" button (green)

### 4. SubmissionSuccessCard (after submission)
- Success icon and message
- Reference number in code format
- "New Report" button

---

## Known Behaviors

1. **LLM Re-classification**: The AI may change the report type based on message content (e.g., mentioning "oil spill" may switch from Near Miss to Spill Report)

2. **Cancel Only in Confirmation**: The word "cancel" is only recognized at the confirmation stage. During collection, just start a new chat.

3. **Field Updates via API**: Click-to-edit uses the `fieldUpdates` API parameter for direct updates without going through LLM.

4. **Progress Updates**: The DraftCard only shows for the latest assistant message to avoid duplicate cards in history.
