#!/usr/bin/env bash
# TailLog API 병렬 QA 러너.
# 게스트 설문/대시보드 흐름, 인증 가드, 유효성 검증을 병렬 실행한다.

set -euo pipefail

BACKEND_BASE_URL="${BACKEND_BASE_URL:-http://localhost:8000}"
OUT_DIR="${OUT_DIR:-./tmp_qa_api}"
mkdir -p "$OUT_DIR"

lane_guest_journey() {
  {
    echo "[GUEST] start guest survey -> dashboard journey"
    COOKIE_JAR="$OUT_DIR/guest_cookies.txt"
    PAYLOAD_FILE="$OUT_DIR/survey_payload.json"
    cat > "$PAYLOAD_FILE" <<'JSON'
{
  "name": "qa_dog_guest",
  "breed": "mixed",
  "chronic_issues": { "top_issues": ["짖음"] },
  "triggers": { "ids": ["초인종"] }
}
JSON

    code_submit="$(curl -sS -c "$COOKIE_JAR" -o "$OUT_DIR/survey_submit.json" -w "%{http_code}" \
      -H "Content-Type: application/json" \
      -X POST "$BACKEND_BASE_URL/api/v1/onboarding/survey" \
      --data-binary "@$PAYLOAD_FILE")"
    if [[ "$code_submit" != "201" ]]; then
      echo "[GUEST][FAIL] survey submit expected 201 got $code_submit"
      cat "$OUT_DIR/survey_submit.json"
      exit 1
    fi

    code_dashboard="$(curl -sS -b "$COOKIE_JAR" -o "$OUT_DIR/dashboard_guest.json" -w "%{http_code}" \
      "$BACKEND_BASE_URL/api/v1/dashboard/")"
    if [[ "$code_dashboard" != "200" ]]; then
      echo "[GUEST][FAIL] dashboard with guest cookie expected 200 got $code_dashboard"
      cat "$OUT_DIR/dashboard_guest.json"
      exit 1
    fi

    if ! rg -q '"dog_profile"' "$OUT_DIR/dashboard_guest.json"; then
      echo "[GUEST][FAIL] dashboard response missing dog_profile"
      cat "$OUT_DIR/dashboard_guest.json"
      exit 1
    fi

    echo "[GUEST][PASS] guest journey succeeded"
  } >"$OUT_DIR/lane_guest_journey.log" 2>&1
}

lane_auth_guard() {
  {
    echo "[AUTH] check unauth protected endpoints"
    code_me="$(curl -sS -o "$OUT_DIR/auth_me_unauth.json" -w "%{http_code}" \
      "$BACKEND_BASE_URL/api/v1/auth/me")"
    if [[ "$code_me" != "401" ]]; then
      echo "[AUTH][FAIL] /auth/me expected 401 got $code_me"
      cat "$OUT_DIR/auth_me_unauth.json"
      exit 1
    fi

    code_migrate="$(curl -sS -o "$OUT_DIR/migrate_unauth.json" -w "%{http_code}" \
      -X POST "$BACKEND_BASE_URL/api/v1/auth/migrate-guest")"
    if [[ "$code_migrate" != "401" ]]; then
      echo "[AUTH][FAIL] /auth/migrate-guest expected 401 got $code_migrate"
      cat "$OUT_DIR/migrate_unauth.json"
      exit 1
    fi

    echo "[AUTH][PASS] auth guard baseline succeeded"
  } >"$OUT_DIR/lane_auth_guard.log" 2>&1
}

lane_validation() {
  {
    echo "[VALIDATION] check survey validation error handling"
    BAD_PAYLOAD="$OUT_DIR/survey_invalid_payload.json"
    cat > "$BAD_PAYLOAD" <<'JSON'
{
  "name": "qa_invalid",
  "breed": "mixed",
  "chronic_issues": { "top_issues": [] },
  "triggers": { "ids": [] }
}
JSON

    code_bad="$(curl -sS -o "$OUT_DIR/survey_invalid_resp.json" -w "%{http_code}" \
      -H "Content-Type: application/json" \
      -X POST "$BACKEND_BASE_URL/api/v1/onboarding/survey" \
      --data-binary "@$BAD_PAYLOAD")"
    if [[ "$code_bad" != "422" ]]; then
      echo "[VALIDATION][FAIL] invalid survey expected 422 got $code_bad"
      cat "$OUT_DIR/survey_invalid_resp.json"
      exit 1
    fi

    echo "[VALIDATION][PASS] invalid payload rejected as expected"
  } >"$OUT_DIR/lane_validation.log" 2>&1
}

echo "Running parallel API QA lanes..."
lane_guest_journey &
PID_GUEST=$!
lane_auth_guard &
PID_AUTH=$!
lane_validation &
PID_VALID=$!

FAILED=0
for pid in "$PID_GUEST" "$PID_AUTH" "$PID_VALID"; do
  if ! wait "$pid"; then
    FAILED=1
  fi
done

echo
echo "=== API QA Lane Logs ==="
for f in "$OUT_DIR"/lane_*.log; do
  echo "--- $f ---"
  cat "$f"
done

if [[ "$FAILED" -ne 0 ]]; then
  echo
  echo "Parallel API QA result: FAIL"
  exit 1
fi

echo
echo "Parallel API QA result: PASS"

