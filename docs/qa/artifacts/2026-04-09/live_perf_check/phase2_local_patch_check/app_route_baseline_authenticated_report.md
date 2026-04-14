# App Route Baseline Report (Authenticated)

## Scope
- Frontend: http://localhost:3002
- User: perf-auto-1775725109192@gmail.com
- User ID: 495b69e6-f59a-4a42-8857-7254e11f0b5c

## Routes
- /dashboard
- /log
- /coach
- /settings
- /dog/profile

## /dashboard
- data-ready: min 3947ms, p50 3947ms, p90 3947ms, max 3947ms, avg 3947ms
- skeleton-visible: p50 2328ms
- stable-ui: p50 3947ms
- api_count_5s: p50 2 calls
- timeout runs: 0/1

## /log
- data-ready: min 5053ms, p50 5053ms, p90 5053ms, max 5053ms, avg 5053ms
- skeleton-visible: p50 4144ms
- stable-ui: p50 5053ms
- api_count_5s: p50 2 calls
- timeout runs: 0/1

## /coach
- data-ready: min 266ms, p50 266ms, p90 266ms, max 266ms, avg 266ms
- skeleton-visible: p50 -
- stable-ui: p50 266ms
- api_count_5s: p50 0 calls
- timeout runs: 0/1

## /settings
- data-ready: min 229ms, p50 229ms, p90 229ms, max 229ms, avg 229ms
- skeleton-visible: p50 -
- stable-ui: p50 229ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /dog/profile
- data-ready: min 1275ms, p50 1275ms, p90 1275ms, max 1275ms, avg 1275ms
- skeleton-visible: p50 267ms
- stable-ui: p50 1275ms
- api_count_5s: p50 3 calls
- timeout runs: 0/1

## Notes
- This report is measured after authenticated session detection (manual OAuth or injected session).
- stable-ui uses quiet window 600ms after latest matched API response.

