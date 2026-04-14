# Dashboard Render Performance Report

## Scope
- Frontend: http://localhost:3100
- Backend: https://backend-production-61c6.up.railway.app
- Seeded dog id: 16fbfece-94e3-40f1-8061-a97ea6ae27e6

## Test Matrix
- Desktop (Chrome headless): 4 runs
- Mobile (iPhone 13 emulation): 2 runs
- API only (/api/v1/dashboard/ with cookie): 12 runs

## Key Result (Landing -> Dashboard -> Real Data)
- Desktop data-ready: min 2394ms, p50 2608ms, p90 3240ms, max 3240ms, avg 2714ms
- Mobile data-ready: min 2266ms, p50 2266ms, p90 2832ms, max 2832ms, avg 2549ms

## Skeleton -> Data Duration
- Desktop: detected 4/4 runs, min 2298ms, p50 2508ms, p90 2522ms, max 2522ms, avg 2461ms
- Mobile: detected 2/2 runs, min 2156ms, p50 2156ms, p90 2738ms, max 2738ms, avg 2447ms

## Render End State
- Desktop: {"error":4}
- Mobile: {"error":2}

## Dashboard API (Browser-captured)
- Desktop: min -, p50 -, p90 -, max -, avg -
- Mobile: min -, p50 -, p90 -, max -, avg -

## Dashboard API (Direct request)
- API only: min 4876ms, p50 5013ms, p90 5270ms, max 5271ms, avg 5057ms

## Notes
- This suite uses real backend data by creating a guest survey record first.
- Dashboard render completion is detected when header/stat DOM appears (Insight Dashboard, Total, dog profile link).
- Skeleton duration is measured only when skeleton text is observed during run.
