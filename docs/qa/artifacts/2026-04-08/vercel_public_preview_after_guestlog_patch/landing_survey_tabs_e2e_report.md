# Landing -> Survey -> Tabs E2E Report

- Frontend: https://taillog-a0v65in5l-kimjuyoung1127s-projects.vercel.app
- Generated at: 2026-04-08T06:47:22.274Z
- Overall: **FAIL**
- Steps: 0 passed / 9 failed

## Step Results
1. [FAIL] Landing -> Survey CTA (1546ms) - Error: page.goto: Navigation to "https://taillog-a0v65in5l-kimjuyoung1127s-projects.vercel.app/survey" is interrupted by another navigation to "https://vercel.com/login?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Ftaillog-a0v65in5l-kimjuyoung1127s-projects.vercel.app%252F%26nonce%3Df25d233e39d030bd81785def14c15fbc019d187fe84ad22164e5230ee5fa2136"
Call log:
[2m  - navigating to "https://taillog-a0v65in5l-kimjuyoung1127s-projects.vercel.app/survey", waiting until "domcontentloaded"[22m

2. [FAIL] Survey submit (7-step) (30057ms) - TimeoutError: locator.fill: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for getByPlaceholder('예: 머루')[22m

3. [FAIL] Result -> Dashboard entry (30181ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
4. [FAIL] Dashboard quick log (30054ms) - TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: '짖음' }).first()[22m

5. [FAIL] Log tab timeline (61036ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
6. [FAIL] Log tab analytics (30060ms) - TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: '분석 & 코칭' })[22m

7. [FAIL] Coach tab (61083ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
8. [FAIL] Settings tab (61267ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
9. [FAIL] Quick-record tab open (60930ms) - TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.

## API Summary
- (no /api/v1 traffic captured)
