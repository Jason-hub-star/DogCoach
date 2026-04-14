# Landing -> Survey -> Tabs E2E Report

- Frontend: http://127.0.0.1:3002
- Generated at: 2026-04-08T06:29:13.758Z
- Overall: **FAIL**
- Steps: 4 passed / 5 failed

## Step Results
1. [PASS] Landing -> Survey CTA (3163ms)
2. [FAIL] Survey submit (7-step) (47943ms) - TimeoutError: page.waitForURL: Timeout 45000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
3. [FAIL] Result -> Dashboard entry (2318ms) - dashboard returned authentication error
4. [FAIL] Dashboard quick log (30064ms) - TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: '짖음' }).first()[22m

5. [FAIL] Log tab timeline (3164ms) - timeline did not show expected log count
6. [PASS] Log tab analytics (277ms)
7. [PASS] Coach tab (1655ms)
8. [PASS] Settings tab (2888ms)
9. [FAIL] Quick-record tab open (30300ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.

## API Summary
- (no /api/v1 traffic captured)
