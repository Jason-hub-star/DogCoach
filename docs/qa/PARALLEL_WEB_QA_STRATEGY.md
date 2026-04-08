# Parallel Web QA Strategy (TailLog)

이 문서는 TailLog 웹사이트 방문 후 로그인/앱 기능 QA를 병렬로 수행하기 위한 실행 전략이다.
현재 코드 기준 라우트(`/login`, `/auth/callback`, `/survey`, `/dashboard`)와 API(`/api/v1/*`)를 기준으로 작성했다.

## 1. 목표
- 로그인 이후 핵심 사용자 여정이 끊기지 않는지 확인한다.
- 게스트 흐름(쿠키 기반)과 로그인 흐름(토큰 기반)이 충돌 없이 동작하는지 검증한다.
- 기능 성공 여부를 UI, API, 로그 3축으로 동시에 확인한다.

## 2. 병렬 Lane 설계
- `Lane A (Auth/OAuth)`:
  - 대상: `/login`, `/auth/callback`, `/api/v1/auth/me`, `/api/v1/auth/migrate-guest`
  - 목적: 로그인/리다이렉트/세션 전환/게스트 마이그레이션 안정성 확인
- `Lane B (Guest Onboarding)`:
  - 대상: `/survey` -> `/result` -> `/dashboard` 진입
  - 목적: 비로그인 사용자로도 설문 제출과 체험 흐름이 정상인지 확인
- `Lane C (Logged-in Core App)`:
  - 대상: `/dashboard`, `/log`, `/coach`, `/settings`
  - 목적: 로그인 이후 핵심 기능(조회/생성/수정/삭제/AI 요청) 검증
- `Lane D (Observability)`:
  - 대상: Railway 로그, API 응답코드, DB 반영 상태
  - 목적: UI 통과 여부를 서버 단에서 교차검증

## 3. 실행 순서 (권장)
1. `Preflight` (5~10분)
2. `Lane A/B/C/D` 동시 실행 (30~60분)
3. `Defect triage` (15분)
4. `Fix verify` 재실행 (20~40분)

## 4. Preflight 체크리스트
- 프론트 URL, 백엔드 URL 확정
- 테스트 계정 최소 2개 준비 (Google/Kakao 혹은 동일 provider 2계정)
- 테스트 데이터 prefix 통일: `qa_<yyyymmdd>_<lane>`
- 브라우저 캐시/쿠키 클린 프로필 2개 준비
- 백엔드 `/health` 200 확인

## 5. 증거 수집 규칙
- 실패 케이스마다 반드시 저장:
  - 스크린샷 1장
  - 재현 단계(3~7줄)
  - 네트워크/API 실패 코드
  - Railway 로그 timestamp
- 권장 저장 경로:
  - `docs/qa/artifacts/<date>/<lane>/...`

## 6. 심각도 기준
- `P0`: 로그인 불가, 데이터 유실, 잘못된 사용자 데이터 노출
- `P1`: 핵심 기능 불가(로그 생성/대시보드 로딩/AI 호출)
- `P2`: 우회 가능 기능 오류, UX 깨짐
- `P3`: 경미한 UI/문구 문제

## 7. 종료 기준 (Go / No-Go)
- `P0=0`, `P1=0`
- 핵심 여정 통과율 100%:
  - 로그인 -> 대시보드
  - 게스트 설문 -> 결과 -> 대시보드
  - 로그 생성/수정/삭제
  - 코치 기능 호출
- 장애 재현 스텝/증거 누락 0건

