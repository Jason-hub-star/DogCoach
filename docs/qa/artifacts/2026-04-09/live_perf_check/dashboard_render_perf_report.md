# Dashboard Render Performance Report

## Scope
- Frontend: https://www.mungai.co.kr
- Backend: https://backend-production-61c6.up.railway.app
- Seeded dog id: 213aa12a-caca-4f59-a2e8-29454d12b8d9

## Test Matrix
- Desktop (Chrome headless): 1 runs
- Mobile (iPhone 13 emulation): 1 runs
- API only (/api/v1/dashboard/ with cookie): 2 runs

## Key Result (Landing -> Dashboard -> Real Data)
- Desktop data-ready: min 6591ms, p50 6591ms, p90 6591ms, max 6591ms, avg 6591ms
- Mobile data-ready: min 6561ms, p50 6561ms, p90 6561ms, max 6561ms, avg 6561ms

## Skeleton -> Data Duration
- Desktop: detected 1/1 runs, min 5743ms, p50 5743ms, p90 5743ms, max 5743ms, avg 5743ms
- Mobile: detected 1/1 runs, min 6002ms, p50 6002ms, p90 6002ms, max 6002ms, avg 6002ms

## Render End State
- Desktop: {"dashboard_loaded":1}
- Mobile: {"dashboard_loaded":1}

## Dashboard API (Browser-captured)
- Desktop: min 5776ms, p50 5776ms, p90 5776ms, max 5776ms, avg 5776ms
- Mobile: min 5979ms, p50 5979ms, p90 5979ms, max 5979ms, avg 5979ms

## Dashboard API (Direct request)
- API only: min 5130ms, p50 5130ms, p90 5331ms, max 5331ms, avg 5231ms

## Notes
- This suite uses real backend data by creating a guest survey record first.
- Dashboard render completion is detected with case-insensitive header/stat + dog profile link (INSIGHT DASHBOARD, TOTAL, or 누적 기록).
- Skeleton duration is measured only when skeleton text is observed during run.
