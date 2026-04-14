# Phase2 Dedupe Check

Date: 2026-04-09
Phase: P2 Frontend duplicate request reduction

## Goal
- 인증 세션 초기화 이전에 `/dashboard`가 먼저 호출되어 `401 -> 200`으로 이어지는 중복 패턴을 줄인다.

## Changes
- `useDashboardData`에 `authResolved` 조건 추가:
  - file: `Frontend/src/hooks/useQueries.ts`
  - `enabled: enabled && authResolved`
- app/public 주요 진입 페이지에서 query enable 조건 강화:
  - `Frontend/src/app/(app)/dashboard/page.tsx`
  - `Frontend/src/app/(app)/log/page.tsx`
  - `Frontend/src/app/(app)/coach/page.tsx`
  - `Frontend/src/app/(public)/result/page.tsx`
  - 조건: `!isAuthLoading && (!!token || !user || user.is_anonymous)`

## Validation
- Frontend build: pass (`npm run build`)
- Existing OAuth production check (before deploy) still observed `/dashboard` 2 calls with `401 -> 200`.
  - This was measured on deployed production frontend code, not local patched code.
- OAuth postcheck rerun (2026-04-09, CDP real-login) also observed `/dashboard` 2 calls with `401 -> 200`.
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE2_POSTCHECK_OAUTH.md`
- auth-restore race guard 패치 반영 후 로컬 build 검증 완료(배포 전이라 프로덕션 측정값 변화 없음).
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE2_AUTH_RACE_GUARD_PATCH.md`
- 패치 배포 후 OAuth 재측정에서 `/dashboard` `api_count_5s=1`, status `[200]` 확인.
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE2_POSTDEPLOY_GO_CHECK.md`
- Local patched code run exists:
  - `docs/qa/artifacts/2026-04-09/live_perf_check/phase2_local_patch_check/app_route_baseline_authenticated_report.md`
  - local CORS mismatch(3002 -> 8000 fallback 3000 only) causes network-error retries, so production-level dedupe 결론에는 사용하지 않음.

## Self Review
- A Self Review: PASS (코드 레벨 중복 호출 방지 가드 적용 완료)
- B Cross Review: PASS (호출부 누락 없음, build 통과)
- Doc Sync: PASS

## Gate Note
- 배포 후 OAuth 재측정에서 `/dashboard` 초기 `401 -> 200` 중복 제거가 확인되어 Phase2 목표 달성.
- Phase2 Gate: `GO`
