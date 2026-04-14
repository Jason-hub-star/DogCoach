# App Route Baseline Report (Authenticated)

## Scope
- Frontend: https://www.mungai.co.kr
- User: perf-auto-1775725109192@gmail.com
- User ID: 495b69e6-f59a-4a42-8857-7254e11f0b5c

## Routes
- /dashboard
- /log
- /coach
- /settings
- /dog/profile

## /dashboard
- data-ready: min 4288ms, p50 6862ms, p90 7104ms, max 7104ms, avg 6085ms
- skeleton-visible: p50 277ms
- stable-ui: p50 6862ms
- api_count_5s: p50 2 calls
- timeout runs: 0/3

## /log
- data-ready: min 5088ms, p50 5107ms, p90 5477ms, max 5477ms, avg 5224ms
- skeleton-visible: p50 -
- stable-ui: p50 5477ms
- api_count_5s: p50 1 calls
- timeout runs: 0/3

## /coach
- data-ready: min 145ms, p50 157ms, p90 711ms, max 711ms, avg 338ms
- skeleton-visible: p50 -
- stable-ui: p50 157ms
- api_count_5s: p50 1 calls
- timeout runs: 0/3

## /settings
- data-ready: min 151ms, p50 174ms, p90 367ms, max 367ms, avg 231ms
- skeleton-visible: p50 -
- stable-ui: p50 174ms
- api_count_5s: p50 1 calls
- timeout runs: 0/3

## /dog/profile
- data-ready: min 12280ms, p50 13184ms, p90 14428ms, max 14428ms, avg 13297ms
- skeleton-visible: p50 371ms
- stable-ui: p50 13758ms
- api_count_5s: p50 1 calls
- timeout runs: 0/3

## Notes
- This report is measured after authenticated session detection (manual OAuth or injected session).
- This run used session-injected auth (not manual OAuth sign-in).
- stable-ui uses quiet window 600ms after latest matched API response.
