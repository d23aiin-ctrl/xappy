#!/usr/bin/env bash
set -u

ports=(5052 5053 5054 5056)

stop_by_ports() {
  local port
  local pids

  for port in "${ports[@]}"; do
    pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null | awk 'NR>1 {print $2}' | sort -u | tr '\n' ' ')"
    if [ -n "${pids// }" ]; then
      echo "Stopping port $port (PIDs: $pids)"
      kill $pids || true
    fi
  done
}

echo "Stopping Xappy Health + Oil & Gas services..."
stop_by_ports

echo "Stopping any remaining uvicorn/next dev processes..."
pkill -f "uvicorn app.main:app" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

echo "Done."
