# P0/P1 Parallel QA Runbook (TailLog)

생성일: 2026-04-08
기준 문서: `docs/qa/UX_RISK_TEST_CASE_BANK.md`

이 문서는 배포 전/후에 반드시 실행해야 하는 `P0/P1` 케이스만 병렬로 빠르게 검증하는 운영 런북이다.

## 1) 범위와 수량
- 총 범위: `45` 케이스 (`P0=5`, `P1=40`)
- Lane 분포:
  - `AUTH`: 11
  - `SURVEY`: 6
  - `DASH`: 11
  - `COACH`: 3
  - `NET`: 14

## 2) Gate 규칙
- Gate-0 (`P0`)를 먼저 통과해야 `P1` 실행으로 넘어간다.
- `P0` 하나라도 실패하면 즉시 `No-Go`로 두고 수정/재배포/재검증 루프로 이동한다.
- `P1`은 Lane 병렬 실행 후 공통 원인으로 묶어서 수정 우선순위를 정한다.

## 3) Gate-0: P0 필수 케이스
- `NET-04` user_role enum mismatch
- `NET-05` user_status enum mismatch
- `NET-08` DB schema drift
- `NET-12` deploy 직후 guest+login E2E
- `NET-16` release regression smoke

## 4) 병렬 Lane 할당 (P1)
- Lane A (`AUTH`):
  - `AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-08, AUTH-09, AUTH-10, AUTH-11, AUTH-12, AUTH-14`
- Lane B (`SURVEY`):
  - `SURVEY-01, SURVEY-02, SURVEY-05, SURVEY-06, SURVEY-10, SURVEY-12`
- Lane C (`DASH`):
  - `DASH-01, DASH-02, DASH-03, DASH-05, DASH-06, DASH-07, DASH-09, DASH-10, DASH-11, DASH-13, DASH-16`
- Lane D (`COACH`):
  - `COACH-02, COACH-06, COACH-09`
- Lane E (`NET-P1`):
  - `NET-01, NET-02, NET-03, NET-06, NET-07, NET-09, NET-13, NET-14, NET-15`

## 5) 실행 순서 (권장 60~90분)
1. Preflight (10분)
2. Gate-0 P0 실행 (15분)
3. P1 Lane A~E 병렬 실행 (30~50분)
4. Triage + 재검증 (15분)

## 6) Preflight 체크
- 프론트/백엔드 URL 확정 (`Vercel Prod`, `Railway Prod`)
- 테스트 계정 2개 이상 준비 (로그인/비로그인 분리)
- 아티팩트 폴더 생성:
  - `docs/qa/artifacts/<YYYY-MM-DD>/p0p1_parallel/`
- 헬스 확인:
  - `GET /health` (200)
  - `GET /api/v1/auth/me` (토큰 유무별 401/404 분기 확인)

## 7) 실행 명령 (운영 템플릿)
```bash
# 1) 웹 스모크 (브라우저 흐름)
bash scripts/qa/run_parallel_web_smoke.sh

# 2) API 병렬 점검
bash scripts/qa/run_parallel_api_qa.sh

# 3) 대시보드 체감 성능 (선택)
node scripts/qa/measure_dashboard_render_perf.mjs
```

## 8) 증거 수집 규칙 (필수)
실패 1건마다 아래 4가지를 반드시 남긴다.
- 스크린샷 1장
- 재현 단계(3~7줄)
- 네트워크/API 상태코드
- `request_id` + Railway 로그 타임스탬프

저장 경로 예시:
- `docs/qa/artifacts/<YYYY-MM-DD>/p0p1_parallel/<lane>/...`

## 9) 결과 기록 템플릿
```text
| case_id | pass/fail | flow(guest/login) | http_status | request_id | evidence_path | note |
|---|---|---|---|---|---|---|
| NET-04 | fail | login | 500 | 7f2... | .../net/net-04.png | enum mismatch 재발 |
```

## 10) Defect Triage 규칙
- 같은 근본원인(예: enum drift, CORS env, callback 루프)은 이슈를 하나로 묶는다.
- 브라우저에서 CORS로 보이더라도 Railway 로그가 500이면 서버 원인으로 분류한다.
- `401`(인증 필요)와 `404`(onboarding 필요)는 별도 UX 메시지로 분리해 처리한다.

## 11) 종료 기준 (Go / No-Go)
- `P0=0 fail`
- `P1=0 fail` 또는 우회 가능한 P1만 남고 운영 승인 기록이 있을 것
- 핵심 여정 100%:
  - `login -> dashboard`
  - `guest survey -> result -> dashboard`
  - `quick log create`
  - `dogs/profile` 조회/분기

## 12) 운영 팁
- 배포 직후 1회, 픽스 직후 1회, 총 2회 반복 실행한다.
- 동일 브라우저 세션에서 `survey -> result -> dashboard`를 반드시 완주한다.
- 실패 시 즉시 `/success-pattern-login-survey-stability` 체크리스트로 역추적한다.
