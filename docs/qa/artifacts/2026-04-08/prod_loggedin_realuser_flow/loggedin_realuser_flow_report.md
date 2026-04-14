# Logged-in Real User Flow E2E Report

- Frontend: https://www.mungai.co.kr
- Generated at: 2026-04-08T07:38:26.539Z
- Overall: **FAIL**
- Steps: 6 passed / 4 failed

## Step Results
1. [PASS] Load home with existing real-user session (713ms)
2. [FAIL] /login redirect for already authenticated user (3652ms) - did not redirect to dashboard/survey
3. [FAIL] Dashboard load (real data render) (3017ms) - dashboard auth/error state
4. [FAIL] Quick log create from dashboard (15061ms) - TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: '짖음' }).first()[22m

5. [PASS] Log tab timeline + analytics (637ms)
6. [PASS] Coach tab open (769ms)
7. [PASS] Settings tab open (831ms)
8. [FAIL] /survey guard redirect for logged-in existing dog (3598ms) - survey guard did not redirect to dashboard
9. [PASS] /survey?enhance=true submit new dog as logged-in user (10295ms)
10. [PASS] Result -> Dashboard re-entry after logged-in survey submit (5336ms)

## API Summary
- GET /api/v1/dashboard/ 401: 4
- POST /api/v1/onboarding/survey 201: 1
- GET /api/v1/dashboard/ 200: 1
