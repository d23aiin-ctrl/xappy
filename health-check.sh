#!/usr/bin/env bash
#
# Xappy Platform Health Check
# Checks all services and prints a status table.
#
# Usage:
#   ./health-check.sh            # Color table output
#   ./health-check.sh --json     # JSON output
#   ./health-check.sh --watch 5  # Refresh every 5 seconds
#

set -euo pipefail

# ─── Defaults ────────────────────────────────────────────────────
JSON_MODE=false
WATCH_MODE=false
WATCH_INTERVAL=5
TIMEOUT=3  # curl/connect timeout in seconds

# ─── Colors ──────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  YELLOW='\033[0;33m'
  BOLD='\033[1m'
  DIM='\033[2m'
  RESET='\033[0m'
else
  GREEN='' RED='' YELLOW='' BOLD='' DIM='' RESET=''
fi

# ─── Parse args ──────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --json)   JSON_MODE=true; shift ;;
    --watch)  WATCH_MODE=true; WATCH_INTERVAL="${2:-5}"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--json] [--watch N] [--help]"
      echo "  --json       Output results as JSON"
      echo "  --watch N    Refresh every N seconds (default 5)"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# ─── Service definitions ────────────────────────────────────────
# Format: name|port|check_type|extra
# check_type: pg, redis, http, api
SERVICES=(
  "PostgreSQL|5432|pg|"
  "Redis|6379|redis|"
  "XappyIO (web)|5051|http|"
  "Health API|5056|api|/health"
  "Health Web|5053|http|"
  "Oil API|5054|api|/health"
  "Oil Web|5052|http|"
  "Property API|5058|api|/health"
  "Property Web|5057|http|"
  "Moodcraft API|5161|api|/health"
  "Moodcraft Web|5160|http|"
)

# ─── Check functions ────────────────────────────────────────────

check_pg() {
  local port=$1
  if command -v pg_isready &>/dev/null; then
    if pg_isready -h localhost -p "$port" -t "$TIMEOUT" &>/dev/null; then
      echo "UP|pg_isready OK"
    else
      echo "DOWN|pg_isready failed"
    fi
  else
    # Fallback: try TCP connect
    if (echo >/dev/tcp/localhost/"$port") 2>/dev/null; then
      echo "UP|port open (pg_isready not installed)"
    else
      echo "DOWN|port closed"
    fi
  fi
}

check_redis() {
  local port=$1
  if command -v redis-cli &>/dev/null; then
    local resp
    resp=$(redis-cli -h localhost -p "$port" ping 2>/dev/null || true)
    if [[ "$resp" == "PONG" ]]; then
      echo "UP|PONG"
    else
      echo "DOWN|no PONG response"
    fi
  else
    if (echo >/dev/tcp/localhost/"$port") 2>/dev/null; then
      echo "UP|port open (redis-cli not installed)"
    else
      echo "DOWN|port closed"
    fi
  fi
}

check_http() {
  local port=$1
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout "$TIMEOUT" --max-time "$TIMEOUT" "http://localhost:${port}/" 2>/dev/null) || true
  if [[ -z "$code" || "$code" == "000" ]]; then
    echo "DOWN|connection refused"
  elif [[ "$code" =~ ^[23] ]]; then
    echo "UP|HTTP ${code}"
  else
    echo "DEGRADED|HTTP ${code}"
  fi
}

