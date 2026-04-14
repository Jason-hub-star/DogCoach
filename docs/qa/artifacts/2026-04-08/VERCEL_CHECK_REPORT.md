# Vercel Check Report (2026-04-08)

## Current Status (Latest Snapshot)
- As of 2026-04-08 (KST), production blocker status: **RESOLVED**.
- Current effective frontend API base: `https://backend-production-61c6.up.railway.app`
- CORS preflight from `https://www.mungai.co.kr`: **PASS** (`OPTIONS /api/v1/dashboard/ -> 200`)
- Guest context mapping real-flow (`survey -> dashboard`): **PASS**
- Latest production deployment: `dpl_HSsGyFRWYA5WEDeXz2Tv354UsKSL`

> Note: Sections 2-6 are initial failure snapshots captured **before** remediation.

## Scope
- Project: `kimjuyoung1127s-projects/taillog`
- Deployment checked: `dpl_Rd7Fu3xq4cG3DzWR8ziNGh31h2Yx`
- Domain: `https://www.mungai.co.kr`

## 1) CLI / Link Status
- `vercel whoami`: `kimjuyoung1127`
- `vercel link`: linked to `kimjuyoung1127s-projects/taillog`
- Result: PASS

## 2) Vercel Environment Variables
Checked files:
- `vercel_env_value_check_prod.txt`
- `vercel_env_value_check_preview.txt`

Observed:
- Production `NEXT_PUBLIC_API_URL`: `"https://api.mungai.co.kr"`
- Production `NEXT_PUBLIC_SITE_URL`: `"https://www.mungai.co.kr"`
- Preview has same values.

Result:
- Variable presence: PASS
- Runtime validity: FAIL (see API domain reachability below)

## 3) Deployment / Domain Routing
Checked files:
- `vercel_domain_routing_check.log`
- `vercel logs ... dpl_Rd7Fu3xq4cG3DzWR8ziNGh31h2Yx`

Observed:
- `www.mungai.co.kr` returns `200`
- `mungai.co.kr` returns `307 -> https://www.mungai.co.kr/`
- Latest production deployment is `Ready` and aliases include `www.mungai.co.kr`, `mungai.co.kr`

Result: PASS

## 4) Backend CORS Test (Railway direct domain)
Checked file:
- `vercel_backend_cors_check.log`

Observed (`Origin: https://www.mungai.co.kr`):
- `OPTIONS /api/v1/dashboard/` -> `400 Disallowed CORS origin`
- `GET /api/v1/dashboard/` with cookie -> `200` (body includes dashboard data)
- `GET /api/v1/dashboard/` without cookie -> `401`

Interpretation:
- 브라우저 credentialed fetch에서는 preflight 실패로 인해 JS 접근이 차단될 수 있음.

Result: FAIL (CORS allowlist mismatch)

## 5) API Domain Reachability (as configured in Vercel)
Checked file:
- `vercel_api_domain_reachability.log`

Observed:
- `https://api.mungai.co.kr` 3회 연속 timeout (`curl --max-time 12`)

Result: FAIL (configured API domain unreachable)

## 6) 5x5 User Journey Timing (Production URL)
Checked files:
- `vercel_journey_5runs.log`
- `dashboard_render_perf_report_vercel_5x5.md`
- `dashboard_render_perf_raw_vercel_5x5.json`

Observed:
- Desktop(5): data-ready p50 `318ms`, p90 `707ms`
- Mobile(5): data-ready p50 `387ms`, p90 `649ms`
- Render end state: all `no_dog` (Desktop/Mobile 100%)
- Browser-captured dashboard API: none (`-`)
- Direct API-only baseline: p50 `5029ms`, p90 `5159ms`

Interpretation:
- 프론트 대시보드가 실데이터 렌더로 가지 않고 `no_dog` 상태로 종료.

## Final Assessment
- Vercel/도메인/배포 자체는 정상.
- 현재 사용자 여정의 핵심 장애는 API 연결 계층:
  - Vercel 설정 API 도메인(`api.mungai.co.kr`) 타임아웃
  - Railway 직접 도메인 경로도 CORS preflight에서 `Disallowed CORS origin`

