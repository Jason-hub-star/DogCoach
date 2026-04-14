#!/bin/bash
# docs/status/PROJECT-STATUS.md의 done(YYYY-MM-DD) 항목 중 오래된 항목을 정리한다.
# 기본은 14일 기준이며 --dry-run으로 변경 없이 대상만 출력한다.

set -euo pipefail

FILE="docs/status/PROJECT-STATUS.md"
DAYS=14
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --days)
      DAYS="$2"
      shift 2
      ;;
    --file)
      FILE="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ ! -f "$FILE" ]]; then
  echo "Status file not found: $FILE" >&2
  exit 1
fi

to_epoch() {
  local date_str="$1"
  date -j -f "%Y-%m-%d" "$date_str" +%s 2>/dev/null || date -d "$date_str" +%s 2>/dev/null
}

TODAY_EPOCH="$(date +%s)"
PRUNED=0

if $DRY_RUN; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ done\ \(([0-9]{4}-[0-9]{2}-[0-9]{2})\) ]]; then
      DATE_STR="${BASH_REMATCH[1]}"
      ITEM_EPOCH="$(to_epoch "$DATE_STR" || true)"
      if [[ -n "$ITEM_EPOCH" ]]; then
        DIFF_DAYS=$(( (TODAY_EPOCH - ITEM_EPOCH) / 86400 ))
        if (( DIFF_DAYS > DAYS )); then
          echo "PRUNE ($DIFF_DAYS days): $line"
          PRUNED=$((PRUNED + 1))
        fi
      fi
    fi
  done < "$FILE"

  echo "Dry-run complete. prune candidates: $PRUNED"
  exit 0
fi

TMP_FILE="$(mktemp)"
while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" =~ done\ \(([0-9]{4}-[0-9]{2}-[0-9]{2})\) ]]; then
    DATE_STR="${BASH_REMATCH[1]}"
    ITEM_EPOCH="$(to_epoch "$DATE_STR" || true)"
    if [[ -n "$ITEM_EPOCH" ]]; then
      DIFF_DAYS=$(( (TODAY_EPOCH - ITEM_EPOCH) / 86400 ))
      if (( DIFF_DAYS > DAYS )); then
        echo "PRUNE ($DIFF_DAYS days): $line"
        PRUNED=$((PRUNED + 1))
        continue
      fi
    fi
  fi

  printf '%s\n' "$line" >> "$TMP_FILE"
done < "$FILE"

mv "$TMP_FILE" "$FILE"
echo "Prune complete. removed: $PRUNED"
