#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UVCORN_CMD="python -m uvicorn app.main:app --reload"

ports=(5051 5052 5053 5054 5056 5057 5058 5160 5161)

PSQL_BIN="/opt/homebrew/opt/postgresql@15/bin/psql"

psql_cmd() {
  if [ -x "$PSQL_BIN" ]; then
    "$PSQL_BIN" "$@"
  else
    psql "$@"
  fi
}

ensure_db_bootstrap() {
  local role_exists db_exists

  role_exists="$(psql_cmd -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='xappy';" 2>/dev/null || true)"
  if [ "$role_exists" != "1" ]; then
    echo "Creating Postgres role: xappy"
    psql_cmd -d postgres -c "CREATE ROLE xappy WITH LOGIN SUPERUSER PASSWORD 'xappy_secret_2024';" || true
  fi

  db_exists="$(psql_cmd -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='xappy_db';" 2>/dev/null || true)"
  if [ "$db_exists" != "1" ]; then
    echo "Creating Postgres database: xappy_db"
    psql_cmd -d postgres -c "CREATE DATABASE xappy_db OWNER xappy;" || true
  fi
}

port_in_use() {
  local port="$1"
  lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
}

wait_for_port_free() {
  local port="$1"
  local tries=0

  while port_in_use "$port"; do
    tries=$((tries + 1))
    if [ "$tries" -ge 40 ]; then
      return 1
    fi
    sleep 0.2
  done

  return 0
}

wait_for_port_listen() {
  local port="$1"
  local tries=0

  while ! port_in_use "$port"; do
    tries=$((tries + 1))
    if [ "$tries" -ge 80 ]; then
      return 1
    fi
    sleep 0.25
  done

  return 0
}

wait_for_http_ready() {
  local port="$1"
  local path="${2:-/}"
  local tries=0
  local code

  while true; do
    code="$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:${port}${path}" 2>/dev/null || true)"
    if [ "$code" != "000" ] && [ -n "$code" ]; then
      return 0
    fi
    tries=$((tries + 1))
    if [ "$tries" -ge 120 ]; then
      return 1
    fi
    sleep 0.5
  done
}

ensure_ports_free() {
  local pids
  local port

  for port in "${ports[@]}"; do
    free_port "$port"
  done

  return 0
}

free_port() {
  local port="$1"
  local pids

  pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null | awk 'NR>1 {print $2}' | sort -u | tr '\n' ' ')"
  if [ -n "${pids// }" ]; then
    echo "Port $port in use; stopping PIDs: $pids"
    kill $pids || true
    if ! wait_for_port_free "$port"; then
      pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null | awk 'NR>1 {print $2}' | sort -u | tr '\n' ' ')"
      echo "Port $port still in use; force killing PIDs: $pids"
      kill -9 $pids || true
      wait_for_port_free "$port" || true
    fi
  fi
}

find_python_bin() {
  local dir="$1"
  if [ -x "$dir/.venv/bin/python" ]; then
    echo "$dir/.venv/bin/python"
    return 0
  fi
  if [ -x "$dir/venv/bin/python" ]; then
    echo "$dir/venv/bin/python"
    return 0
  fi
  return 1
}

echo "Starting Xappy services on nginx-mapped ports..."
echo "Main web:    http://localhost:5051 (https://xappy.io)"
echo "Health web:  http://localhost:5053 (https://health.xappy.io)"
echo "Health api:  http://localhost:5056 (https://healthapi.xappy.io)"
echo "Oil web:     http://localhost:5052 (https://oilngas.xappy.io)"
echo "Oil api:     http://localhost:5054 (https://oilngasapi.xappy.io)"
echo "Property:    http://localhost:5057 (https://prop.xappy.io)"
echo "Property api:http://localhost:5058 (https://propapi.xappy.io)"
echo "Moodcraft:   http://localhost:5160 (https://moodcraft.xappy.io)"
echo "Mood api:    http://localhost:5161 (https://apimoodcraft.xappy.io)"
echo ""

ensure_ports_free

echo "Cleaning any existing uvicorn/next dev processes..."
pkill -f "uvicorn app.main:app" 2>/dev/null || true
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

echo "Ensuring Postgres role/db exist..."
ensure_db_bootstrap

start_backend() {
  local dir="$1"
  local port="$2"
  local name="$3"
  local pybin

  pybin="$(find_python_bin "$dir" || true)"
  if [ -z "$pybin" ]; then
    echo "Missing virtualenv python in $dir (.venv/bin/python or venv/bin/python)."
    return 1
  fi

  (
    cd "$dir" || exit 1
    "$pybin" -m uvicorn app.main:app --reload --port "$port"
  ) &
  local pid=$!
  echo "Started $name backend (PID $pid) on port $port"
}

