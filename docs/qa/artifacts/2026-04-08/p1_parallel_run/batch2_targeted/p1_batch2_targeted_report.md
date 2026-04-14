# P1 Batch2 Targeted Report

- Frontend: https://www.mungai.co.kr
- Backend: https://backend-production-61c6.up.railway.app
- Profile: /Users/family/jason/TailLogweb/tmp_qa_profile_snapshot
- Generated at: 2026-04-08T09:25:18.062Z

## Summary
- PASS: 10
- FAIL: 0
- BLOCKED: 1

## Cases
1. AUTH-05 [PASS] OAuth callback returnTo survey (640ms) - redirected to /survey
2. AUTH-06 [PASS] OAuth callback returnTo dashboard (293ms) - redirected to /dashboard
3. AUTH-09 [PASS] migrate-guest failure should not block callback routing (686ms) - callback routing continued despite migrate-guest 500
4. DASH-16 [PASS] Quick log repeated taps stability (18385ms) - repeated taps did not break quick-log flow
5. DASH-05 [PASS] Log edit save via API patch (13638ms) - log patch 200 and intensity updated
6. COACH-09 [PASS] Settings data delete/export guidance visible (232ms) - data management/export/delete guidance rendered
7. AUTH-04 [PASS] Auth callback without session (3001ms) - error UI shown for missing callback session
8. AUTH-03 [PASS] Expired/invalid token re-entry to /login (3104ms) - invalid token did not cause infinite loading; login UI recovered
9. AUTH-10 [PASS] Corrupted localStorage auth token recovery (2802ms) - corrupted localStorage token did not break login page rendering
10. NET-14 [PASS] Login session refresh expired recovery (0ms) - same invalid/expired token recovery path verified via /login
11. NET-06 [BLOCKED] Deploy rootDirectory validation (0ms) - runtime QA cannot deterministically prove deploy rootDirectory config without deployment mutation
