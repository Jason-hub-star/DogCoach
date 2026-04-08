# QA Documentation Index

TailLog 웹/앱 QA 전략, 체크리스트, 실행 로그 아카이브를 한곳에서 찾기 위한 인덱스 문서다.

## Core Docs
- [Parallel Web QA Strategy](./PARALLEL_WEB_QA_STRATEGY.md)
- [Login + App QA Checklist](./LOGIN_APP_QA_CHECKLIST.md)
- [P0/P1 Parallel QA Runbook](./P0_P1_PARALLEL_RUNBOOK.md)
- [UX Risk Test Case Bank](./UX_RISK_TEST_CASE_BANK.md)

## Latest Run Archive
- [2026-04-08 P0 Gate Execution Report](./artifacts/2026-04-08/p0p1_parallel/P0_GATE_EXECUTION_REPORT.md)
- [2026-04-08 P1 Case Execution Report](./artifacts/2026-04-08/p1_parallel_run/P1_CASE_EXECUTION_REPORT.md)
- [2026-04-08 P1 Batch2 Targeted Report](./artifacts/2026-04-08/p1_parallel_run/batch2_targeted/p1_batch2_targeted_report.md)
- [2026-04-08 P1 Batch3 Gap-Fill Report](./artifacts/2026-04-08/p1_parallel_run/batch3_gap_fill/p1_batch3_gap_fill_report.md)
- [2026-04-09 P1 Batch3 Gap-Fill After Deploy](./artifacts/2026-04-09/p1_parallel_run/batch3_gap_fill_after_deploy/p1_batch3_gap_fill_report.md)
- [2026-04-09 P1 Batch4 Remaining Report](./artifacts/2026-04-09/p1_parallel_run/batch4_remaining/p1_batch4_remaining_report.md)
- [2026-04-08 QA Run Report](./artifacts/2026-04-08/QA_RUN_REPORT.md)
- [2026-04-08 Vercel Production Check Report](./artifacts/2026-04-08/VERCEL_CHECK_REPORT.md)
- [2026-04-08 Context Mapping Real Flow (JSON)](./artifacts/2026-04-08/context_mapping_real_flow_after_fix.json)
- Full Journey Logs (2026-04-08)
  - `full_journey_web_smoke.log`
  - `full_journey_api_parallel.log`
  - `full_journey_backend_pytest.log`
  - `full_journey_frontend_build.log`
  - `full_journey_route_api_matrix.log`

## Incident Note (2026-04-08)
- 증상: 랜딩 -> 대시보드 이동 시 `반려견 정보가 없습니다.` 고정.
- 원인: 프로덕션 번들의 게스트 대시보드 조회 비활성화(`useDashboardData(!!token, token)` 경로) + API/CORS 설정 불일치.
- 조치: Vercel API URL 교정, Railway CORS/쿠키 정책 보정, 최신 프론트 코드 재배포.
- 검증: 같은 브라우저 세션에서 `survey -> dashboard` 201/200 및 실데이터 렌더 확인.

## Quick Commands
```bash
# Web smoke
scripts/qa/run_parallel_web_smoke.sh

# API parallel lanes
scripts/qa/run_parallel_api_qa.sh
```

## Notes
- 운영 장애 재현/수정 사례는 Run Report에 날짜별로 누적한다.
- 장애 수정 시 "원인 -> 수정 -> 재검증" 순서로 로그를 반드시 함께 남긴다.
