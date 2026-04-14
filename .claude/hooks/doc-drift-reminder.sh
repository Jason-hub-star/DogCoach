#!/bin/bash
# 코드 편집이 누적되면 .agent 문서 동기화를 리마인드한다.

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

if [[ "$FILE_PATH" =~ ^.*/(Frontend/src/|Backend/app/|Backend/migrations/).* ]]; then
  COUNTER_FILE="/tmp/taillogweb-doc-sync-counter"
  if [[ -f "$COUNTER_FILE" ]]; then
    COUNT="$(cat "$COUNTER_FILE")"
  else
    COUNT=0
  fi

  COUNT=$((COUNT + 1))
  echo "$COUNT" > "$COUNTER_FILE"

  if [[ $((COUNT % 4)) -eq 0 ]]; then
    cat <<JSONEOF
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "[doc-drift-reminder] 구현 변경이 누적되었습니다. /doc-sync로 누락을 점검하고 /doc-update로 docs/status/PROJECT-STATUS.md와 관련 정본 문서를 최신화하세요."
  }
}
JSONEOF
  fi
fi

exit 0
