# Dashboard Render Performance Report

## Scope
- Frontend: https://www.mungai.co.kr
- Backend: https://backend-production-61c6.up.railway.app
- Seeded dog id: 74f94213-05b8-441c-9056-dc5391101eed

## Test Matrix
- Desktop (Chrome headless): 3 runs
- Mobile (iPhone 13 emulation): 2 runs
- API only (/api/v1/dashboard/ with cookie): 10 runs

## Key Result (Landing -> Dashboard -> Real Data)
- Desktop data-ready: min 137ms, p50 178ms, p90 315ms, max 315ms, avg 210ms
- Mobile data-ready: min 163ms, p50 163ms, p90 223ms, max 223ms, avg 193ms

## Skeleton -> Data Duration
- Desktop: detected 3/3 runs, min 56ms, p50 71ms, p90 221ms, max 221ms, avg 116ms
- Mobile: detected 2/2 runs, min 61ms, p50 61ms, p90 66ms, max 66ms, avg 64ms

## Render End State
- Desktop: {"no_dog":3}
- Mobile: {"no_dog":2}

## Dashboard API (Browser-captured)
- Desktop: min -, p50 -, p90 -, max -, avg -
- Mobile: min -, p50 -, p90 -, max -, avg -

## Dashboard API (Direct request)
- API only: min 4916ms, p50 5070ms, p90 5149ms, max 5285ms, avg 5091ms

## Notes
- This suite uses real backend data by creating a guest survey record first.
- Dashboard render completion is detected when header/stat DOM appears (Insight Dashboard, Total, dog profile link).
- Skeleton duration is measured only when skeleton text is observed during run.
