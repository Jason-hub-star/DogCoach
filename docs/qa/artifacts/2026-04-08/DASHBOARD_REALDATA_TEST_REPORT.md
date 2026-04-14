# Dashboard Real Data Timing Test Report (2026-04-08)

## Goal
- 랜딩 페이지 이후 대시보드 진입 시, 스켈레톤에서 실 DB 데이터가 보일 때까지 시간을 측정.
- 이전에 안 돌린 항목(모바일 에뮬레이션, API 지연 분포, 동시성 안정성, 가드 케이스)까지 포함.

## Environment
- Date: 2026-04-08 (KST)
- Production Frontend: `https://www.mungai.co.kr`
- Production Backend: `https://backend-production-61c6.up.railway.app`
- Local Frontend (guest-fetch fix 검증): `http://localhost:3100`

## 1) Production Baseline UI Timing
Source:
- `dashboard_render_perf_report_prod_baseline.md`
- `dashboard_render_perf_raw_prod_baseline.json`
- `dashboard_render_perf_prod_baseline_run.log`

Result:
- Desktop (3회): data-ready p50 `178ms`, p90 `315ms`
- Mobile (2회): data-ready p50 `163ms`, p90 `223ms`
- Render end state: Desktop/Mobile 모두 `no_dog`
- Browser-captured dashboard API: 기록 없음(`-`)

Interpretation:
- 운영 프론트에서는 게스트 쿠키가 있어도 대시보드 데이터 fetch가 시작되지 않아, "실 DB 데이터 표시"가 아니라 "데이터 없음 UI(no_dog)"로 매우 빠르게 종결됨.

## 2) Local After Guest-Fetch Fix UI Timing
Code change:
- `Frontend/src/app/(app)/dashboard/page.tsx`
  - `useDashboardData(!!token, token)` -> `useDashboardData(true, token)`

Source:
- `dashboard_render_perf_report_local_after_guest_fix.md`
- `dashboard_render_perf_raw_local_after_guest_fix.json`
- `dashboard_render_perf_localhost_run.log`

Result:
- Desktop (4회): data-ready p50 `2608ms`, p90 `3240ms`
- Mobile (2회): data-ready p50 `2266ms`, p90 `2832ms`
- Render end state: Desktop/Mobile 모두 `error`

Interpretation:
- guest-fetch는 시작되지만, `localhost -> production backend` 브라우저 요청에서 CORS 제약으로 에러 UI로 종결됨.

## 3) API Real Data Latency Distribution
Source:
- `dashboard_api_stability_seq.log`
- `dashboard_api_stability_concurrent.log`
- `dashboard_api_stability_summary.txt`

Result:
- Sequential 30회: all `200`
  - min `4818ms`, p50 `5081ms`, p90 `5236ms`, max `5317ms`, avg `5095ms`
- Concurrent 50회 (10 workers): all `200`
  - min `4750ms`, p50 `5057ms`, p90 `5175ms`, max `5336ms`, avg `5019ms`

Interpretation:
- DB 조회 자체는 안정적(성공률 100%)이나 지연은 약 `~5.0s` 대.

## 4) Guard/Invalid Session Cases
Source:
- `dashboard_api_guard_perf.txt`

Result:
- No cookie (10회): all `401`, avg `537ms`
- Invalid cookie (10회): all `404`, avg `2654ms`

## Conclusion
- 현재 운영 프론트 기준으로는 "대시보드에서 실 DB 데이터가 보일 때까지"를 정상 경로로 측정할 수 없음.
  - 이유 1: guest 쿠키 상태에서 대시보드 fetch가 토큰 조건에 막혀 `no_dog` UI로 종료.
  - 이유 2: 로컬에서 fetch 조건을 풀면 CORS 에러로 `error` UI로 종료.
- 다만 백엔드 API 자체는 실데이터 반환/안정성 100% 확인 완료(지연 p50 약 5.0초).

## Re-run Command
```bash
# Production baseline
node scripts/qa/measure_dashboard_render_perf.mjs \
  --frontend-url https://www.mungai.co.kr \
  --backend-url https://backend-production-61c6.up.railway.app \
  --desktop-runs 3 --mobile-runs 2 --api-runs 10 \
  --out-dir docs/qa/artifacts/2026-04-08

# Local verification (requires dev server)
node scripts/qa/measure_dashboard_render_perf.mjs \
  --frontend-url http://localhost:3100 \
  --backend-url https://backend-production-61c6.up.railway.app \
  --desktop-runs 4 --mobile-runs 2 --api-runs 12 \
  --out-dir docs/qa/artifacts/2026-04-08
```
