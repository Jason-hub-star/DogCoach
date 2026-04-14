# Logged-in Profile2 Full Flow Report

- Frontend: https://www.mungai.co.kr
- Generated at: 2026-04-08T07:46:35.043Z
- Overall: **FAIL**
- Steps: 4 passed / 4 failed

## Step Results
1. [PASS] Session present and API token valid (or onboarding-needed) (6524ms)
2. [FAIL] /login redirect with logged-in session (3599ms) - not redirected to dashboard/survey
3. [FAIL] Complete survey as logged-in user if needed (67140ms) - TimeoutError: page.waitForURL: Timeout 60000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
4. [FAIL] Result -> Dashboard load (7096ms) - dashboard auth/error
5. [FAIL] Dashboard quick log create (20051ms) - TimeoutError: locator.click: Timeout 20000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: '짖음' }).first()[22m

6. [PASS] Log tab timeline + analytics (673ms)
7. [PASS] Coach tab open (418ms)
8. [PASS] Settings tab open (185ms)

## API Summary
- POST /api/v1/auth/migrate-guest 200: 7
- GET /api/v1/auth/me 404: 3
- GET /api/v1/dogs/profile 404: 2
- GET /api/v1/dashboard/ 401: 1
- GET /api/v1/dashboard/ 404: 1
