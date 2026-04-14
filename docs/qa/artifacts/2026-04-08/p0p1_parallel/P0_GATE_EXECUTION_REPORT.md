# P0 Gate Execution Report

- Date: 2026-04-08 (KST)
- Target Frontend: https://www.mungai.co.kr
- Target Backend: https://backend-production-61c6.up.railway.app
- Source Runbook: `docs/qa/P0_P1_PARALLEL_RUNBOOK.md`

## Gate-0 Cases
- NET-04 (`user_role` enum mismatch): PASS (survey submit 201, repeated)
- NET-05 (`user_status` enum mismatch): PASS (survey submit 201, repeated)
- NET-08 (DB schema drift): PASS (10x repeated survey submit all 201)
- NET-12 (deploy 직후 guest+login E2E): PASS (guest PASS + logged-in PASS)
- NET-16 (release regression smoke): PASS (guest smoke/E2E PASS + logged-in fullflow PASS)

## Executions and Evidence
1. Parallel Web Smoke (prod)
- Command:
  - `FRONTEND_BASE_URL=https://www.mungai.co.kr BACKEND_BASE_URL=https://backend-production-61c6.up.railway.app OUT_DIR=docs/qa/artifacts/2026-04-08/p0p1_parallel/web_smoke_prod bash scripts/qa/run_parallel_web_smoke.sh`
- Result: PASS
- Evidence:
  - `web_smoke_prod/run.log`
  - `web_smoke_prod/lane_auth.log`
  - `web_smoke_prod/lane_guest.log`
  - `web_smoke_prod/lane_api.log`

2. Parallel API QA (prod)
- Command:
  - `BACKEND_BASE_URL=https://backend-production-61c6.up.railway.app OUT_DIR=docs/qa/artifacts/2026-04-08/p0p1_parallel/api_prod bash scripts/qa/run_parallel_api_qa.sh`
- Result: PASS
- Evidence:
  - `api_prod/run.log`
  - `api_prod/lane_guest_journey.log`
  - `api_prod/lane_auth_guard.log`
  - `api_prod/lane_validation.log`

3. Landing -> Survey -> Dashboard Tabs E2E (guest)
- Command:
  - `node scripts/qa/run_landing_survey_tabs_e2e.mjs --frontend-url https://www.mungai.co.kr --out-dir docs/qa/artifacts/2026-04-08/p0p1_parallel/e2e_guest_prod`
- Result: PASS (9/9)
- Evidence:
  - `e2e_guest_prod/landing_survey_tabs_e2e_report.md`
  - `e2e_guest_prod/landing_survey_tabs_e2e_raw.json`

4. Survey submit repeat stability (10x)
- Command: repeated POST `/api/v1/onboarding/survey`
- Result: PASS (`ok=10, bad=0`)
- Evidence:
  - `api_prod/survey_repeat_10x.log`

5. CORS preflight + submit header check
- OPTIONS `/api/v1/onboarding/survey`: `Access-Control-Allow-Origin: https://www.mungai.co.kr`
- POST `/api/v1/onboarding/survey`: `201` with CORS headers
- Result: PASS

6. Logged-in full flow (profile reuse)
- Command:
  - `node scripts/qa/run_loggedin_profile_fullflow.mjs --frontend-url https://www.mungai.co.kr --backend-url https://backend-production-61c6.up.railway.app --profile-dir /Users/family/jason/TailLogweb/tmp_qa_profile_snapshot --out-dir docs/qa/artifacts/2026-04-08/p0p1_parallel/e2e_loggedin_profile_prod`
- Result: PASS (8/8)
- Evidence:
  - `e2e_loggedin_profile_prod/loggedin_profile_fullflow_report.md`
  - `e2e_loggedin_profile_prod/loggedin_profile_fullflow_raw.json`

## Gate Decision
- Gate-0 최종 판정: PASS
- 근거: `NET-04/05/08/12/16` 모두 PASS