start_frontend() {
  local dir="$1"
  local port="$2"
  local api_url="$3"
  local name="$4"

  (
    cd "$dir" || exit 1
    NEXT_PUBLIC_API_URL="$api_url" npm run dev -- --port "$port"
  ) &
  local pid=$!
  echo "Started $name frontend (PID $pid) on port $port"
}

start_site_frontend() {
  local dir="$1"
  local port="$2"
  local name="$3"

  (
    cd "$dir" || exit 1
    npm run dev -- --port "$port"
  ) &
  local pid=$!
  echo "Started $name frontend (PID $pid) on port $port"
}

start_moodcraft_backend() {
  local dir="$1"
  local port="$2"
  local name="$3"
  local pybin

  pybin="$(find_python_bin "$dir" || true)"
  if [ -z "$pybin" ] || ! "$pybin" -c "import fastapi,uvicorn" >/dev/null 2>&1; then
    if [ -x "$ROOT_DIR/Xappy-Health/backend/.venv/bin/python" ]; then
      pybin="$ROOT_DIR/Xappy-Health/backend/.venv/bin/python"
    fi
  fi
  if [ -z "$pybin" ]; then
    echo "No usable python runtime found for Moodcraft backend."
    return 1
  fi

  (
    cd "$dir" || exit 1
    OPENAI_API_KEY="${OPENAI_API_KEY:-dummy-key-for-local-dev}" \
      "$pybin" -m uvicorn main:app --reload --host 0.0.0.0 --port "$port"
  ) &
  local pid=$!
  echo "Started $name backend (PID $pid) on port $port"
}

start_moodcraft_frontend() {
  local dir="$1"
  local port="$2"
  local api_url="$3"
  local app_url="$4"
  local name="$5"

  (
    cd "$dir" || exit 1
    if [ -f "prisma/schema.prisma" ]; then
      npx prisma generate >/tmp/moodcraft-prisma-generate.log 2>&1 || {
        echo "Prisma generate failed for $name frontend. See /tmp/moodcraft-prisma-generate.log"
        exit 1
      }
    fi
    NLP_SERVICE_URL="$api_url" NEXTAUTH_URL="$app_url" NEXT_PUBLIC_APP_URL="$app_url" npm run dev -- --port "$port"
  ) &
  local pid=$!
  echo "Started $name frontend (PID $pid) on port $port"
}

start_backend_with_retry() {
  local dir="$1"
  local port="$2"
  local name="$3"
  local url="$4"

  free_port "$port"
  wait_for_port_free "$port" || true
  start_backend "$dir" "$port" "$name"
  if wait_for_port_listen "$port"; then
    echo "Ready $name backend: $url"
    return 0
  fi

  echo "Backend $name not ready on port $port; retrying..."
  free_port "$port"
  wait_for_port_free "$port" || true
  start_backend "$dir" "$port" "$name"
  if wait_for_port_listen "$port"; then
    echo "Ready $name backend: $url"
    return 0
  fi

  echo "Failed to start $name backend on port $port"
  return 1
}

start_frontend_with_retry() {
  local dir="$1"
  local port="$2"
  local api_url="$3"
  local name="$4"
  local url="$5"

  free_port "$port"
  wait_for_port_free "$port" || true
  start_frontend "$dir" "$port" "$api_url" "$name"
  if wait_for_port_listen "$port" && wait_for_http_ready "$port" "/"; then
    echo "Ready $name frontend: $url"
    return 0
  fi

  echo "Frontend $name not ready on port $port; retrying..."
  free_port "$port"
  wait_for_port_free "$port" || true
  start_frontend "$dir" "$port" "$api_url" "$name"
  if wait_for_port_listen "$port" && wait_for_http_ready "$port" "/"; then
    echo "Ready $name frontend: $url"
    return 0
  fi

  echo "Failed to start $name frontend on port $port"
  return 1
}

