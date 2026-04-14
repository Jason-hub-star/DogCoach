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
- data-ready: min 8627ms, p50 8627ms, p90 8627ms, max 8627ms, avg 8627ms
- skeleton-visible: p50 54ms
- stable-ui: p50 9194ms
- api_count_5s: p50 2 calls
- timeout runs: 0/1

## /log
- data-ready: min 5100ms, p50 5100ms, p90 5100ms, max 5100ms, avg 5100ms
- skeleton-visible: p50 -
- stable-ui: p50 5100ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /coach
- data-ready: min 87ms, p50 87ms, p90 87ms, max 87ms, avg 87ms
- skeleton-visible: p50 -
- stable-ui: p50 87ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /settings
- data-ready: min 219ms, p50 219ms, p90 219ms, max 219ms, avg 219ms
- skeleton-visible: p50 -
- stable-ui: p50 219ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /dog/profile
- data-ready: min 9121ms, p50 9121ms, p90 9121ms, max 9121ms, avg 9121ms
- skeleton-visible: p50 123ms
- stable-ui: p50 9699ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## Notes
- This report is measured after authenticated session detection (manual OAuth or injected session).
- This run used real OAuth sign-in (Google) in production frontend.
- stable-ui uses quiet window 600ms after latest matched API response.