## Recommended Immediate Fix Order
1. `api.mungai.co.kr` DNS/TLS/라우팅 복구 (우선순위 P0)
2. 백엔드 CORS allowlist에 `https://www.mungai.co.kr` 명시 허용
3. 복구 후 동일 5x5 측정 재실행

## 7) Remediation Applied (2026-04-08 14:06~14:20 KST)

### 7.1 Railway production env fix
Applied via Railway CLI (service: `Backend`, env: `production`):
- `ENVIRONMENT=production`
- `BACKEND_CORS_ORIGINS=https://www.mungai.co.kr,https://mungai.co.kr,https://taillog-kimjuyoung1127s-projects.vercel.app,http://localhost:3000,http://127.0.0.1:3000`
- `ANONYMOUS_COOKIE_SECURE=true`
- `ANONYMOUS_COOKIE_SAMESITE=none`

Notes:
- 초기 `railway redeploy`는 root directory mismatch(`Root Directory Backend does not exist`)로 실패.
- 저장소 루트에서 `railway up ... -s Backend`로 재배포(`e0feff65-22c7-45e6-a4c4-a2526116892b`) 성공.

### 7.2 CORS re-test after deploy
Observed (`Origin: https://www.mungai.co.kr`):
- `OPTIONS /api/v1/dashboard/` -> `200` + `access-control-allow-origin: https://www.mungai.co.kr`
- `GET /api/v1/dashboard/` -> CORS 헤더 정상 포함

Result: PASS (previous FAIL resolved)

### 7.3 Vercel env + production redeploy
Applied via Vercel CLI:
- `NEXT_PUBLIC_API_URL` (production/preview) updated to `https://backend-production-61c6.up.railway.app`
- Production redeploy executed from deployment `dpl_Rd7Fu3xq4cG3DzWR8ziNGh31h2Yx`
- New production deployment: `taillog-hznc6vs7f-kimjuyoung1127s-projects.vercel.app` aliased to `https://www.mungai.co.kr`

Result: PASS

## 8) Post-fix Validation Summary

### 8.1 API/Web smoke
- `scripts/qa/run_parallel_api_qa.sh`: PASS (guest journey/auth guard/validation all pass)
- `scripts/qa/run_parallel_web_smoke.sh`: PASS

### 8.2 Dashboard perf rerun (3x3)
- Artifacts: `dashboard_render_perf_report.md`, `dashboard_render_perf_raw.json`
- Current end-state remains `no_dog` for all browser runs.
- Direct API baseline still ~4.7~5.7s.

Interpretation:
- Infra-level blockers(API domain dead + CORS preflight fail)는 해소됨.
- `no_dog` 100% 현상은 별도 앱 레벨 진단 대상(현재 스크립트/게스트 컨텍스트 경로 포함).

## 9) Root Cause (Dashboard no_dog loop)

### What was actually wrong
- DB empty issue가 아니었음.
- Production frontend bundle had guest dashboard query disabled:
  - bundled code path: `useDashboardData(!!token, token)`
  - guest(`token=null`)에서는 `/api/v1/dashboard/` 호출 자체가 발생하지 않아 `!data` 분기로 `반려견 정보가 없습니다.` 표시.

### Evidence
- Backend/API lane guest flow returned real dashboard data (`dog_profile`, `recent_logs`) with cookie.
- Browser runtime before fix: dashboard route had no `/api/v1/dashboard/` request from guest session.
- Bundle inspection (`/_next/static/chunks/...`) confirmed `useDashboardData(!!token, token)` in deployed code.

## 10) Real Flow Re-test After Deploying Current Workspace

Deployment:
- Production deployment id: `dpl_HSsGyFRWYA5WEDeXz2Tv354UsKSL`
- URL: `https://taillog-iwinaf4ky-kimjuyoung1127s-projects.vercel.app`
- Alias: `https://www.mungai.co.kr`

Result (Guest context mapping fill -> Dashboard):
- Survey POST from frontend origin: `201`
- Dashboard GET from same browser session: `200`
- UI: `no_dog=false`, `INSIGHT DASHBOARD=true`, dog profile link present
- Artifact: `context_mapping_real_flow_after_fix.json`
