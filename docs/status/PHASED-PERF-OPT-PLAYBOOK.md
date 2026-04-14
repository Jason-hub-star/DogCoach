# Landing→App Loading Optimization Playbook

랜딩에서 앱으로 진입할 때 `skeleton -> data ready -> stable UI`까지 걸리는 시간을 줄이기 위한 실행 정본입니다.
이 문서는 구현 전 문서화, 페이즈별 자기리뷰, 문서 정합성 점검, 다음 페이즈 진입 게이트를 모두 포함합니다.

## 1) 운영 원칙

- 측정 없는 최적화는 하지 않습니다.
- 각 페이즈는 독립적으로 완료, 검증, 문서화되어야 합니다.
- 다음 페이즈는 이전 페이즈의 DoD, 자기리뷰, 문서 동기화가 모두 통과된 뒤에만 시작합니다.
- 사실의 정본은 한 곳에만 둡니다. 자세한 변경 내용은 `docs/status/PROJECT-STATUS.md`와 이 플레이북에만 기록합니다.
- 코드 변경이 생기면 관련 문서 업데이트는 `docs/ref/DOC-CHANGE-CLASS.md` 기준으로 같이 처리합니다.

### 1-1) 서브에이전트 운영 모델

- Sub-Agent A (Implement): 해당 페이즈 구현 범위와 검증 항목을 작성하고 구현을 수행합니다.
- Sub-Agent B (Review): A의 결과를 회귀/성능/RBAC 관점에서 반례 중심으로 재검토합니다.
- Lead Agent (Gate): A/B 결과와 문서 동기화 결과를 종합해 GO/NO-GO를 결정합니다.
- 다음 페이즈 진입 전 `A 자기리뷰 PASS + B 교차리뷰 PASS + 문서 정합성 PASS`가 모두 필요합니다.

## 2) 범위

- Public 진입: `Frontend/src/app/(public)/page.tsx`, `Frontend/src/components/features/landing/HeroSection.tsx`
- App shell 진입: `Frontend/src/app/(app)/layout.tsx`, `Frontend/src/components/shared/layout/Header.tsx`, `Frontend/src/components/shared/layout/Sidebar.tsx`
- 핵심 앱 페이지: `dashboard`, `log`, `coach`, `settings`, `dog/profile`
- 공통 훅: `useAuth`, `useDashboardData`, `useDogProfile`, `useUserProfile`, `useUserSettings`
- 백엔드 주요 경로: `GET /api/v1/dashboard`, `GET /api/v1/dogs/profile`, `GET /api/v1/logs/{dog_id}`, `GET /api/v1/settings`
- DB/RBAC: Supabase 인덱스, RLS 정책, 실행계획, advisor 경고

## 3) 측정 지표

| 지표 | 의미 | 판단 기준 |
| --- | --- | --- |
| `skeleton_visible_ms` | 진입 후 스켈레톤이 처음 보이기까지 시간 | 짧을수록 좋음 |
| `data_ready_ms` | 핵심 데이터가 준비되어 화면이 채워지기까지 시간 | 짧을수록 좋음 |
| `stable_ui_ms` | 로딩 상태가 끝나고 실제 사용 가능한 화면이 보이기까지 시간 | 짧을수록 좋음 |
| `api_count_5s` | 진입 후 5초 동안 발생한 API 호출 수 | 중복 호출 제거용 |
| `db_round_trips` | 한 화면을 그리는 데 필요한 DB 왕복 횟수 | 최소화 필요 |

권장 기준:
- 스켈레톤은 즉시 보여야 합니다.
- 핵심 페이지는 첫 화면에서 1회 이상 불필요한 재요청이 없어야 합니다.
- `dashboard`와 `dog/profile`은 가장 먼저 최적화합니다.

## 4) Phase Definitions

### Phase 0. Baseline 고정

목표:
- 현재 느린 지점을 수치로 고정합니다.

DoD:
- 각 대상 페이지의 `skeleton_visible_ms`, `data_ready_ms`, `stable_ui_ms` 기준선이 기록됨
- 현재 API 호출 수가 기록됨
- 다음 페이즈에서 비교할 기준 스냅샷이 남아 있음
- `db_round_trips`는 Phase 3에서 백엔드 쿼리 축소 작업과 함께 수집/비교함

### Phase 1. 계측 삽입

목표:
- FE, BE, DB 경계를 나눠서 느린 구간을 식별합니다.

