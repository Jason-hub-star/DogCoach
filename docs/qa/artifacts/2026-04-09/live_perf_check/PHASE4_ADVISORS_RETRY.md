# Phase4 Advisors/Inspect Retry (2026-04-09)

## Commands
- `supabase db advisors --linked --type performance --level warn --output json`
- `supabase db advisors --linked --type security --level warn --output json`
- `supabase inspect db index-stats --linked --output json`
- `supabase inspect db table-stats --linked --output json`
- `supabase inspect db role-stats --linked --output json`
- `supabase inspect db long-running-queries --linked --output json`

## Artifacts
- Directory: `docs/qa/artifacts/2026-04-09/live_perf_check/phase4_advisors_retry`
- Performance advisors: `performance_advisors_warn.json` / `.err`
- Security advisors: `security_advisors_warn.json` / `.err`
- Inspect:
  - `index_stats.json` / `.err`
  - `table_stats.json` / `.err`
  - `role_stats.json` / `.err`
  - `long_running_queries.json` / `.err`

## Result Summary
- Performance advisors: **success**
  - total warn: `167`
  - name breakdown:
    - `auth_rls_initplan`: `55`
    - `multiple_permissive_policies`: `111`
    - `duplicate_index`: `1`
  - target table(로딩 핫패스 관련)에서 공통적으로 확인:
    - `dogs`, `dog_env`, `behavior_logs`, `subscriptions`, `user_settings`에 `auth_rls_initplan`/`multiple_permissive_policies` 경고 반복
- Security advisors: **success**
  - total warn: `2`
  - `function_search_path_mutable` (`public.update_updated_at_column`)
  - `auth_leaked_password_protection` (Auth setting)
- Inspect:
  - 기본 실행(패스워드 미지정)에서는 circuit breaker로 실패
  - `SUPABASE_DB_PASSWORD` 지정 후 재시도:
    - `index-stats`: **success** (`index_stats_pw.json`)
    - `table-stats`: **success** (`table_stats_pw.json`)
    - `long-running-queries`: **success** (장기 실행 쿼리 없음)
    - `role-stats`: **command failed** (`can't scan null into *string`)
  - `role-stats` 대체 증적:
    - `pg_roles` 조회로 `rolbypassrls` 확인 (`role_bypassrls_query.json`)
    - `postgres`, `service_role`, `supabase_admin`가 `rolbypassrls=true`

## Gate
- A(Self) Review: PASS
- B(Cross) Review: PASS
- Doc Sync: PASS
- Phase4 Gate: `NO-GO` (실측 수집은 상당 부분 완료했지만, RLS 정책 개선/EXPLAIN/후속 검증 미완료)

## Next
1. `index-stats/table-stats/role-stats` 재수집 성공 시까지 재시도
2. `auth_rls_initplan` 경고 대상으로 RLS policy SQL 정리안 작성
3. `multiple_permissive_policies` 정리 시 role/action별 정책 병합 가능성 점검
4. `/dashboard` hot query `EXPLAIN (ANALYZE, BUFFERS)` 증적 추가

## Follow-up
- 후속 패치/재측정 결과:
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_RLS_PATCH_APPLY.md`
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_INITPLAN_CLEANUP_RETRY.md`
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_FINAL_GO_CHECK.md`
