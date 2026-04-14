# Phase5 Monitoring Kickoff (2026-04-09)

## Goal
- Phase4 GO 이후 24~48시간 회귀 감시를 반복 실행 가능한 형태로 시작한다.

## Added Runner
- Script: `scripts/qa/run_phase5_monitoring_snapshot.sh`
- Purpose:
  - Supabase performance/security advisors 스냅샷
  - inspect(index/table/long-running) 스냅샷
  - storage(`dog-profiles`) bucket/policy 상태 스냅샷
  - (옵션) authenticated route baseline 재측정

## First Snapshot
- Run time: `2026-04-09T12:01:11Z`
- Output dir:
  - `docs/qa/artifacts/2026-04-09/live_perf_check/phase5_monitoring/210104`
- Key result:
  - performance_warn_count: `0`
  - security_warn_count: `1` (`auth_leaked_password_protection`)
  - dog_profiles_bucket_rows: `1`
  - storage.objects policies: `3`

## Commands
```bash
cd /Users/family/jason/TailLogweb
scripts/qa/run_phase5_monitoring_snapshot.sh
```

Authenticated baseline 포함 실행 예시:
```bash
cd /Users/family/jason/TailLogweb
RUN_AUTH_BASELINE=1 AUTH_SESSION_JSON=/abs/path/session.json RUNS=1 scripts/qa/run_phase5_monitoring_snapshot.sh
```

## Evidence
- `phase5_monitoring/210104/phase5_snapshot_summary.md`
- `phase5_monitoring/210104/performance_advisors_warn.normalized.json`
- `phase5_monitoring/210104/security_advisors_warn.json`
- `phase5_monitoring/210104/index_stats.txt`
- `phase5_monitoring/210104/table_stats.txt`
- `phase5_monitoring/210104/long_running_queries.txt`
- `phase5_monitoring/210104/storage_buckets.txt`
- `phase5_monitoring/210104/storage_bucket_dog_profiles.json`
- `phase5_monitoring/210104/storage_objects_policies.json`

## Gate
- A(Self) Review: PASS
- B(Cross) Review: PASS(기존 Phase4 교차리뷰 기준 유지)
- Doc Sync: PASS
- Phase5 Gate: `IN PROGRESS` (24~48시간 반복 스냅샷 누적 필요)

## Follow-up
- `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE5_MONITORING_PROGRESS_3X.md`
- `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE5_MONITORING_SCHEDULE.md`
