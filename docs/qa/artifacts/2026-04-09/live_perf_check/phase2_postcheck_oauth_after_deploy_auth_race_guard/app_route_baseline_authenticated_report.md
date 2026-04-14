# App Route Baseline Report (Authenticated)

## Scope
- Frontend: https://www.mungai.co.kr
- User: gmdqn2tp@gmail.com
- User ID: f59ac308-f321-464e-9a72-d686f55dd94f

## Routes
- /dashboard
- /log
- /coach
- /settings
- /dog/profile

## /dashboard
- data-ready: min 9541ms, p50 9541ms, p90 9541ms, max 9541ms, avg 9541ms
- skeleton-visible: p50 555ms
- stable-ui: p50 10118ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /log
- data-ready: min 11445ms, p50 11445ms, p90 11445ms, max 11445ms, avg 11445ms
- skeleton-visible: p50 635ms
- stable-ui: p50 12030ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /coach
- data-ready: min 715ms, p50 715ms, p90 715ms, max 715ms, avg 715ms
- skeleton-visible: p50 -
- stable-ui: p50 715ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /settings
- data-ready: min 715ms, p50 715ms, p90 715ms, max 715ms, avg 715ms
- skeleton-visible: p50 -
- stable-ui: p50 715ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /dog/profile
- data-ready: min 9663ms, p50 9663ms, p90 9663ms, max 9663ms, avg 9663ms
- skeleton-visible: p50 623ms
- stable-ui: p50 10247ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## Notes
- This report is measured after authenticated session detection (manual OAuth or injected session).
- stable-ui uses quiet window 600ms after latest matched API response.

