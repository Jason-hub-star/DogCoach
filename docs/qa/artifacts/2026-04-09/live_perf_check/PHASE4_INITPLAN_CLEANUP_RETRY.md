# Phase4 Initplan Cleanup Retry + Cross Review (2026-04-09)

## Scope
- Runtime SQL patch hardening:
  - `Backend/scripts/patch_2026_04_09_phase4_rls_initplan_cleanup.sql`
- Schema sync:
  - `Backend/supabase_schema.sql`에서 중복 인덱스 `idx_rec_dedupe_key` 정의 제거

## Why
- 잔여 `auth_rls_initplan` 경고를 줄이기 위해 direct `auth.uid()/auth.role()` 정책식을 추가 정리.
- 서브에이전트 교차리뷰에서 지적된 리스크 반영:
  - mixed policy 누락 가능성(`... OR auth.uid()` 패턴)
  - 재실행 시 이중 래핑 가능성

## Patch Hardening Summary
- policy 대상 필터를 `auth.uid()/auth.role()` 포함 여부 기준으로 확장
- 기존 `(select auth.uid())`/`(select auth.role())` 토큰은 placeholder로 보호 후 치환
- `IS DISTINCT FROM` 가드로 실제 변경이 있을 때만 `ALTER POLICY` 실행
- 스크립트 상단에 preflight backup query 안내 추가

## Cross Review (Sub-Agent B)
- Result: `PASS with fixes applied`
- Key findings:
  - P1: 혼합식 정책 누락 가능성 -> 필터/치환 로직 보강으로 반영
  - P2: duplicate index 제거 자체는 타당, 다만 운영 시간대 락 리스크 주의

## Commands
- apply retry:
  - `supabase db query --linked -f Backend/scripts/patch_2026_04_09_phase4_rls_initplan_cleanup.sql`
- advisors retry:
  - `supabase db advisors --linked --type performance --level warn --output json`
  - `supabase db advisors --linked --type security --level warn --output json`
- doc update routine:
  - `git diff --name-only HEAD`
  - `git diff --name-only --cached`
  - `git status --porcelain`
  - `bash scripts/docs/prune-project-status.sh --dry-run`

## Evidence
- `phase4_advisors_retry/phase4_initplan_cleanup_apply_retry.err`
- `phase4_advisors_retry/performance_advisors_warn_after_initplan_cleanup.err`
- `phase4_advisors_retry/performance_advisors_warn_after_initplan_cleanup_retry2.err`
- `phase4_advisors_retry/security_advisors_warn_after_initplan_cleanup.json`
- `phase4_advisors_retry/doc_update_git_diff_name_only.txt`
- `phase4_advisors_retry/doc_update_git_diff_name_only_cached.txt`
- `phase4_advisors_retry/doc_update_git_status_porcelain.txt`
- `phase4_advisors_retry/prune_project_status_dry_run.txt`

## Result
- Security advisors: 수집 성공, WARN `1` (`auth_leaked_password_protection`) 유지.
- Performance advisors/apply/query 재실측: Supabase connection `circuit breaker open`으로 차단.
- 따라서 잔여 `auth_rls_initplan`의 최종 감소 수치는 현재 턴에서 확정 불가.

## Gate
- A(Self) Review: PASS(부분)
- B(Cross) Review: PASS(서브에이전트 피드백 반영 완료)
- Doc Sync: PASS
- Phase4 Gate: `NO-GO` (circuit breaker 해소 후 재실측 수치 확정 필요)

## Next
1. circuit breaker 해소 후 `phase4_rls_initplan_cleanup.sql` apply 재시도
2. performance advisors 재수집 및 WARN delta 확정
3. `dog-profiles` storage bucket/RLS live 증적 조회 마무리

## Follow-up
- 후속 최종 재실측/게이트 결과:
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_FINAL_GO_CHECK.md`
