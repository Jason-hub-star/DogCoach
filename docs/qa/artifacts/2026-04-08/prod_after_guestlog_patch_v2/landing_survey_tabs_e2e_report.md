# Landing -> Survey -> Tabs E2E Report

- Frontend: https://www.mungai.co.kr
- Generated at: 2026-04-08T06:53:14.910Z
- Overall: **FAIL**
- Steps: 8 passed / 1 failed

## Step Results
1. [PASS] Landing -> Survey CTA (3987ms)
2. [PASS] Survey submit (7-step) (20843ms)
3. [PASS] Result -> Dashboard entry (6344ms)
4. [PASS] Dashboard quick log (7471ms)
5. [FAIL] Log tab timeline (30800ms) - timeline did not show expected log count
6. [PASS] Log tab analytics (264ms)
7. [PASS] Coach tab (159ms)
8. [PASS] Settings tab (139ms)
9. [PASS] Quick-record tab open (4243ms)

## API Summary
- POST /api/v1/onboarding/survey 201: 1
- GET /api/v1/dashboard/ 200: 3
- POST /api/v1/logs 307: 1
- POST /api/v1/logs/ 201: 1
