#!/usr/bin/env bash
set -euo pipefail

urls=(
  "https://xappy.io"
  "https://oilngas.xappy.io"
  "https://health.xappy.io"
  "https://healthapi.xappy.io"
  "https://oilngasapi.xappy.io"
  "https://prop.xappy.io"
  "https://propapi.xappy.io"
  "https://moodcraft.xappy.io"
  "https://apimoodcraft.xappy.io"
)

open_url() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url"
  else
    echo "No URL opener found (need 'open' or 'xdg-open')."
    exit 1
  fi
}

for url in "${urls[@]}"; do
  echo "Opening $url"
  open_url "$url"
done
