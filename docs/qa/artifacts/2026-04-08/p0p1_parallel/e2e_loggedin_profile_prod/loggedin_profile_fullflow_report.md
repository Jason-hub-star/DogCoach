# Logged-in Profile Full Flow Report

- Frontend: https://www.mungai.co.kr
- Backend: https://backend-production-61c6.up.railway.app
- Profile: /Users/family/jason/TailLogweb/tmp_qa_profile_snapshot
- Generated at: 2026-04-08T08:30:40.418Z
- Overall: **PASS**
- Steps: 8 passed / 0 failed

## Step Results
1. [PASS] Session present and API token valid (or onboarding-needed) (5758ms)
2. [PASS] /login redirect with logged-in session (5510ms)
3. [PASS] Complete survey as logged-in user if needed (0ms)
4. [PASS] Result -> Dashboard load (9057ms)
5. [PASS] Dashboard quick log create (8389ms)
6. [PASS] Log tab timeline + analytics (30572ms)
7. [PASS] Coach tab open (127ms)
8. [PASS] Settings tab open (138ms)

## API Summary
- POST /api/v1/auth/migrate-guest 200: 7
- GET /api/v1/auth/me 200: 2
- GET /api/v1/dashboard/ 401: 1
- GET /api/v1/dashboard/ 200: 2
- POST /api/v1/logs 307: 1
- POST /api/v1/logs/ 201: 1
