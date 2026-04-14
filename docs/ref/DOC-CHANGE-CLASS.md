# TailLogweb Change Class Mapping

모든 코드 변경은 최소한 `docs/status/PROJECT-STATUS.md`를 갱신합니다.
아래 표는 change class별 필수/조건부 문서 갱신 규칙입니다.

| 변경 영역 | 필수 갱신 | 조건부 갱신 |
| --- | --- | --- |
| Any code change | `docs/status/PROJECT-STATUS.md` | — |
| Public UI (`Frontend/src/app/(public)/*`) | `docs/Plan.md` | `docs/ref/ARCHITECTURE.md` |
| Auth/session (`login`, `auth/callback`, `useAuth*`) | `docs/Plan.md`, `docs/status/DECISION-LOG.md` | `docs/ref/ARCHITECTURE.md` |
| App shell/log/dashboard (`Frontend/src/app/(app)/*`, `components/features/dashboard|log/*`) | `docs/Plan.md` | `docs/ref/ARCHITECTURE.md` |
| Coach/recommendation (`components/features/coach/*`, `Backend/app/features/coach|ai_recommendations/*`) | `docs/Plan.md`, `docs/backend.md` | `docs/ref/ARCHITECTURE.md` |
| DB/model/migration (`Backend/migrations/*`, 모델/스키마) | `docs/ref/SCHEMA.md`, `docs/backend.md` | `docs/ref/ARCHITECTURE.md` |
| Deploy/runtime (`.github/workflows/*`, env, infra 설정) | `docs/deploy.md` | `docs/status/DECISION-LOG.md` |
| Docs/ops harness (`.agent/*`, `.claude/*`, `docs/*`) | `docs/README.md`, `.agent/ai-context/00-index.md` | `.agent/ai-context/02-progress.md`, `.agent/ai-context/05-handoff.md` |
| 경계/정책 결정 | `docs/status/DECISION-LOG.md` | resolve 시 `docs/archive/decisions-resolved.md` |
