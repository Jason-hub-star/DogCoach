# P0 Loading Baseline Snapshot

Date: 2026-04-09
Phase: P0 Baseline

## Source Evidence
- `docs/qa/artifacts/2026-04-09/live_perf_check/dashboard_render_perf_report.md`
- `docs/qa/artifacts/2026-04-09/live_perf_check/dashboard_render_perf_raw.json`
- `docs/qa/artifacts/2026-04-09/live_perf_check/app_route_baseline_report.md`
- `docs/qa/artifacts/2026-04-09/live_perf_check/app_route_baseline_raw.json`
- `docs/qa/artifacts/2026-04-09/live_perf_check/app_route_baseline_authenticated_report.md`
- `docs/qa/artifacts/2026-04-09/live_perf_check/app_route_baseline_authenticated_raw.json`
- `docs/qa/artifacts/2026-04-09/live_perf_check/oauth_real_login_check/app_route_baseline_authenticated_report.md`
- `docs/qa/artifacts/2026-04-09/live_perf_check/oauth_real_login_check/app_route_baseline_authenticated_raw.json`
- `docs/qa/artifacts/2026-04-08/dashboard_render_perf_report_prod_baseline.md`

## Baseline (Current Reliable)
Scope: guest flow, production

### `/dashboard`
- Desktop `data_ready_ms` p50: 6401ms
- Mobile `data_ready_ms` p50: 6213ms
- Desktop `skeleton_visible_ms` p50: 134ms
- Mobile `skeleton_visible_ms` p50: 86ms
- Desktop `stable_ui_ms` p50: 6959ms
- Mobile `stable_ui_ms` p50: 6779ms
- Desktop `skeleton_to_data_ms` p50: 5994ms
- Mobile `skeleton_to_data_ms` p50: 6113ms
- Desktop `api_count_5s` p50: 1
- Mobile `api_count_5s` p50: 1
- API only `/api/v1/dashboard/` p50: 5130ms (direct request baseline)

### `/log`
- Desktop `data_ready_ms` p50: 5108ms
- Mobile `data_ready_ms` p50: 5103ms
- Desktop `stable_ui_ms` p50: 5108ms
- Mobile `stable_ui_ms` p50: 5103ms
- Desktop `api_count_5s` p50: 0
- Mobile `api_count_5s` p50: 0

### `/coach`
- Desktop `data_ready_ms` p50: 149ms
- Mobile `data_ready_ms` p50: 177ms
- Desktop `stable_ui_ms` p50: 149ms
- Mobile `stable_ui_ms` p50: 177ms
- Desktop `api_count_5s` p50: 0
- Mobile `api_count_5s` p50: 0

### `/settings`
- Desktop `data_ready_ms` p50: 144ms
- Mobile `data_ready_ms` p50: 179ms
- Desktop `stable_ui_ms` p50: 144ms
- Mobile `stable_ui_ms` p50: 179ms
- Desktop `api_count_5s` p50: 0
- Mobile `api_count_5s` p50: 0

### `/dog/profile`
- Desktop `data_ready_ms` p50: 5142ms
- Mobile `data_ready_ms` p50: 5104ms
- Desktop `stable_ui_ms` p50: 5142ms
- Mobile `stable_ui_ms` p50: 5104ms
- Desktop `api_count_5s` p50: 0
- Mobile `api_count_5s` p50: 0

Scope: authenticated flow, production frontend (`https://www.mungai.co.kr`, session-injected test user)

### `/dashboard`
- `data_ready_ms` p50: 6862ms
- `skeleton_visible_ms` p50: 277ms
- `stable_ui_ms` p50: 6862ms
- `api_count_5s` p50: 2

### `/log`
- `data_ready_ms` p50: 5107ms
- `stable_ui_ms` p50: 5477ms
- `api_count_5s` p50: 1

### `/coach`
- `data_ready_ms` p50: 157ms
- `stable_ui_ms` p50: 157ms
- `api_count_5s` p50: 1

### `/settings`
- `data_ready_ms` p50: 174ms
- `stable_ui_ms` p50: 174ms
- `api_count_5s` p50: 1

### `/dog/profile`
- `data_ready_ms` p50: 13184ms
- `skeleton_visible_ms` p50: 371ms
- `stable_ui_ms` p50: 13758ms
- `api_count_5s` p50: 1

Scope: authenticated flow, production frontend (`https://www.mungai.co.kr`, real OAuth sign-in, runs=1, user=`gmdqn2tp@gmail.com`)

### `/dashboard`
- `data_ready_ms` p50: 8627ms
- `skeleton_visible_ms` p50: 54ms
- `stable_ui_ms` p50: 9194ms
- `api_count_5s` p50: 2

### `/log`
- `data_ready_ms` p50: 5100ms
- `stable_ui_ms` p50: 5100ms
- `api_count_5s` p50: 1

### `/coach`
- `data_ready_ms` p50: 87ms
- `stable_ui_ms` p50: 87ms
- `api_count_5s` p50: 1

### `/settings`
- `data_ready_ms` p50: 219ms
- `stable_ui_ms` p50: 219ms
- `api_count_5s` p50: 1

### `/dog/profile`
- `data_ready_ms` p50: 9121ms
- `skeleton_visible_ms` p50: 123ms
- `stable_ui_ms` p50: 9699ms
- `api_count_5s` p50: 1

### OAuth vs Session-Injected Delta (`data_ready_ms`)
- `/dashboard`: `+4339ms` (OAuth slower)
- `/log`: `-7ms` (유사)
- `/coach`: `-70ms` (OAuth faster)
- `/settings`: `+68ms` (OAuth slower)
- `/dog/profile`: `-5307ms` (OAuth faster)

## Interpretation
- guest 기준 병목 우선순위는 `/dashboard`, `/log`, `/dog/profile` 순으로 유지됨.
- `/coach`, `/settings`는 guest 기준 빠르게 렌더되며 1차 최적화 우선순위는 낮음.
- authenticated 기준에서는 `/dog/profile`이 `13s+`로 가장 큰 병목이며 `/dashboard`, `/log`도 `5~7s`대.
- OAuth 실로그인 재현에서도 `/dashboard`, `/dog/profile` 병목이 유지되어 우선순위가 일관됨.
- 병목은 단일 인덱스 실패 단정보다는 API 체인 및 직렬 조회 영향이 우선 의심됨.

## Coverage Gap (Must Fill Before P1 GO)
- 없음 (P0 게이트 기준 완료).
- `db_round_trips`는 Phase 3 DoD로 이관됨.

## Gate Result (P0)
- Sub-Agent A Self Review: PASS (3회 반복 + 핵심 4지표 + OAuth 실로그인 재현 완료)
- Sub-Agent B Cross Review: PASS (증적 경로/수치/게이트 조건 수동 교차 검토)
- Doc Sync Check: PASS (playbook + status + snapshot 반영)
- Gate Decision: **GO to P1**

Reason:
Phase 0에서 요구한 baseline 계측(3회 반복 + 핵심 4지표 + OAuth 실로그인 재현)을 충족했고,
`db_round_trips`는 Phase 3 DoD로 공식 이관해 페이즈 정의와 증적이 정렬됨.

## Next Action
- Phase 1 계측 삽입(`request id`, FE mark, BE timing) 실행
- `/dashboard`, `/dog/profile` 우선으로 중복 요청/직렬 호출 분해
- Phase 3에서 `db_round_trips` 기준선 수집 및 감소 확인
