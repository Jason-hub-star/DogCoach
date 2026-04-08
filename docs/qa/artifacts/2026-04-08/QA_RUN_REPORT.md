# QA Run Report (2026-04-08)

## Scope
- 병렬 웹/앱 QA 시작
- 운영 백엔드(`https://backend-production-61c6.up.railway.app`) 기준 검증
- 로그인/게스트/API 가드/설문 제출 시나리오

## Executed
1. 웹 병렬 스모크
   - Command: `scripts/qa/run_parallel_web_smoke.sh`
   - Result: PASS
   - Log: `web_smoke.log`
2. API 병렬 QA (1차)
   - Command: `scripts/qa/run_parallel_api_qa.sh`
   - Result: FAIL
   - Failure: guest survey submit `POST /api/v1/onboarding/survey` returned `500`
   - Log: `api_parallel_qa.log`
3. 원인 분석 (Railway logs)
   - Root cause: `UndefinedColumnError: column "duration" of relation "behavior_logs" does not exist`
   - Logs:
     - `railway_http_30m.log`
     - `railway_deploy_undefined_column.log`
4. 수정 적용
   - Runtime DB patch executed:
     - `ALTER TABLE IF EXISTS public.behavior_logs ADD COLUMN IF NOT EXISTS duration INTEGER;`
   - Repo patch added:
     - `Backend/scripts/patch_2026_04_08_add_behavior_logs_duration.sql`
5. API 병렬 QA (2차)
   - Command: `scripts/qa/run_parallel_api_qa.sh`
   - Result: PASS
   - Log: `api_parallel_qa_after_fix.log`
6. 테스트 경고 제거
   - Issue: `test_e2e_guest_migration`에서 `db.add`를 `AsyncMock`으로 사용해 RuntimeWarning 발생
   - Fix:
     - `Backend/tests/conftest.py`: `session.add = Mock()` 적용
     - `Backend/tests/features/test_e2e_guest_migration.py`: `mock_db.add = Mock()`으로 교체
   - Verification:
     - `pytest tests -q` => `19 passed, 0 warnings`
     - Log: `backend_pytest_after_warning_fix.log`
7. API 병렬 QA (최종)
   - Result: PASS
   - Log: `api_parallel_qa_final.log`
8. 문서 커밋/푸시 이후 전체 여정 재검증
   - Push: `edec26a` -> `origin/main`
   - Web Smoke (prod): PASS
     - Log: `full_journey_web_smoke.log`
   - API Parallel (prod): PASS
     - Log: `full_journey_api_parallel.log`
   - Backend Tests: `19 passed`
     - Log: `full_journey_backend_pytest.log`
   - Frontend Build: PASS
     - Log: `full_journey_frontend_build.log`
   - Route/API Matrix (prod):
     - Frontend routes: `/`, `/login`, `/survey`, `/result`, `/dashboard`, `/coach`, `/log`, `/settings`, `/terms`, `/privacy`, `/auth/callback`, `/sitemap.xml` 모두 `200`
     - Backend endpoints: `/health=200`, `/api/v1/auth/me=401`, `/api/v1/dashboard/=401`
     - Log: `full_journey_route_api_matrix.log`

## Final Status
- 재현된 500 장애 수정 완료
- 동일 시나리오 재검증 PASS
- 운영 `/health` 및 주요 QA lane 정상
- 백엔드 테스트 경고 0건 상태로 정리
- 문서 푸시 이후 전체 사용자 여정 자동 검증 PASS
