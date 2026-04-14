# Logged-in Profile Full Flow Report

- Frontend: https://www.mungai.co.kr
- Backend: https://backend-production-61c6.up.railway.app
- Profile: /Users/family/jason/TailLogweb/tmp_qa_profile_snapshot
- Generated at: 2026-04-08T08:35:06.620Z
- Overall: **PASS**
- Steps: 8 passed / 0 failed

## Step Results
1. [PASS] Session present and API token valid (or onboarding-needed) (7822ms)
2. [PASS] /login redirect with logged-in session (5103ms)
3. [PASS] Complete survey as logged-in user if needed (0ms)
4. [PASS] Result -> Dashboard load (9620ms)
5. [PASS] Dashboard quick log create (9117ms)
6. [PASS] Log tab timeline + analytics (30667ms)
7. [PASS] Coach tab open (128ms)
8. [PASS] Settings tab open (132ms)

## API Summary
- POST /api/v1/auth/migrate-guest 200: 7
- GET /api/v1/auth/me 200: 2
- GET /api/v1/dashboard/ 401: 2
- GET /api/v1/dashboard/ 200: 2
- POST /api/v1/logs 307: 1
- POST /api/v1/logs/ 201: 1
