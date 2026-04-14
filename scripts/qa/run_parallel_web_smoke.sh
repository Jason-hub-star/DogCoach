#!/usr/bin/env bash
# TailLog 웹 QA 사전 점검용 병렬 스모크 스크립트.
# UI/인증/API 핵심 상태코드를 동시에 확인해 QA 시작 전 블로커를 빠르게 찾는다.

set -euo pipefail

FRONTEND_BASE_URL="${FRONTEND_BASE_URL:-http://localhost:3000}"
BACKEND_BASE_URL="${BACKEND_BASE_URL:-http://localhost:8000}"

OUT_DIR="${OUT_DIR:-./tmp_qa_smoke}"
mkdir -p "$OUT_DIR"

lane_auth() {
  {
    echo "[AUTH] checking /login"
    code="$(curl -sS -o "$OUT_DIR/login.html" -w "%{http_code}" "$FRONTEND_BASE_URL/login")"
    if [[ "$code" != "200" ]]; then
      echo "[AUTH][FAIL] /login status=$code"
      exit 1
    fi

    if ! rg -q "<title>.*TailLog" "$OUT_DIR/login.html"; then
      echo "[AUTH][FAIL] /login title check failed"
      exit 1
    fi

    echo "[AUTH][PASS] /login is reachable and contains TailLog title"
  } >"$OUT_DIR/lane_auth.log" 2>&1
}

lane_guest() {
  {
    echo "[GUEST] checking /survey and dashboard unauth"
    survey_code="$(curl -sS -o /dev/null -w "%{http_code}" "$FRONTEND_BASE_URL/survey")"
    if [[ "$survey_code" != "200" ]]; then
      echo "[GUEST][FAIL] /survey status=$survey_code"
      exit 1
    fi

    dashboard_code="$(curl -sS -o "$OUT_DIR/dashboard_unauth.json" -w "%{http_code}" "$BACKEND_BASE_URL/api/v1/dashboard/")"
    if [[ "$dashboard_code" != "401" ]]; then
      echo "[GUEST][FAIL] /api/v1/dashboard/ expected 401 got $dashboard_code"
      exit 1
    fi

    echo "[GUEST][PASS] guest route/API baseline is valid"
  } >"$OUT_DIR/lane_guest.log" 2>&1
}

lane_api() {
  {
    echo "[API] checking health and auth guard"
    health_body="$(curl -sS "$BACKEND_BASE_URL/health")"
    if ! echo "$health_body" | rg -q '"status"\s*:\s*"ok"'; then
      echo "[API][FAIL] /health body mismatch: $health_body"
      exit 1
    fi

    me_code="$(curl -sS -o "$OUT_DIR/auth_me_unauth.json" -w "%{http_code}" "$BACKEND_BASE_URL/api/v1/auth/me")"
    if [[ "$me_code" != "401" ]]; then
      echo "[API][FAIL] /api/v1/auth/me expected 401 got $me_code"
      exit 1
    fi

    echo "[API][PASS] API baseline is valid"
  } >"$OUT_DIR/lane_api.log" 2>&1
}

echo "Running parallel smoke lanes..."
lane_auth &
PID_AUTH=$!
lane_guest &
PID_GUEST=$!
lane_api &
PID_API=$!

FAILED=0
for pid in "$PID_AUTH" "$PID_GUEST" "$PID_API"; do
  if ! wait "$pid"; then
    FAILED=1
  fi
done

echo
echo "=== Lane Logs ==="
for f in "$OUT_DIR"/lane_*.log; do
  echo "--- $f ---"
  cat "$f"
done

if [[ "$FAILED" -ne 0 ]]; then
  echo
  echo "Parallel smoke result: FAIL"
  exit 1
fi

echo
echo "Parallel smoke result: PASS"
