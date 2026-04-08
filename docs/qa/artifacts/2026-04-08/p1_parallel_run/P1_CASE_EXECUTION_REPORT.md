# P1 Case Execution Report

- Date: 2026-04-09 (KST)
- Frontend: https://www.mungai.co.kr
- Backend: https://backend-production-61c6.up.railway.app
- Source: `docs/qa/UX_RISK_TEST_CASE_BANK.md` (P1 40 cases)

## Summary
- Total P1 cases: 40
- PASS: 34
- PARTIAL: 2
- NOT_RUN: 1
- BLOCKED: 3

## Executed Evidence Set
- Web smoke: `p1_parallel_run/web_smoke_prod/run.log`
- API parallel: `p1_parallel_run/api_prod/run.log`
- Guest E2E: `p1_parallel_run/e2e_guest_prod/landing_survey_tabs_e2e_report.md`
- Logged-in E2E: `p1_parallel_run/e2e_loggedin_profile_prod/loggedin_profile_fullflow_report.md`
- Dashboard perf: `p1_parallel_run/dashboard_perf_prod/dashboard_render_perf_report.md`
- Batch2 targeted: `p1_parallel_run/batch2_targeted/p1_batch2_targeted_report.md`
- Batch3 gap-fill (after deploy): `../2026-04-09/p1_parallel_run/batch3_gap_fill_after_deploy/p1_batch3_gap_fill_report.md`
- Batch4 remaining: `../2026-04-09/p1_parallel_run/batch4_remaining/p1_batch4_remaining_report.md`
- CORS/request_id checks: shell traces in current run (OPTIONS/POST survey)

## Case Matrix
| Case | Status | Evidence | Note |
|---|---|---|---|
| AUTH-02 | PASS | loggedin_profile_fullflow_report.md | `/login` 진입 시 로그인 세션 리다이렉트 확인 |
| AUTH-03 | PASS | batch2_targeted report | invalid token에서 `/login` 복구 UI 확인 |
| AUTH-04 | PASS | batch2_targeted report | callback 세션 누락 시 에러 UI + 로그인 이동 버튼 확인 |
| AUTH-05 | PASS | batch2_targeted report | `/auth/callback?returnTo=/survey` 리다이렉트 확인 |
| AUTH-06 | PASS | batch2_targeted report | `/auth/callback?returnTo=/dashboard` 리다이렉트 확인 |
| AUTH-08 | PASS | batch3_gap_fill report | `/auth/me` 404 주입 시 `/login -> /survey` 온보딩 분기 확인 |
| AUTH-09 | PASS | batch2_targeted report | callback 중 `migrate-guest 500` 주입에도 라우팅 지속 확인 |
| AUTH-10 | PASS | batch2_targeted report | localStorage 토큰 손상 시 `/login` 복구 렌더 확인 |
| AUTH-11 | PASS | batch3_gap_fill report | 유효 세션 + profile-missing 주입 시 `/survey` 진입 확인 |
| AUTH-12 | PASS | batch3_gap_fill_after_deploy report | `/dashboard` no-dog 404 주입 시 온보딩/no-dog 안내 렌더 확인 |
| AUTH-14 | PASS | loggedin_profile_fullflow_report.md | 로그인 루프 없이 정상 리다이렉트 확인 |
| SURVEY-01 | PASS | landing_survey_tabs_e2e_report.md | 게스트 설문 시작 성공 |
| SURVEY-02 | PASS | batch3_gap_fill + loggedin_profile_fullflow | 로그인 상태의 `has-profile -> dashboard`, `profile-missing -> survey` 두 분기 확인 |
| SURVEY-05 | PASS | api_prod/lane_validation.log | 필수 행동문제 누락 payload 422 확인 |
| SURVEY-06 | PASS | api_prod/lane_validation.log | 필수 트리거 누락 payload 422 확인 |
| SURVEY-10 | PASS | api_prod/lane_guest_journey.log | 이미지 없이 설문 제출 201 확인 |
| SURVEY-12 | PASS | landing_survey_tabs_e2e_report.md | 제출 후 result 라우팅 성공 |
| DASH-01 | PASS | guest+loggedin e2e report | 대시보드 실데이터 렌더 확인 |
| DASH-02 | PASS | dashboard_render_perf_report.md | 로딩 지연 측정 완료, 데이터 전환 성공 |
| DASH-03 | PASS | guest+loggedin e2e report | quick log 생성 성공 |
| DASH-05 | PASS | batch2_targeted report | `/api/v1/logs/{log_id}` patch 200 및 intensity 반영 확인 |
| DASH-06 | BLOCKED | batch4_remaining report | 백엔드 `DELETE /api/v1/logs/{id}` 미구현(404/405)으로 런타임 삭제 시나리오 불가 |
| DASH-07 | PASS | guest+loggedin e2e report | log timeline 렌더 성공 |
| DASH-09 | PASS | batch4_remaining report | dashboard no-dog 404 강제 시 친절한 온보딩 안내 UX 확인 |
| DASH-10 | PASS | web_smoke_prod/lane_guest.log | unauth dashboard API 401 분기 확인 |
| DASH-11 | PASS | batch3_gap_fill report | `/dogs/profile` 404 주입 시 크래시 없이 설문 CTA 노출 확인 |
| DASH-13 | PASS | dashboard_render_perf_report.md | skeleton -> data latency 측정/성공 |
| DASH-16 | PASS | batch2_targeted report | quick log 연타 후 저장/카운트 증가 안정성 확인 |
| COACH-02 | NOT_RUN | - | 추천 로딩 실패 강제 주입 케이스 미실행(다음 배치) |
| COACH-06 | BLOCKED | batch4_remaining report | 실계정 보호를 위해 unlink 파괴행동 미실행 + 연결된 identity 미재현 |
| COACH-09 | PASS | batch2_targeted report | 데이터/내보내기/초기화 안내 텍스트 렌더 확인 |
| NET-01 | PASS | OPTIONS header check | CORS allow-origin/methods/credentials 확인 |
| NET-02 | PASS | batch4_remaining report | 설문 제출 500 강제 시 사용자 실패 UX(재시도 유도) 노출 확인 |
| NET-03 | PASS | POST survey header check | `x-request-id` 수집 확인 |
| NET-06 | BLOCKED | - | deploy rootDirectory 검증은 런타임 외 설정영역 |
| NET-07 | PARTIAL | OPTIONS/POST CORS header | 운영 origin 허용 확인, env-empty fallback은 미강제 |
| NET-09 | PARTIAL | web/api/loggedin runs | 401/200 분기 확인, 404(onboarding-needed) 분기 미재현 |
| NET-13 | PASS | POST survey 201 check | snake_case payload 201 확인 |
| NET-14 | PASS | batch2_targeted report | 만료/invalid 토큰 상태에서 `/login` 복구 경로 확인 |
| NET-15 | PASS | batch3_gap_fill report | `/auth/me` 404 body를 onboarding-needed로 해석해 `/survey` 라우팅 확인 |

## Immediate P1 Next Batch (추천)
1. COACH lane: `COACH-02`
2. PARTIAL 보강: `NET-07, NET-09`
3. BLOCKED 해소: `DASH-06`(DELETE endpoint 정책 확정), `COACH-06`(샌드박스 계정 준비)

## Go/No-Go (P1 관점)
- Gate-0는 이미 PASS.
- P1는 아직 `NOT_RUN/BLOCKED/PARTIAL`이 남아 운영 기준으로는 "추가 병렬 실행 필요".
