# Phase2 Auth-Race Guard Patch Check (2026-04-09)

## Code Patch
- `useAuth`에 `hasStoredSessionHint` 추가:
  - 로컬스토리지 Supabase auth 토큰 흔적을 읽어 인증 복원 중 힌트 제공
- 라우트별 대시보드 쿼리 enable 조건 보강:
  - `Frontend/src/app/(app)/dashboard/page.tsx`
  - `Frontend/src/app/(app)/log/page.tsx`
  - `Frontend/src/app/(app)/coach/page.tsx`
  - `Frontend/src/app/(public)/result/page.tsx`
  - 인증 복원 레이스(`!token && !user && hasStoredSessionHint`) 구간에서 guest fetch 임시 차단

## Validation
- `cd Frontend && npm run build`: pass
- OAuth 재측정(프로덕션 FE 기준):
  - before: `phase2_postcheck_oauth`
  - after(local patch, prod FE 측정): `phase2_postcheck_oauth_after_auth_race_guard`
- 비교 결과(`/dashboard`):
  - before: `api_count_5s=2`, `401->200`
  - after: `api_count_5s=2`, `401->200`

## Interpretation
- 측정 대상이 여전히 프로덕션 FE(`https://www.mungai.co.kr`)이므로,
  로컬 패치 효과는 배포 전까지 반영되지 않음.
- 이후 배포/재측정에서 효과 확인:
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE2_POSTDEPLOY_GO_CHECK.md`
  - `/dashboard` `api_count_5s=1`, status `[200]`로 Gate `GO`

## Next
1. done: 프론트 패치 배포
2. done: OAuth 실측 재실행
3. done: `/dashboard` `api_count_5s=1` 및 `401` 제거 확인
