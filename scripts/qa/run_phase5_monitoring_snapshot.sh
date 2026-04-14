#!/usr/bin/env bash
# Collects one Phase5 monitoring snapshot (Supabase advisors/inspect + storage checks).
# Optionally runs authenticated route baseline when session JSON is provided.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DATE_STAMP="$(date +%Y-%m-%d)"
TIME_STAMP="$(date +%H%M%S)"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/docs/qa/artifacts/$DATE_STAMP/live_perf_check/phase5_monitoring/$TIME_STAMP}"
FRONTEND_URL="${FRONTEND_URL:-https://www.mungai.co.kr}"
RUNS="${RUNS:-1}"
RUN_AUTH_BASELINE="${RUN_AUTH_BASELINE:-0}"
AUTH_SESSION_JSON="${AUTH_SESSION_JSON:-}"

mkdir -p "$OUT_DIR"

echo "[info] out dir: $OUT_DIR"
echo "[info] frontend: $FRONTEND_URL"

if [ ! -f "$ROOT_DIR/Backend/.env" ]; then
  echo "[error] Missing Backend/.env"
  exit 1
fi

DB_URL_RAW="$(grep '^DATABASE_URL=' "$ROOT_DIR/Backend/.env" | head -n1 | cut -d= -f2- || true)"
if [ -z "$DB_URL_RAW" ]; then
  echo "[error] DATABASE_URL is missing in Backend/.env"
  exit 1
fi

DB_PASSWORD="$(printf '%s' "$DB_URL_RAW" | sed -E 's#^[^:]+://[^:]+:([^@]+)@.*#\1#')"
if [ -z "$DB_PASSWORD" ]; then
  echo "[error] Failed to parse DB password from DATABASE_URL"
  exit 1
fi

run_supabase() {
  SUPABASE_DB_PASSWORD="$DB_PASSWORD" "$@"
}

cd "$ROOT_DIR"

run_supabase supabase db advisors --linked --type performance --level warn --output json \
  > "$OUT_DIR/performance_advisors_warn.json" \
  2> "$OUT_DIR/performance_advisors_warn.err" || true

if [ ! -s "$OUT_DIR/performance_advisors_warn.json" ] && rg -q "No issues found" "$OUT_DIR/performance_advisors_warn.err"; then
  echo '[]' > "$OUT_DIR/performance_advisors_warn.normalized.json"
else
  cp "$OUT_DIR/performance_advisors_warn.json" "$OUT_DIR/performance_advisors_warn.normalized.json"
fi

run_supabase supabase db advisors --linked --type security --level warn --output json \
  > "$OUT_DIR/security_advisors_warn.json" \
  2> "$OUT_DIR/security_advisors_warn.err" || true

run_supabase supabase inspect db index-stats --linked --output json \
  > "$OUT_DIR/index_stats.txt" \
  2> "$OUT_DIR/index_stats.err" || true

run_supabase supabase inspect db table-stats --linked --output json \
  > "$OUT_DIR/table_stats.txt" \
  2> "$OUT_DIR/table_stats.err" || true

run_supabase supabase inspect db long-running-queries --linked --output json \
  > "$OUT_DIR/long_running_queries.txt" \
  2> "$OUT_DIR/long_running_queries.err" || true

run_supabase supabase --experimental storage ls ss:/// --linked --output json \
  > "$OUT_DIR/storage_buckets.txt" \
  2> "$OUT_DIR/storage_buckets.err" || true

run_supabase supabase db query --linked --output json \
  "select id, name, public, file_size_limit, allowed_mime_types from storage.buckets where id='dog-profiles';" \
  > "$OUT_DIR/storage_bucket_dog_profiles.json" \
  2> "$OUT_DIR/storage_bucket_dog_profiles.err" || true

run_supabase supabase db query --linked --output json \
  "select policyname, cmd, roles, qual, with_check from pg_policies where schemaname='storage' and tablename='objects' order by policyname;" \
  > "$OUT_DIR/storage_objects_policies.json" \
  2> "$OUT_DIR/storage_objects_policies.err" || true

AUTH_REPORT_PATH="-"
if [ "$RUN_AUTH_BASELINE" = "1" ]; then
  if [ -z "$AUTH_SESSION_JSON" ] || [ ! -f "$AUTH_SESSION_JSON" ]; then
    echo "[warn] RUN_AUTH_BASELINE=1 but AUTH_SESSION_JSON is missing. Skip authenticated route baseline." | tee "$OUT_DIR/authenticated_baseline.warn"
  elif [ ! -f "$ROOT_DIR/Frontend/node_modules/playwright/index.mjs" ]; then
    echo "[warn] Missing Frontend/node_modules/playwright/index.mjs. Skip authenticated route baseline." | tee "$OUT_DIR/authenticated_baseline.warn"
  else
    node "$ROOT_DIR/scripts/qa/measure_authenticated_route_baseline.mjs" \
      --frontend-url "$FRONTEND_URL" \
      --session-json "$AUTH_SESSION_JSON" \
      --out-dir "$OUT_DIR" \
      --runs "$RUNS" \
      > "$OUT_DIR/authenticated_baseline.out" \
      2> "$OUT_DIR/authenticated_baseline.err" || true
    AUTH_REPORT_PATH="$OUT_DIR/app_route_baseline_authenticated_report.md"
  fi
fi

PERF_WARN_COUNT="$(jq 'length' "$OUT_DIR/performance_advisors_warn.normalized.json" 2>/dev/null || echo "unknown")"
SEC_WARN_COUNT="$(jq 'length' "$OUT_DIR/security_advisors_warn.json" 2>/dev/null || echo "unknown")"
DOG_BUCKET_COUNT="$(jq '.rows | length' "$OUT_DIR/storage_bucket_dog_profiles.json" 2>/dev/null || echo "unknown")"

cat > "$OUT_DIR/phase5_snapshot_summary.md" <<EOF
# Phase5 Monitoring Snapshot

- captured_at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
- frontend_url: $FRONTEND_URL
- performance_warn_count: $PERF_WARN_COUNT
- security_warn_count: $SEC_WARN_COUNT
- dog_profiles_bucket_rows: $DOG_BUCKET_COUNT
- authenticated_baseline_report: $AUTH_REPORT_PATH

## Files
- performance_advisors_warn.normalized.json
- security_advisors_warn.json
- index_stats.txt
- table_stats.txt
- long_running_queries.txt
- storage_buckets.txt
- storage_bucket_dog_profiles.json
- storage_objects_policies.json
EOF

echo "[done] Phase5 snapshot: $OUT_DIR/phase5_snapshot_summary.md"
