# Phase4 RLS Patch Apply + Re-Measure (2026-04-09)

## Applied Patch
- Schema update:
  - `Backend/supabase_schema.sql`
    - `Service role full access` 정책을 `TO service_role USING (true) WITH CHECK (true)`로 스코프 축소
    - `Users read own ...` 정책의 `auth.uid()`를 `(select auth.uid())` 형태로 변경
    - `update_updated_at_column()`에 `SET search_path = public` 적용
- Runtime SQL patch:
  - `Backend/scripts/patch_2026_04_09_phase4_rls_perf.sql`
- Production apply:
  - `supabase db query --linked -f Backend/scripts/patch_2026_04_09_phase4_rls_perf.sql`
- Hot-path index apply:
  - `Backend/scripts/patch_2026_04_09_phase3_hotpath_indexes.sql`
  - production apply 완료

## Advisors Delta
- Performance WARN count:
  - before: `167`
    - `auth_rls_initplan: 55`
    - `multiple_permissive_policies: 111`
    - `duplicate_index: 1`
  - after RLS patch: `34`
    - `auth_rls_initplan: 33`
    - `duplicate_index: 1`
  - after full patch(index 포함): `34` (동일)
- Security WARN:
  - before: `2` (`function_search_path_mutable`, `auth_leaked_password_protection`)
  - after: `1` (`auth_leaked_password_protection`)

## Inspect / Explain Evidence
- inspect (`SUPABASE_DB_PASSWORD` 지정 후):
  - `index_stats_pw.json` / `table_stats_pw.json` / `long_running_queries.json` 수집 완료
  - `role-stats`는 CLI 스캔 오류(`can't scan null into *string`)로 실패, `pg_roles` 대체 조회 수행
- EXPLAIN (`docs/qa/artifacts/2026-04-09/live_perf_check/phase4_explain`)
  - `explain_dogs_by_user_after_index_patch.json`
    - `Index Scan using idx_dogs_user_created_desc`
  - `explain_dogs_by_anonymous_sid.json`
    - `Index Scan using idx_dogs_anonymous_sid`
  - `explain_behavior_logs_by_dog.json`
    - `Index Scan using idx_behavior_logs_dog_id`

## Interpretation
- RLS 정책 병합/스코프 조정으로 대량 `multiple_permissive_policies` 경고는 제거됨.
- 핵심 hot-path 인덱스는 production에 반영되었고, EXPLAIN에서 실제 index scan이 확인됨.
- 남은 성능 WARN(34)은 주로 확장된 운영 정책에서 발생하는 `auth_rls_initplan` 잔여 항목.

## Gate
- A(Self) Review: PASS
- B(Cross) Review: PASS
- Doc Sync: PASS
- Phase4 Gate: `NO-GO` (잔여 `auth_rls_initplan` 정리 및 최종 후속 검증 필요)

## Follow-up
- 후속 2차 정리/교차리뷰/재실측 시도:
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_INITPLAN_CLEANUP_RETRY.md`
- 최종 Gate 재판정(GO):
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_FINAL_GO_CHECK.md`