DoD:
- FE에 `performance.mark` 또는 동등한 계측이 들어감
- BE 응답에 timing 정보가 남음
- 요청 식별자(`request id`)로 FE/BE 로그를 연결할 수 있음
- 계측 결과를 문서에 남김

### Phase 2. 프론트 중복 제거

목표:
- 진입 직후 불필요한 인증/프로필/대시보드 중복 요청을 줄입니다.

DoD:
- `useAuth` 중복 초기화 경로가 정리됨
- 랜딩, 헤더, 사이드바의 프로필 요청이 중복되지 않음
- 페이지 전환 전 프리패치 또는 캐시 재사용이 적용됨
- route-level loading fallback이 일관되게 동작함

### Phase 3. 백엔드 쿼리 축소

목표:
- 화면 한 번 그리기 위한 DB/HTTP 왕복 횟수를 줄입니다.

DoD:
- `dashboard`, `dogs/profile`, `logs`, `settings` API의 직렬 쿼리가 줄어듦
- 느린 경로는 병렬화 또는 결과 재사용으로 개선됨
- 동일 목적의 조회가 반복되지 않음
- route별 `db_round_trips` 기준선 대비 감소가 확인됨
- 주요 API의 체감 지연이 줄었다는 증적이 있음

### Phase 4. DB 인덱스 및 RLS 정리

목표:
- DB가 커져도 같은 패턴이 느려지지 않도록 고정합니다.

DoD:
- 필요한 인덱스가 추가됨
- `EXPLAIN (ANALYZE, BUFFERS)`에서 hot path가 인덱스를 타는 것이 확인됨
- Supabase advisor의 핵심 성능 경고가 감소함
- RLS 정책이 역할별로 명확하고 중복 평가 비용이 줄어듦

### Phase 5. 롤아웃 및 회귀 방지

목표:
- 최적화가 실제 사용자 경험 개선으로 이어지는지 검증합니다.

DoD:
- 변경 사항이 feature flag 또는 단계적 롤아웃으로 적용됨
- 24~48시간 동안 핵심 지표가 회귀하지 않음
- guest/auth 사용자 흐름이 모두 정상
- 관련 문서가 모두 최신 상태로 맞춰짐

## 5) 자기리뷰 체크리스트

다음 항목은 페이즈 종료 전 반드시 확인합니다.

- 변경 범위가 이번 페이즈 문서와 일치한다.
- 사용자 눈에 보이는 로딩 상태가 깨지지 않는다.
- skeleton이 먼저 보이고, 실제 데이터가 나중에 채워진다.
- 중복 API 호출이 줄었는지 확인했다.
- 페이지 이동 후 깜빡임이나 비어 보이는 상태가 없다.
- DB 변경이 있으면 `EXPLAIN` 결과를 확인했다.
- RLS 변경이 있으면 guest/auth/service_role 흐름을 모두 점검했다.
- 실패한 케이스를 문서에 남겼다.
- 다음 페이즈로 넘어가기 전에 남은 TODO가 없다.

## 6) 교차리뷰 체크리스트 (Sub-Agent B)

- 목표 대비 실제 변경 범위가 과도하지 않은지 점검했다.
- 느린 네트워크, 게스트, 로그인, 에러 응답에서 로딩 플로우가 깨지지 않는지 점검했다.
- 중복 API 호출 감소가 수치로 확인되는지 점검했다.
- RBAC/RLS 변경 시 권한 상승/우회 가능성이 없는지 점검했다.
- 롤백 절차가 즉시 실행 가능하도록 명시되어 있는지 점검했다.

## 7) 문서 동기화 체크리스트

기본 원칙:
- 코드나 운영 방식이 바뀌면 문서도 같은 턴에 같이 바꿉니다.
- 다음 문서들은 필요한 경우 함께 갱신합니다.

반드시 확인할 문서:
- 항상: `docs/status/PROJECT-STATUS.md`
- 실행 계획 변경: `docs/Plan.md`
- auth/session 또는 의사결정 변경: `docs/status/DECISION-LOG.md`
- 스키마/인덱스/RLS 변경: `docs/ref/SCHEMA.md`, `docs/backend.md`
- 배포/환경변수 변경: `docs/deploy.md`
- 문서 구조나 읽기 순서 변경: `docs/README.md`

정합성 체크:
- 같은 사실을 서로 다른 문서에 중복 상세 기록하지 않는다.
- 상태 문서는 현재 상황만, 플레이북은 실행 절차만 기록한다.
- 해결된 항목은 `done (YYYY-MM-DD)` 형식으로만 남긴다.

## 8) 다음 페이즈 진입 게이트

