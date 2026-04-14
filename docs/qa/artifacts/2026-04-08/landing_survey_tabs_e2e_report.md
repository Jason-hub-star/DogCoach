# Landing -> Survey -> Tabs E2E Report

- Frontend: https://www.mungai.co.kr
- Generated at: 2026-04-08T06:26:25.027Z
- Overall: **FAIL**
- Steps: 7 passed / 2 failed

## Step Results
1. [PASS] Landing -> Survey CTA (951ms)
2. [PASS] Survey submit (7-step) (10208ms)
3. [PASS] Result -> Dashboard entry (5837ms)
4. [FAIL] Dashboard quick log (31026ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
5. [FAIL] Log tab timeline (124ms) - timeline did not show expected log count
6. [PASS] Log tab analytics (267ms)
7. [PASS] Coach tab (113ms)
8. [PASS] Settings tab (123ms)
9. [PASS] Quick-record tab open (163ms)

## API Summary
- POST /api/v1/onboarding/survey 201: 1
- GET /api/v1/dashboard/ 200: 1
