# Phase2 Post-Deploy OAuth Recheck (2026-04-09)

## Scope
- Frontend: `https://www.mungai.co.kr`
- Auth: Real OAuth session via CDP-attached Chrome (`gmdqn2tp@gmail.com`)
- Script: `scripts/qa/measure_authenticated_route_baseline.mjs`
- Output:
  - `docs/qa/artifacts/2026-04-09/live_perf_check/phase2_postcheck_oauth/app_route_baseline_authenticated_raw.json`
  - `docs/qa/artifacts/2026-04-09/live_perf_check/phase2_postcheck_oauth/app_route_baseline_authenticated_report.md`

## Result Summary
- `/dashboard`
  - `api_count_5s = 2`
  - API status sequence: `401 -> 200`
  - `data_ready_ms = 10202`
- Interpretation:
  - 초기 인증 부트스트랩 구간에서 `/dashboard` 중복 호출 패턴이 아직 남아 있음
  - 기존 Phase2 목표(초기 `401 -> 200` 중복 제거)는 **미달성**

## Gate
- A(Self) Review: PASS (재측정 실행 및 증적 확보)
- B(Cross) Review: PASS (raw/status 확인 완료)
- Doc Sync: PASS
- Phase2 Gate: `NO-GO` (중복 호출 제거 미달성)

## Follow-up
- 이후 auth-race guard 패치 배포 후 재측정에서 목표 달성:
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE2_POSTDEPLOY_GO_CHECK.md`

## Next
1. `/dashboard` 첫 호출이 인증 완료 이전에 트리거되는 경로 재추적
2. 헤더/사이드바/페이지별 auth 상태 동기화 타이밍 재검토
3. 수정 후 동일 OAuth 실측으로 `api_count_5s=1` 확인
