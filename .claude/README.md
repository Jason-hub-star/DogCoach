# TailLogweb Claude Ops Pack

이 디렉토리는 TailLogweb 작업에서 문서/코드 드리프트를 줄이기 위한 운영 자산 모음입니다.

## Session Read Order
1. `/Users/family/jason/TailLogweb/AGENTS.md`
2. `/Users/family/jason/TailLogweb/CLAUDE.md`
3. `/Users/family/jason/TailLogweb/docs/status/PROJECT-STATUS.md`
4. `/Users/family/jason/TailLogweb/docs/ref/ARCHITECTURE.md`
5. `/Users/family/jason/TailLogweb/.agent/ai-context/00-index.md`
6. `/Users/family/jason/TailLogweb/.agent/ai-context/05-handoff.md`
7. `/Users/family/jason/TailLogweb/.agent/ai-context/01-today-plan.md`

## Directory Map
- `commands/`: 세션 시작, 문서 동기화(`doc-update`), 점검(`doc-sync`), 자기 리뷰 절차, 로그인/설문 안정성(`success-pattern-login-survey-stability`), UX 위험 케이스 대량 생성(`ux-risk-case-factory`)
- `automations/`: 반복 점검용 프롬프트
- `hooks/`: 편집 후 리마인더 훅
- `settings.json`: 훅 실행 설정

## Usage Guidance
- 로그인/설문/결과/대시보드 흐름이 흔들리면 `/success-pattern-login-survey-stability`부터 실행한다.
- 실사용자 불편을 넓게 찾고 싶으면 `/ux-risk-case-factory`로 케이스를 많이 만든 뒤 서브에이전트에 분산한다.
- 두 문서는 함께 쓰면 좋다: 먼저 안정성 성공 패턴으로 원인 분리를 하고, 그 다음 UX 위험 케이스 팩토리로 주변 실패 사례를 넓게 수집한다.

## Core Loop
`컨텍스트 수집 -> 변경 분류 -> 구현 -> 검증 -> 문서 동기화 -> 핸드오프`

## Change Classes (TailLogweb)
- `public-surface`: 랜딩/로그인/설문/결과/약관/개인정보 화면
- `auth-session`: Supabase 세션, OAuth callback, guest migration
- `dashboard-log`: 대시보드/기록/빠른기록/분석 타임라인
- `coach-recommendation`: 코칭, 추천, 행동 스냅샷
- `settings-profile`: 설정/반려견 프로필/스토리지 업로드
- `backend-contract`: FastAPI 라우터/스키마/서비스 계약
- `deploy-runtime`: Fly/GitHub Actions/CORS/env
- `docs-harness`: `.agent`, `.claude`, `docs/*` 운영 문서

## Verification Baseline
- `cd Frontend && npm run check:utf8`
- `cd Frontend && npm run build`
- `cd Backend && python -m compileall app`
- `cd Backend && python -m pytest tests`
