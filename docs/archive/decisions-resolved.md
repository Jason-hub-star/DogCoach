# TailLogweb Resolved Decisions

해결된 결정은 아래 형식으로 이 문서에 누적합니다.

## 2026-04
- DEC-001: 앱 인증 가드 중심축 선택
  - **Context**: `(app)` 라우트 보호 전략이 page-level 가드와 중앙가드 후보 사이에서 미확정 상태였음.
  - **Decision**: Option A (현재는 page-level 가드 유지)
  - **Rationale**: 기존 동작 안정성과 회귀 위험 최소화를 우선하고, 중앙가드(layout/middleware) 전환은 별도 리팩토링 트랙에서 검증 후 진행.
  - **Resolved Date**: 2026-04-08
- DEC-002: Storage 운영 검증의 정본 위치
  - **Context**: Supabase `dog-profiles` 버킷/RLS 적용 여부를 어디에 기록할지 불명확했음.
  - **Decision**: Option B (`docs/status/PROJECT-STATUS.md` + `docs/ref/SCHEMA.md` 분리 기록)
  - **Rationale**: 실행 상태(운영 체크)는 status, 구조/정본은 ref로 분리해 드리프트를 줄이고 추적성을 높임.
  - **Resolved Date**: 2026-04-08