start_site_frontend_with_retry() {
  local dir="$1"
  local port="$2"
  local name="$3"
  local url="$4"

  free_port "$port"
  wait_for_port_free "$port" || true
  start_site_frontend "$dir" "$port" "$name"
  if wait_for_port_listen "$port" && wait_for_http_ready "$port" "/"; then
    echo "Ready $name frontend: $url"
    return 0
  fi

  echo "Frontend $name not ready on port $port; retrying..."
  free_port "$port"
  wait_for_port_free "$port" || true
  start_site_frontend "$dir" "$port" "$name"
  if wait_for_port_listen "$port" && wait_for_http_ready "$port" "/"; then
    echo "Ready $name frontend: $url"
    return 0
  fi

  echo "Failed to start $name frontend on port $port"
  return 1
}

start_moodcraft_backend_with_retry() {
  local dir="$1"
  local port="$2"
  local name="$3"
  local url="$4"

  free_port "$port"
  wait_for_port_free "$port" || true
  start_moodcraft_backend "$dir" "$port" "$name"
  if wait_for_port_listen "$port"; then
    echo "Ready $name backend: $url"
    return 0
  fi

  echo "Backend $name not ready on port $port; retrying..."
  free_port "$port"
  wait_for_port_free "$port" || true
  start_moodcraft_backend "$dir" "$port" "$name"
  if wait_for_port_listen "$port"; then
    echo "Ready $name backend: $url"
    return 0
  fi

  echo "Failed to start $name backend on port $port"
  return 1
}

start_moodcraft_frontend_with_retry() {
  local dir="$1"
  local port="$2"
  local api_url="$3"
  local app_url="$4"
  local name="$5"
  local url="$6"

  free_port "$port"
  wait_for_port_free "$port" || true
  start_moodcraft_frontend "$dir" "$port" "$api_url" "$app_url" "$name"
  if wait_for_port_listen "$port" && wait_for_http_ready "$port" "/"; then
    echo "Ready $name frontend: $url"
    return 0
  fi

  echo "Frontend $name not ready on port $port; retrying..."
  free_port "$port"
  wait_for_port_free "$port" || true
  start_moodcraft_frontend "$dir" "$port" "$api_url" "$app_url" "$name"
  if wait_for_port_listen "$port" && wait_for_http_ready "$port" "/"; then
    echo "Ready $name frontend: $url"
    return 0
  fi

  echo "Failed to start $name frontend on port $port"
  return 1
}

start_site_frontend_with_retry "$ROOT_DIR/XappyIO" 5051 "Main Xappy" "http://localhost:5051"

start_backend_with_retry "$ROOT_DIR/Xappy-Health/backend" 5056 "Health" "http://localhost:5056"
start_frontend_with_retry "$ROOT_DIR/Xappy-Health/frontend" 5053 "https://healthapi.xappy.io" "Health" "http://localhost:5053"

start_backend_with_retry "$ROOT_DIR/Xappy-Oil/backend" 5054 "Oil" "http://localhost:5054"
start_frontend_with_retry "$ROOT_DIR/Xappy-Oil/frontend" 5052 "https://oilngasapi.xappy.io" "Oil" "http://localhost:5052"

start_backend_with_retry "$ROOT_DIR/Xappy-Property/backend" 5058 "Property" "http://localhost:5058"
start_frontend_with_retry "$ROOT_DIR/Xappy-Property/frontend" 5057 "https://propapi.xappy.io" "Property" "http://localhost:5057"

start_moodcraft_backend_with_retry "$ROOT_DIR/moodcraft/apps/nlp-service" 5161 "Moodcraft" "http://localhost:5161"
start_moodcraft_frontend_with_retry "$ROOT_DIR/moodcraft/apps/web" 5160 "https://apimoodcraft.xappy.io/api/v1" "https://moodcraft.xappy.io" "Moodcraft" "http://localhost:5160"

echo ""
echo "All processes started in background. Use Ctrl+C to stop this script; services keep running."
echo "URLs:"
echo "  Main web:   http://localhost:5051 | https://xappy.io"
echo "  Health web: http://localhost:5053 | https://health.xappy.io"
echo "  Health api: http://localhost:5056 | https://healthapi.xappy.io"
echo "  Oil web:    http://localhost:5052 | https://oilngas.xappy.io"
echo "  Oil api:    http://localhost:5054 | https://oilngasapi.xappy.io"
echo "  Property:   http://localhost:5057 | https://prop.xappy.io"
echo "  Property api: http://localhost:5058 | https://propapi.xappy.io"
echo "  Moodcraft:  http://localhost:5160 | https://moodcraft.xappy.io"
echo "  Mood api:   http://localhost:5161 | https://apimoodcraft.xappy.io"
echo "To stop them later, use: pkill -f \"uvicorn app.main:app|uvicorn main:app\" and pkill -f \"next dev\""

wait
