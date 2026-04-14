# Engineering Rules

Last Updated: 2026-04-08

## Runtime Facts
- Frontend: Next.js App Router (`Frontend/src/app`)
- Backend: FastAPI feature routers (`Backend/app/features/*`)
- API Prefix: `/api/v1` (`Frontend/src/lib/api.ts`, `Backend/app/core/config.py`)

## Canonical Route Set
- Public: `/`, `/login`, `/survey`, `/result`, `/privacy`, `/terms`, `/auth/callback`
- App: `/dashboard`, `/log`, `/coach`, `/settings`, `/dog/profile`

## Core Coding Rules
- Frontend 쿼리 키는 `QUERY_KEYS`만 사용 (`Frontend/src/lib/query-keys.ts`).
- API 호출은 `apiClient`를 사용하고, 직접 `fetch` 분산 사용을 피한다.
- Backend는 `Router -> Service -> Repository` 경계를 유지한다.
- `migrate-guest`는 best-effort이되 콜백 흐름을 막지 않는다.
- 204 응답은 클라이언트에서 빈 바디로 안전 처리한다.

## Security & Data Rules
- `.env*` 파일은 커밋 금지.
- OAuth callback 허용 경로는 화이트리스트로 유지한다.
- 프로필 이미지 업로드/조회 변경 시 Storage 정책 영향 범위를 문서에 남긴다.

## Verification Ladder
1. `cd Frontend && npm run check:utf8`
2. `cd Frontend && npm run build`
3. `cd Backend && python -m compileall app`
4. `cd Backend && python -m pytest tests`

## Quick Checks
- `rg -n "QUERY_KEYS|invalidateQueries" Frontend/src -S`
- `rg -n "returnTo|migrate-guest|auth/callback" Frontend/src Backend/app -S`
- `rg -n "@router\.(get|post|patch|put|delete)" Backend/app/features -S`
