# Dashboard Render Performance Report

## Scope
- Frontend: https://www.mungai.co.kr
- Backend: https://backend-production-61c6.up.railway.app
- Seeded dog id: b63cf2a9-74fc-4265-9600-3fd107571605

## Test Matrix
- Desktop (Chrome headless): 5 runs
- Mobile (iPhone 13 emulation): 5 runs
- API only (/api/v1/dashboard/ with cookie): 20 runs

## Key Result (Landing -> Dashboard -> Real Data)
- Desktop data-ready: min 264ms, p50 318ms, p90 707ms, max 707ms, avg 443ms
- Mobile data-ready: min 192ms, p50 387ms, p90 649ms, max 649ms, avg 389ms

## Skeleton -> Data Duration
- Desktop: detected 5/5 runs, min 3ms, p50 74ms, p90 369ms, max 369ms, avg 132ms
- Mobile: detected 5/5 runs, min 4ms, p50 146ms, p90 308ms, max 308ms, avg 136ms

## Render End State
- Desktop: {"no_dog":5}
- Mobile: {"no_dog":5}

## Dashboard API (Browser-captured)
- Desktop: min -, p50 -, p90 -, max -, avg -
- Mobile: min -, p50 -, p90 -, max -, avg -

## Dashboard API (Direct request)
- API only: min 4844ms, p50 5029ms, p90 5159ms, max 5261ms, avg 5042ms

## Notes
- This suite uses real backend data by creating a guest survey record first.
- Dashboard render completion is detected when header/stat DOM appears (Insight Dashboard, Total, dog profile link).
- Skeleton duration is measured only when skeleton text is observed during run.