check_api() {
  local port=$1
  local path=$2
  local resp
  resp=$(curl -s --connect-timeout "$TIMEOUT" --max-time "$TIMEOUT" "http://localhost:${port}${path}" 2>/dev/null) || true

  if [[ -z "$resp" ]]; then
    echo "DOWN|connection refused"
    return
  fi

  local status
  status=$(echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || echo "")

  if [[ "$status" == "healthy" ]]; then
    # Try to extract version or service name for details
    local detail
    detail=$(echo "$resp" | python3 -c "
import sys, json
d = json.load(sys.stdin)
parts = []
if d.get('service'): parts.append(d['service'])
if d.get('app'): parts.append(d['app'])
if d.get('version'): parts.append('v' + d['version'])
print(' '.join(parts) if parts else 'healthy')
" 2>/dev/null || echo "healthy")
    echo "UP|healthy (${detail})"
  elif [[ -n "$status" ]]; then
    echo "DEGRADED|status: ${status}"
  else
    echo "DEGRADED|unexpected response"
  fi
}

# ─── Run all checks ─────────────────────────────────────────────

run_checks() {
  local results=()
  local total=${#SERVICES[@]}
  local healthy=0

  for svc in "${SERVICES[@]}"; do
    IFS='|' read -r name port check_type extra <<< "$svc"
    local result
    case "$check_type" in
      pg)    result=$(check_pg "$port") ;;
      redis) result=$(check_redis "$port") ;;
      http)  result=$(check_http "$port") ;;
      api)   result=$(check_api "$port" "$extra") ;;
    esac
    IFS='|' read -r status details <<< "$result"
    [[ "$status" == "UP" ]] && ((healthy++))
    results+=("${name}|${port}|${status}|${details}")
  done

  # ─── Output ──────────────────────────────────────────────────

  if $JSON_MODE; then
    print_json "$total" "$healthy" "${results[@]}"
  else
    print_table "$total" "$healthy" "${results[@]}"
  fi

  # Exit code
  [[ "$healthy" -eq "$total" ]] && return 0 || return 1
}

# ─── Table output ────────────────────────────────────────────────

print_table() {
  local total=$1 healthy=$2
  shift 2
  local results=("$@")

  echo ""
  echo -e "${BOLD}Xappy Platform Health Check${RESET}"
  echo "============================"
  printf "%-20s %-6s %-10s %s\n" "Service" "Port" "Status" "Details"
  echo "─────────────────────────────────────────────────"

  for entry in "${results[@]}"; do
    IFS='|' read -r name port status details <<< "$entry"
    local color
    case "$status" in
      UP)       color="$GREEN" ;;
      DOWN)     color="$RED" ;;
      DEGRADED) color="$YELLOW" ;;
      *)        color="$RESET" ;;
    esac
    printf "%-20s %-6s ${color}%-10s${RESET} %s\n" "$name" "$port" "$status" "$details"
  done

  echo "─────────────────────────────────────────────────"

  local result_color="$GREEN"
  [[ "$healthy" -lt "$total" ]] && result_color="$RED"
  echo -e "Result: ${result_color}${healthy}/${total} services healthy${RESET}"
  echo ""
}

# ─── JSON output ─────────────────────────────────────────────────

print_json() {
  local total=$1 healthy=$2
  shift 2
  local results=("$@")

  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  echo "{"
  echo "  \"timestamp\": \"${timestamp}\","
  echo "  \"total\": ${total},"
  echo "  \"healthy\": ${healthy},"
  echo "  \"all_healthy\": $([ "$healthy" -eq "$total" ] && echo true || echo false),"
  echo "  \"services\": ["

  local i=0
  local count=${#results[@]}
  for entry in "${results[@]}"; do
    IFS='|' read -r name port status details <<< "$entry"
    local comma=","
    ((i++))
    [[ $i -eq $count ]] && comma=""
    echo "    {"
    echo "      \"name\": \"${name}\","
    echo "      \"port\": ${port},"
    echo "      \"status\": \"${status}\","
    echo "      \"details\": \"${details}\""
    echo "    }${comma}"
  done

  echo "  ]"
  echo "}"
}

# ─── Main ────────────────────────────────────────────────────────

if $WATCH_MODE; then
  while true; do
    clear
    run_checks || true
    echo -e "${DIM}Refreshing every ${WATCH_INTERVAL}s — Ctrl+C to stop${RESET}"
    sleep "$WATCH_INTERVAL"
  done
else
  run_checks
fi
