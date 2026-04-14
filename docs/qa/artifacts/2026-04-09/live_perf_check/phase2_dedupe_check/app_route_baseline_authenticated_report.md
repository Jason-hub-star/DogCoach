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
- data-ready: min 9192ms, p50 9192ms, p90 9192ms, max 9192ms, avg 9192ms
- skeleton-visible: p50 797ms
- stable-ui: p50 9724ms
- api_count_5s: p50 2 calls
- timeout runs: 0/1

## /log
- data-ready: min 5263ms, p50 5263ms, p90 5263ms, max 5263ms, avg 5263ms
- skeleton-visible: p50 -
- stable-ui: p50 5263ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /coach
- data-ready: min 506ms, p50 506ms, p90 506ms, max 506ms, avg 506ms
- skeleton-visible: p50 -
- stable-ui: p50 506ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /settings
- data-ready: min 123ms, p50 123ms, p90 123ms, max 123ms, avg 123ms
- skeleton-visible: p50 -
- stable-ui: p50 123ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /dog/profile
- data-ready: min 9236ms, p50 9236ms, p90 9236ms, max 9236ms, avg 9236ms
- skeleton-visible: p50 109ms
- stable-ui: p50 9819ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## Notes
- This report is measured after authenticated session detection (manual OAuth or injected session).
- stable-ui uses quiet window 600ms after latest matched API response.

