#!/bin/bash
# PostToolUse(Write/Edit) 후 프론트/백엔드 코드 편집 횟수를 추적하고 /self-review 실행을 리마인드한다.

set -euo pipefail

INPUT="$(cat)"
FILE_PATH="$(printf '%s' "$INPUT" | python3 -c 'import json,sys
try:
 d=json.load(sys.stdin)
 print((((d.get("tool_input") or {}).get("file_path")) or ""))
except Exception:
 print("")')"

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

if [[ "$FILE_PATH" =~ ^.*/(Frontend/src/.*\.(ts|tsx|css)|Backend/app/.*\.py)$ ]]; then
  COUNTER_FILE="/tmp/taillogweb-self-review-counter"
  if [[ -f "$COUNTER_FILE" ]]; then
    COUNT="$(cat "$COUNTER_FILE")"
  else
    COUNT=0
  fi

  COUNT=$((COUNT + 1))
  echo "$COUNT" > "$COUNTER_FILE"

  if [[ $((COUNT % 6)) -eq 0 ]]; then
    cat <<JSONEOF
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "[self-review-gate] 코드 파일 ${COUNT}개 편집됨. /self-review 실행으로 라우트 흐름(login->auth/callback->survey|dashboard), QUERY_KEYS 사용, Router->Service->Repository 경계를 점검하세요."
  }
}
JSONEOF
  fi
fi

exit 0
