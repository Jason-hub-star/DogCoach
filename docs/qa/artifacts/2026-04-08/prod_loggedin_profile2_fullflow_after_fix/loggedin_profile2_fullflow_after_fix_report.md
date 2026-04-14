# Logged-in Profile2 Full Flow After Fix Report

- Frontend: https://www.mungai.co.kr
- Generated at: 2026-04-08T07:59:15.923Z
- Overall: **PASS**
- Steps: 7 passed / 0 failed

## Step Results
1. [PASS] Logged-in token available (569ms)
2. [PASS] /login redirects to survey/dashboard (6994ms)
3. [PASS] Survey submit returns 201 and lands on result (17268ms)
4. [PASS] Dashboard load after result (8776ms)
5. [PASS] Dashboard quick log (8178ms)
6. [PASS] Log tab timeline + analytics (643ms)
7. [PASS] Coach and Settings tabs (555ms)

## API Summary
- GET /api/v1/auth/me 200: 3
- POST /api/v1/auth/migrate-guest 200: 5
- GET /api/v1/dogs/profile 200: 1
- POST /api/v1/onboarding/survey 201: 1
- GET /api/v1/dashboard/ 401: 2
- GET /api/v1/dashboard/ 200: 1
- POST /api/v1/logs 307: 1
- POST /api/v1/logs/ 201: 1
