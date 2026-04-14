#!/usr/bin/env bash
# Runs dashboard render performance suite against production URLs.
# Uses local Frontend/node_modules/playwright and stores report in docs/qa/artifacts.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/docs/qa/artifacts/$(date +%Y-%m-%d)}"
FRONTEND_URL="${FRONTEND_URL:-https://www.mungai.co.kr}"
BACKEND_URL="${BACKEND_URL:-https://backend-production-61c6.up.railway.app}"

mkdir -p "$OUT_DIR"

echo "[info] Frontend: $FRONTEND_URL"
echo "[info] Backend:  $BACKEND_URL"
echo "[info] Out dir:  $OUT_DIR"

if [ ! -f "$ROOT_DIR/Frontend/node_modules/playwright/index.mjs" ]; then
  echo "[error] Missing playwright in Frontend/node_modules. Run: cd Frontend && npm install --no-save playwright"
  exit 1
fi

cd "$ROOT_DIR"
node scripts/qa/measure_dashboard_render_perf.mjs \
  --frontend-url "$FRONTEND_URL" \
  --backend-url "$BACKEND_URL" \
  --out-dir "$OUT_DIR"

echo "[done] dashboard performance suite complete"
