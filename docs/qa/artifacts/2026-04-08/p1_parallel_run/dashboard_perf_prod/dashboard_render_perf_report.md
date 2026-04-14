# Dashboard Render Performance Report

## Scope
- Frontend: https://www.mungai.co.kr
- Backend: https://backend-production-61c6.up.railway.app
- Seeded dog id: 95d5fc9a-8d61-4f99-90d6-9b01bae32814

## Test Matrix
- Desktop (Chrome headless): 2 runs
- Mobile (iPhone 13 emulation): 1 runs
- API only (/api/v1/dashboard/ with cookie): 5 runs

## Key Result (Landing -> Dashboard -> Real Data)
- Desktop data-ready: min 6583ms, p50 6583ms, p90 6867ms, max 6867ms, avg 6725ms
- Mobile data-ready: min 7531ms, p50 7531ms, p90 7531ms, max 7531ms, avg 7531ms

## Skeleton -> Data Duration
- Desktop: detected 2/2 runs, min 6152ms, p50 6152ms, p90 6313ms, max 6313ms, avg 6233ms
- Mobile: detected 1/1 runs, min 6415ms, p50 6415ms, p90 6415ms, max 6415ms, avg 6415ms

## Render End State
- Desktop: {"dashboard_loaded":2}
- Mobile: {"dashboard_loaded":1}

## Dashboard API (Browser-captured)
- Desktop: min 6102ms, p50 6102ms, p90 6130ms, max 6130ms, avg 6116ms
- Mobile: min 6473ms, p50 6473ms, p90 6473ms, max 6473ms, avg 6473ms

## Dashboard API (Direct request)
- API only: min 5117ms, p50 5254ms, p90 5292ms, max 5292ms, avg 5233ms

## Notes
- This suite uses real backend data by creating a guest survey record first.
- Dashboard render completion is detected with case-insensitive header/stat + dog profile link (INSIGHT DASHBOARD, TOTAL, or 누적 기록).
- Skeleton duration is measured only when skeleton text is observed during run.
