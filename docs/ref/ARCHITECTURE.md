# TailLogweb Architecture (SSOT)

이 문서는 TailLogweb 구조 설명의 정본입니다.
상세 다이어그램/세부 구현은 하위 문서로 링크합니다.

## System Overview
- Frontend: Next.js App Router (`Frontend/src/app/*`)
- Backend: FastAPI Feature-based Architecture (`Backend/app/features/*`)
- Data/Auth: Supabase PostgreSQL + Supabase Auth
- Deploy: Vercel(Frontend), Fly.io(Backend)

## Read Order (Tier 1)
1. `CLAUDE.md`
2. `docs/status/PROJECT-STATUS.md`
3. `docs/ref/ARCHITECTURE.md`

## Canonical References
- 아키텍처 다이어그램: `docs/architecture-diagrams.md`
- 백엔드 구현 상태/구성: `docs/backend.md`
- 배포 런북: `docs/deploy.md`
- DB 실스키마: `Backend/supabase_schema.sql`

## Auth Guard Policy
- 현재 정책(2026-04-08 결정): `(app)` 보호는 page-level 가드를 유지합니다.
- 중앙가드(layout/middleware) 전환은 별도 리팩토링 트랙에서 검증 후 결정합니다.
- 관련 결정 이력:
  - resolved: `docs/archive/decisions-resolved.md` (DEC-001)
  - active pending only: `docs/status/DECISION-LOG.md`

## Change Update Rule
- 서비스 경계(Frontend↔Backend↔DB) 변경 시 이 문서를 먼저 갱신합니다.
- 세부 변경 이력은 `docs/status/PROJECT-STATUS.md`에 날짜와 함께 1줄로 기록합니다.
