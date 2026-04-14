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
- data-ready: min 10202ms, p50 10202ms, p90 10202ms, max 10202ms, avg 10202ms
- skeleton-visible: p50 91ms
- stable-ui: p50 10773ms
- api_count_5s: p50 2 calls
- timeout runs: 0/1

## /log
- data-ready: min 5110ms, p50 5110ms, p90 5110ms, max 5110ms, avg 5110ms
- skeleton-visible: p50 -
- stable-ui: p50 5110ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /coach
- data-ready: min 92ms, p50 92ms, p90 92ms, max 92ms, avg 92ms
- skeleton-visible: p50 -
- stable-ui: p50 92ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /settings
- data-ready: min 202ms, p50 202ms, p90 202ms, max 202ms, avg 202ms
- skeleton-visible: p50 -
- stable-ui: p50 202ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## /dog/profile
- data-ready: min 8802ms, p50 8802ms, p90 8802ms, max 8802ms, avg 8802ms
- skeleton-visible: p50 105ms
- stable-ui: p50 9383ms
- api_count_5s: p50 1 calls
- timeout runs: 0/1

## Notes
- This report is measured after authenticated session detection (manual OAuth or injected session).
- stable-ui uses quiet window 600ms after latest matched API response.

