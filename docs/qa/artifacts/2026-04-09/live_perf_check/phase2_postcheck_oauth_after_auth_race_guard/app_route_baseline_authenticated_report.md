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
- data-ready: min 9929ms, p50 9929ms, p90 9929ms, max 9929ms, avg 9929ms
- skeleton-visible: p50 64ms
- stable-ui: p50 10501ms
- api_count_5s: p50 2 calls
- timeout runs: 0/1

## /log
- data-ready: min 5066ms, p50 5066ms, p90 5066ms, max 5066ms, avg 5066ms
- skeleton-visible: p50 -
- stable-ui: p50 5066ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /coach
- data-ready: min 86ms, p50 86ms, p90 86ms, max 86ms, avg 86ms
- skeleton-visible: p50 -
- stable-ui: p50 86ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /settings
- data-ready: min 71ms, p50 71ms, p90 71ms, max 71ms, avg 71ms
- skeleton-visible: p50 -
- stable-ui: p50 71ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /dog/profile
- data-ready: min 9784ms, p50 9784ms, p90 9784ms, max 9784ms, avg 9784ms
- skeleton-visible: p50 65ms
- stable-ui: p50 10360ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## Notes
- This report is measured after authenticated session detection (manual OAuth or injected session).
- stable-ui uses quiet window 600ms after latest matched API response.

