# Landing -> Survey -> Tabs E2E Report

- Frontend: https://taillog-4i77pestu-kimjuyoung1127s-projects.vercel.app
- Generated at: 2026-04-08T06:39:34.736Z
- Overall: **FAIL**
- Steps: 0 passed / 9 failed

## Step Results
1. [FAIL] Landing -> Survey CTA (1799ms) - Error: page.goto: Navigation to "https://taillog-4i77pestu-kimjuyoung1127s-projects.vercel.app/survey" is interrupted by another navigation to "https://vercel.com/login?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Ftaillog-4i77pestu-kimjuyoung1127s-projects.vercel.app%252F%26nonce%3D50f8098acc4ca37f3232e021839b76b5f8363b53336d5353b1be1fa05aea0127"
Call log:
[2m  - navigating to "https://taillog-4i77pestu-kimjuyoung1127s-projects.vercel.app/survey", waiting until "domcontentloaded"[22m

2. [FAIL] Survey submit (7-step) (30072ms) - TimeoutError: locator.fill: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for getByPlaceholder('예: 머루')[22m

3. [FAIL] Result -> Dashboard entry (30560ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
4. [FAIL] Dashboard quick log (30074ms) - TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: '짖음' }).first()[22m

5. [FAIL] Log tab timeline (61095ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
6. [FAIL] Log tab analytics (30051ms) - TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: '분석 & 코칭' })[22m

7. [FAIL] Coach tab (60915ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
8. [FAIL] Settings tab (61201ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
9. [FAIL] Quick-record tab open (60901ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.

## API Summary
- (no /api/v1 traffic captured)
