# App Route Baseline Report (Guest)

## Scope
- Frontend: https://www.mungai.co.kr
- Backend: https://backend-production-61c6.up.railway.app
- Seeded dog id: df1a44d7-0fa2-4989-9bf8-c6d27cb76ff1

## Routes
- /dashboard (dashboard)
- /log (log)
- /coach (coach)
- /settings (settings)
- /dog/profile (dog_profile)

## /dashboard
- Desktop data-ready: min 6051ms, p50 6401ms, p90 7268ms, max 7268ms, avg 6573ms
- Mobile data-ready: min 6199ms, p50 6213ms, p90 6262ms, max 6262ms, avg 6225ms
- Desktop skeleton-visible: p50 134ms
- Mobile skeleton-visible: p50 86ms
- Desktop stable-ui: p50 6959ms
- Mobile stable-ui: p50 6779ms
- Desktop skeleton->data: detected 3/3, p50 5994ms
- Mobile skeleton->data: detected 3/3, p50 6113ms
- Timeout runs: desktop 0/3, mobile 0/3
- Desktop api_count_5s p50: 1 calls
- Mobile api_count_5s p50: 1 calls

## /log
- Desktop data-ready: min 5063ms, p50 5108ms, p90 5297ms, max 5297ms, avg 5156ms
- Mobile data-ready: min 5084ms, p50 5103ms, p90 5115ms, max 5115ms, avg 5101ms
- Desktop skeleton-visible: p50 -
- Mobile skeleton-visible: p50 -
- Desktop stable-ui: p50 5108ms
- Mobile stable-ui: p50 5103ms
- Desktop skeleton->data: detected 0/3, p50 -
- Mobile skeleton->data: detected 0/3, p50 -
- Timeout runs: desktop 0/3, mobile 0/3
- Desktop api_count_5s p50: 0 calls
- Mobile api_count_5s p50: 0 calls

## /coach
- Desktop data-ready: min 129ms, p50 149ms, p90 313ms, max 313ms, avg 197ms
- Mobile data-ready: min 171ms, p50 177ms, p90 217ms, max 217ms, avg 188ms
- Desktop skeleton-visible: p50 -
- Mobile skeleton-visible: p50 -
- Desktop stable-ui: p50 149ms
- Mobile stable-ui: p50 177ms
- Desktop skeleton->data: detected 0/3, p50 -
- Mobile skeleton->data: detected 0/3, p50 -
- Timeout runs: desktop 0/3, mobile 0/3
- Desktop api_count_5s p50: 0 calls
- Mobile api_count_5s p50: 0 calls

## /settings
- Desktop data-ready: min 114ms, p50 144ms, p90 433ms, max 433ms, avg 230ms
- Mobile data-ready: min 111ms, p50 179ms, p90 201ms, max 201ms, avg 164ms
- Desktop skeleton-visible: p50 -
- Mobile skeleton-visible: p50 -
- Desktop stable-ui: p50 144ms
- Mobile stable-ui: p50 179ms
- Desktop skeleton->data: detected 0/3, p50 -
- Mobile skeleton->data: detected 0/3, p50 -
- Timeout runs: desktop 0/3, mobile 0/3
- Desktop api_count_5s p50: 0 calls
- Mobile api_count_5s p50: 0 calls

## /dog/profile
- Desktop data-ready: min 5115ms, p50 5142ms, p90 5249ms, max 5249ms, avg 5169ms
- Mobile data-ready: min 5099ms, p50 5104ms, p90 5177ms, max 5177ms, avg 5127ms
- Desktop skeleton-visible: p50 -
- Mobile skeleton-visible: p50 -
- Desktop stable-ui: p50 5142ms
- Mobile stable-ui: p50 5104ms
- Desktop skeleton->data: detected 0/3, p50 -
- Mobile skeleton->data: detected 0/3, p50 -
- Timeout runs: desktop 0/3, mobile 0/3
- Desktop api_count_5s p50: 0 calls
- Mobile api_count_5s p50: 0 calls

## Notes
- Guest flow only (anonymous cookie 기반).
- stable-ui uses quiet window 600ms after latest matched API response.
- Authenticated baseline은 별도 리포트(`app_route_baseline_authenticated_report.md`)에 기록됨.
- 프로덕션 OAuth 실로그인 재현 측정은 아직 별도 수행 필요.
