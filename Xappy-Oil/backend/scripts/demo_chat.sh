#!/bin/bash

# =============================================================================
# XAPPY Chat Demo Script
# =============================================================================
# Run this script to test the chat flow manually
# Usage: ./scripts/demo_chat.sh
# =============================================================================

BASE_URL="http://localhost:8000/api/v1"
TOKEN=""
CONV_ID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================${NC}"
}

print_step() {
    echo ""
    echo -e "${YELLOW}>>> $1${NC}"
}

print_response() {
    echo -e "${GREEN}$1${NC}"
}

# -----------------------------------------------------------------------------
# Step 1: Login
# -----------------------------------------------------------------------------
login() {
    print_header "STEP 1: LOGIN"
    print_step "Logging in as Worker (WKR-1001)..."

    RESPONSE=$(curl -s -X POST "$BASE_URL/auth/badge-login" \
        -H "Content-Type: application/json" \
        -d '{"badge_number": "WKR-1001", "pin": "1234"}')

    TOKEN=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ Login successful!${NC}"
        echo "Token: ${TOKEN:0:50}..."
    else
        echo -e "${RED}❌ Login failed: $RESPONSE${NC}"
        exit 1
    fi
}

# -----------------------------------------------------------------------------
# Send Chat Message
# -----------------------------------------------------------------------------
send_message() {
    local MESSAGE="$1"
    local SHOW_FULL="${2:-false}"

    print_step "Sending: \"$MESSAGE\""

    if [ -n "$CONV_ID" ]; then
        PAYLOAD="{\"message\": \"$MESSAGE\", \"conversationId\": \"$CONV_ID\"}"
    else
        PAYLOAD="{\"message\": \"$MESSAGE\"}"
    fi

    RESPONSE=$(curl -s -X POST "$BASE_URL/chat/send" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")

    # Extract fields from response
    CONTENT=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('content', '')[:200])" 2>/dev/null)
    CONV_ID=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('conversationId', ''))" 2>/dev/null)

    echo ""
    echo -e "${GREEN}Response:${NC} $CONTENT"

    # Show draft state if present
    DRAFT_STATE=$(echo $RESPONSE | python3 -c "
import sys, json
data = json.load(sys.stdin)
ds = data.get('draftState')
if ds:
    print(f\"Report: {ds.get('reportTypeLabel', 'N/A')}\")
    print(f\"Progress: {ds.get('filledCount', 0)}/{ds.get('totalRequired', 0)} ({ds.get('progressPercent', 0)}%)\")
    print(f\"Stage: {ds.get('stage', 'N/A')}\")
    print(f\"Next Field: {ds.get('nextField', 'N/A')}\")
    print('Fields:')
    for f in ds.get('fields', []):
        status = '✅' if f.get('isValid') else '⬜'
        val = f.get('value') or '-'
        print(f\"  {status} {f.get('label')}: {str(val)[:40]}\")
" 2>/dev/null)

    if [ -n "$DRAFT_STATE" ]; then
        echo ""
        echo -e "${BLUE}📋 Draft State:${NC}"
        echo "$DRAFT_STATE"
    fi

    # Show quick actions if present
    QUICK_ACTIONS=$(echo $RESPONSE | python3 -c "
import sys, json
data = json.load(sys.stdin)
qa = data.get('quickActions', [])
if qa:
    labels = [a.get('label') for a in qa[:8]]
    print(', '.join(labels))
" 2>/dev/null)

    if [ -n "$QUICK_ACTIONS" ]; then
        echo ""
        echo -e "${YELLOW}⚡ Quick Actions:${NC} $QUICK_ACTIONS"
    fi

    # Show submission result if present
    SUBMISSION=$(echo $RESPONSE | python3 -c "
import sys, json
data = json.load(sys.stdin)
sr = data.get('submissionResult')
if sr:
    print(f\"Reference: {sr.get('referenceNumber')}\")
    print(f\"Type: {sr.get('reportType')}\")
" 2>/dev/null)

    if [ -n "$SUBMISSION" ]; then
        echo ""
        echo -e "${GREEN}🎉 SUBMISSION RESULT:${NC}"
        echo "$SUBMISSION"
    fi

    if [ "$SHOW_FULL" = "true" ]; then
        echo ""
        echo -e "${BLUE}Full Response:${NC}"
        echo $RESPONSE | python3 -m json.tool
    fi
}

# -----------------------------------------------------------------------------
# Demo 1: Complete Near Miss Report
# -----------------------------------------------------------------------------
demo_near_miss() {
    print_header "DEMO: COMPLETE NEAR MISS REPORT"

    login

    echo ""
    echo "This demo will create a complete Near Miss report step by step."
    echo "Press Enter to continue after each step..."
    read

    print_header "STEP 2: START NEAR MISS REPORT"
    send_message "I want to report a near miss"
    read

    print_header "STEP 3: PROVIDE TITLE"
    send_message "Slip hazard near Tank 42"
    read

    print_header "STEP 4: PROVIDE DESCRIPTION"
    send_message "Found oil puddle on walkway near Tank 42. Could have caused someone to slip and fall."
    read

    print_header "STEP 5: PROVIDE DATE/TIME"
    send_message "today at 9:30am"
    read

    print_header "STEP 6: PROVIDE LOCATION"
    send_message "Tank Farm Area, near Tank 42, west side"
    read

    print_header "STEP 7: PROVIDE CATEGORY"
    echo "Choose from the quick actions above, or type the category"
    send_message "slip trip fall"
    read

    print_header "STEP 8: CONFIRM SUBMISSION"
    send_message "yes"

    echo ""
    echo -e "${GREEN}✅ Demo Complete!${NC}"
}

# -----------------------------------------------------------------------------
# Demo 2: Query Reports
# -----------------------------------------------------------------------------
demo_query() {
    print_header "DEMO: QUERY EXISTING REPORTS"

    echo "Logging in as Supervisor to see more reports..."

    RESPONSE=$(curl -s -X POST "$BASE_URL/auth/badge-login" \
        -H "Content-Type: application/json" \
        -d '{"badge_number": "SUP-2001", "pin": "1234"}')

    TOKEN=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ Logged in as Supervisor${NC}"
    fi

    echo ""
    echo "Press Enter to continue..."
    read

    print_header "QUERY 1: COUNT ALL REPORTS"
    send_message "how many reports do I have?"
    read

    print_header "QUERY 2: LIST REPORTS"
    send_message "show my reports"
    read

    print_header "QUERY 3: FILTER BY TYPE"
    send_message "show near miss reports"
    read

    print_header "QUERY 4: FILTER BY STATUS"
    send_message "show pending reports"

    echo ""
    echo -e "${GREEN}✅ Query Demo Complete!${NC}"
}

# -----------------------------------------------------------------------------
# Demo 3: Incident Report
# -----------------------------------------------------------------------------
demo_incident() {
    print_header "DEMO: COMPLETE INCIDENT REPORT"

    login

    echo ""
    echo "This demo will create a complete Incident report."
    echo "Press Enter to continue..."
    read

    print_header "STEP 2: START INCIDENT REPORT"
    send_message "I need to report an incident"
    read

    print_header "STEP 3: PROVIDE TITLE"
    send_message "Minor hand injury during valve operation"
    read

    print_header "STEP 4: PROVIDE DESCRIPTION"
    send_message "Worker cut hand while operating manual valve. First aid applied on site."
    read

    print_header "STEP 5: PROVIDE DATE/TIME"
    send_message "yesterday at 2pm"
    read

    print_header "STEP 6: PROVIDE LOCATION"
    send_message "Pump Station B, valve V-102"
    read

    print_header "STEP 7: PROVIDE INCIDENT TYPE"
    send_message "injury"
    read

    print_header "STEP 8: PROVIDE SEVERITY"
    send_message "first aid"
    read

    print_header "STEP 9: CONFIRM SUBMISSION"
    send_message "yes"

    echo ""
    echo -e "${GREEN}✅ Incident Demo Complete!${NC}"
}

# -----------------------------------------------------------------------------
# Demo 4: Spill Report
# -----------------------------------------------------------------------------
demo_spill() {
    print_header "DEMO: COMPLETE SPILL REPORT"

    login

    echo ""
    echo "This demo will create a complete Spill report."
    echo "Press Enter to continue..."
    read

    print_header "STEP 2: START SPILL REPORT"
    send_message "report a spill"
    read

    print_header "STEP 3: PROVIDE TITLE"
    send_message "Diesel spill at loading bay"
    read

    print_header "STEP 4: PROVIDE DESCRIPTION"
    send_message "Approximately 5 liters of diesel spilled during truck loading. Contained with absorbent."
    read

    print_header "STEP 5: PROVIDE DATE/TIME"
    send_message "this morning at 7am"
    read

    print_header "STEP 6: PROVIDE LOCATION"
    send_message "Loading Bay 3, north side"
    read

    print_header "STEP 7: PROVIDE SPILL TYPE"
    send_message "diesel"
    read

    print_header "STEP 8: PROVIDE MATERIAL NAME"
    send_message "Diesel fuel"
    read

    print_header "STEP 9: CONFIRM SUBMISSION"
    send_message "confirm"

    echo ""
    echo -e "${GREEN}✅ Spill Demo Complete!${NC}"
}

# -----------------------------------------------------------------------------
# Demo 5: Natural Language Input
# -----------------------------------------------------------------------------
demo_natural() {
    print_header "DEMO: NATURAL LANGUAGE INPUT"

    login

    echo ""
    echo "This demo shows how the AI extracts multiple fields from natural language."
    echo "Press Enter to continue..."
    read

    print_header "STEP 2: PROVIDE RICH DESCRIPTION"
    echo "Sending a detailed natural language description..."
    send_message "I need to report a near miss that happened this morning around 8:30am at the tank farm near storage tank T-105. A loose valve handle almost fell on me while I was doing my routine inspection. It was an equipment malfunction issue."

    echo ""
    echo "Notice how multiple fields were extracted from the natural description!"

    echo ""
    echo -e "${GREEN}✅ Natural Language Demo Complete!${NC}"
}

# -----------------------------------------------------------------------------
# Interactive Mode
# -----------------------------------------------------------------------------
interactive() {
    print_header "INTERACTIVE CHAT MODE"

    login

    echo ""
    echo "You are now in interactive mode. Type your messages and press Enter."
    echo "Type 'quit' or 'exit' to end."
    echo "Type 'reset' to start a new conversation."
    echo ""

    while true; do
        echo -n -e "${YELLOW}You: ${NC}"
        read INPUT

        if [ "$INPUT" = "quit" ] || [ "$INPUT" = "exit" ]; then
            echo "Goodbye!"
            break
        fi

        if [ "$INPUT" = "reset" ]; then
            CONV_ID=""
            echo -e "${GREEN}Conversation reset. Starting fresh...${NC}"
            continue
        fi

        if [ -n "$INPUT" ]; then
            send_message "$INPUT"
        fi
    done
}

# -----------------------------------------------------------------------------
# Main Menu
# -----------------------------------------------------------------------------
show_menu() {
    echo ""
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}           XAPPY CHAT DEMO SCRIPT${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo ""
    echo "Choose a demo to run:"
    echo ""
    echo "  1) Near Miss Report  - Complete near miss flow"
    echo "  2) Incident Report   - Complete incident flow"
    echo "  3) Spill Report      - Complete spill flow"
    echo "  4) Query Reports     - Test report queries"
    echo "  5) Natural Language  - AI field extraction"
    echo "  6) Interactive Mode  - Free chat"
    echo ""
    echo "  q) Quit"
    echo ""
    echo -n "Enter choice [1-6, q]: "
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
main() {
    if [ "$1" = "near_miss" ]; then
        demo_near_miss
    elif [ "$1" = "incident" ]; then
        demo_incident
    elif [ "$1" = "spill" ]; then
        demo_spill
    elif [ "$1" = "query" ]; then
        demo_query
    elif [ "$1" = "natural" ]; then
        demo_natural
    elif [ "$1" = "interactive" ]; then
        interactive
    else
        while true; do
            show_menu
            read CHOICE

            case $CHOICE in
                1) demo_near_miss ;;
                2) demo_incident ;;
                3) demo_spill ;;
                4) demo_query ;;
                5) demo_natural ;;
                6) interactive ;;
                q|Q) echo "Goodbye!"; exit 0 ;;
                *) echo -e "${RED}Invalid choice. Try again.${NC}" ;;
            esac
        done
    fi
}

main "$1"
