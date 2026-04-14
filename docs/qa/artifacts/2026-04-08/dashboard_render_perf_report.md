# Dashboard Render Performance Report

## Scope
- Frontend: https://www.mungai.co.kr
- Backend: https://backend-production-61c6.up.railway.app
- Seeded dog id: 971222f1-a126-405d-b406-3175af425422

## Test Matrix
- Desktop (Chrome headless): 1 runs
- Mobile (iPhone 13 emulation): 1 runs
- API only (/api/v1/dashboard/ with cookie): 2 runs

## Key Result (Landing -> Dashboard -> Real Data)
- Desktop data-ready: min 6067ms, p50 6067ms, p90 6067ms, max 6067ms, avg 6067ms
- Mobile data-ready: min 5662ms, p50 5662ms, p90 5662ms, max 5662ms, avg 5662ms

## Skeleton -> Data Duration
- Desktop: detected 1/1 runs, min 5894ms, p50 5894ms, p90 5894ms, max 5894ms, avg 5894ms
- Mobile: detected 1/1 runs, min 5486ms, p50 5486ms, p90 5486ms, max 5486ms, avg 5486ms

## Render End State
- Desktop: {"dashboard_loaded":1}
- Mobile: {"dashboard_loaded":1}

## Dashboard API (Browser-captured)
- Desktop: min 5745ms, p50 5745ms, p90 5745ms, max 5745ms, avg 5745ms
- Mobile: min 5348ms, p50 5348ms, p90 5348ms, max 5348ms, avg 5348ms

## Dashboard API (Direct request)
- API only: min 5104ms, p50 5104ms, p90 5224ms, max 5224ms, avg 5164ms

## Notes
- This suite uses real backend data by creating a guest survey record first.
- Dashboard render completion is detected with case-insensitive header/stat + dog profile link (INSIGHT DASHBOARD, TOTAL, or 누적 기록).
- Skeleton duration is measured only when skeleton text is observed during run.