다음 페이즈로 이동하려면 아래 조건이 모두 참이어야 합니다.

1. 현재 페이즈 DoD가 모두 충족되었다.
2. 자기리뷰 체크리스트가 모두 통과되었다. (Sub-Agent A PASS)
3. 교차리뷰 체크리스트가 모두 통과되었다. (Sub-Agent B PASS)
4. 문서 동기화 체크리스트가 모두 반영되었다. (Doc Sync PASS)
5. 관련 증적이 남아 있다.
6. 사용자 흐름에 대한 회귀가 없다.

하나라도 실패하면:
- 코드를 더 진행하지 않습니다.
- 실패 원인을 문서에 반영합니다.
- 같은 페이즈를 다시 검토합니다.

## 9) 진행 로그 템플릿

| 날짜 | 페이즈 | 목표 | 수행 내용 | A 자기리뷰 | B 교차리뷰 | 문서 동기화 | Gate | 증적 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-04-09 | Phase 0 | dashboard baseline 고정 | live perf 증적 기반 기준선 스냅샷 작성 | PASS | PASS(수동 교차검토) | PASS | NO-GO | `docs/qa/artifacts/2026-04-09/P0_LOADING_BASELINE_SNAPSHOT.md` |
| 2026-04-09 | Phase 0 | guest 5개 라우트 baseline 확장 | `/dashboard,/log,/coach,/settings,/dog/profile` guest 기준선 추가 측정 및 스냅샷 갱신 | PASS | PASS(수동 교차검토) | PASS | NO-GO | `docs/qa/artifacts/2026-04-09/live_perf_check/app_route_baseline_report.md` |
| 2026-04-09 | Phase 0 | authenticated 5개 라우트 baseline 확보 | Supabase 테스트 사용자 세션 주입 방식으로 authenticated `/dashboard,/log,/coach,/settings,/dog/profile` 측정 | PASS | PASS(수동 교차검토) | PASS | NO-GO | `docs/qa/artifacts/2026-04-09/live_perf_check/app_route_baseline_authenticated_report.md` |
| 2026-04-09 | Phase 0 | 3회 반복 + 핵심 4지표 확장 | guest/auth 모두 `runs=3` 재측정, `skeleton_visible_ms`/`stable_ui_ms`/`api_count_5s` 포함 보고서 갱신 | PASS | PASS(수동 교차검토) | PASS | NO-GO | `docs/qa/artifacts/2026-04-09/live_perf_check/app_route_baseline_report.md` |
| 2026-04-09 | Phase 0 | OAuth 실로그인 재현 + DoD 정렬 | 프로덕션 OAuth 실로그인 1회 재현 측정 완료, `db_round_trips`를 Phase 3 DoD로 이관 | PASS | PASS(수동 교차검토) | PASS | GO | `docs/qa/artifacts/2026-04-09/live_perf_check/oauth_real_login_check/app_route_baseline_authenticated_report.md` |
| 2026-04-09 | Phase 1 | FE/BE 계측 삽입 | FE `x-request-id` 전파 + trace buffer + BE `X-Process-Time-MS`/`Server-Timing` 노출 및 최소 검증 | PASS | PASS(수동 교차검토) | PASS | GO | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE1_INSTRUMENTATION_CHECK.md` |
| 2026-04-09 | Phase 2 | auth-bootstrap 중복 요청 억제 | `useDashboardData` enable 조건 강화로 인증 초기화 전 선행 요청 차단 코드 반영 | PASS | PASS(수동 교차검토) | PASS | NO-GO(배포검증 대기) | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE2_DEDUPE_CHECK.md` |
| 2026-04-09 | Phase 2 | OAuth 실측 재검증 | 프로덕션 OAuth 재측정 1회 실행, `/dashboard` `api_count_5s=2` 및 `401->200` 재확인 | PASS | PASS(수동 교차검토) | PASS | NO-GO(중복 제거 미달성) | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE2_POSTCHECK_OAUTH.md` |
| 2026-04-09 | Phase 2 | auth-restore race guard 패치 | `useAuth` stored-session hint + 라우트 enable 가드 적용, 로컬 build 통과(단 프로덕션 재측정은 배포 전이라 변화 없음) | PASS | PASS(수동 교차검토) | PASS | NO-GO(배포검증 대기) | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE2_AUTH_RACE_GUARD_PATCH.md` |
| 2026-04-09 | Phase 2 | 배포 후 OAuth 재검증 | Vercel production 배포 후 OAuth 실측에서 `/dashboard` `api_count_5s=1`, status `[200]` 확인 | PASS | PASS(수동 교차검토) | PASS | GO | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE2_POSTDEPLOY_GO_CHECK.md` |
| 2026-04-09 | Phase 3 | 백엔드 쿼리 축소 1차 | `/dashboard`의 Dog+Env/통계/최근로그 쿼리 통합으로 round trip 축소 코드 반영 | PASS | PASS(서브에이전트 교차검토) | PASS | GO | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE3_DB_RBAC_AUDIT.md` |
| 2026-04-09 | Phase 4 | 인덱스/RLS 운영 검증 착수 | hot-path 인덱스 패치 생성 + performance advisors 1회 수집 성공, security advisors/inspect는 circuit breaker로 재수집 필요 | PASS(부분) | PASS(서브에이전트 교차검토) | PASS | NO-GO(실측 재수집 대기) | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE3_DB_RBAC_AUDIT.md` |
| 2026-04-09 | Phase 4 | advisors/inspect 재시도 | performance+security advisors 수집 성공, `SUPABASE_DB_PASSWORD` 지정 후 `inspect index/table/long-running` 수집 성공, `role-stats`는 CLI 오류로 `pg_roles` 대체 점검 | PASS(부분) | PASS(수동 교차검토) | PASS | NO-GO(정책개선/EXPLAIN 대기) | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_ADVISORS_RETRY.md` |
| 2026-04-09 | Phase 4 | RLS 성능 패치 적용 + 재측정 | 프로덕션 RLS 정책 스코프 조정/함수 search_path 수정 적용, advisors WARN `167→34`, EXPLAIN에서 hot-path index scan 확인 | PASS | PASS(수동 교차검토) | PASS | NO-GO(잔여 initplan 정리 대기) | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_RLS_PATCH_APPLY.md` |
| 2026-04-09 | Phase 4 | initplan cleanup 2차 + 교차리뷰 반영 | 잔여 direct `auth.uid()/auth.role()` 정리용 SQL 보강(혼합식 정책 누락 방지/idempotency 보강), sub-agent 교차리뷰 반영 완료. 단 Supabase circuit breaker로 apply/성능 advisors 재실측은 지연 | PASS(부분) | PASS(서브에이전트 교차검토) | PASS | NO-GO(실측 재수집 차단) | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_INITPLAN_CLEANUP_RETRY.md` |
| 2026-04-09 | Phase 4 | circuit breaker 해소 후 최종 재실측 | `SUPABASE_DB_PASSWORD` 명시로 재연결, initplan cleanup 재적용/정규화 후 performance advisors WARN `0` 확인, storage `dog-profiles` live 증적까지 완료 | PASS | PASS(이전 교차리뷰 반영 상태 재확인) | PASS | GO | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_FINAL_GO_CHECK.md` |
| 2026-04-09 | Phase 5 | 회귀 모니터링 착수 | Phase5 snapshot 러너 추가 후 1차 스냅샷 수집(성능 WARN 0/보안 WARN 1/storage 정상), 24~48시간 누적 감시 시작 | PASS | PASS(기존 교차리뷰 기준 유지) | PASS | IN PROGRESS | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE5_MONITORING_KICKOFF.md` |
| 2026-04-09 | Phase 5 | 단기 3회 누적 확인 | `210104/210850/210900` 3회 스냅샷에서 성능 WARN 0, 보안 WARN 1, storage 상태 동일 유지 확인 | PASS | PASS(기존 교차리뷰 기준 유지) | PASS | IN PROGRESS(24~48h 창 대기) | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE5_MONITORING_PROGRESS_3X.md` |
| 2026-04-09 | Phase 5 | 24h/48h 체크포인트 일정 고정 | `2026-04-10 21:00 KST`(+24h), `2026-04-11 21:00 KST`(+48h) 실행 계획 및 종료 조건 문서화 | PASS | PASS(기존 교차리뷰 기준 유지) | PASS | IN PROGRESS(체크포인트 실행 대기) | `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE5_MONITORING_SCHEDULE.md` |
| YYYY-MM-DD | Phase N |  |  | PASS / FAIL | PASS / FAIL | PASS / FAIL | GO / NO-GO | 링크/경로 |

## 10) 실행 순서

1. Phase 0 기준선을 기록한다.
2. 계측을 넣고 결과를 확인한다.
3. 중복 호출을 제거한다.
4. 백엔드 쿼리를 줄인다.
5. DB 인덱스와 RLS를 정리한다.
6. 롤아웃 후 회귀를 감시한다.
7. 각 단계 종료마다 이 문서를 갱신한다.
