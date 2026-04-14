# TailLogweb Schema Reference (SSOT)

DB 구조의 정본은 SQL 스키마 파일입니다.
이 문서는 데이터 모델 변경 시 영향 범위를 빠르게 판단하기 위한 요약 레이어입니다.

## Canonical Source
- `Backend/supabase_schema.sql`

## Related Runtime Paths
- Backend 모델/리포지토리: `Backend/app/features/*`
- Frontend 타입/API 클라이언트: `Frontend/src/types/*`, `Frontend/src/lib/api/*`

## Update Policy
- 테이블/컬럼/제약조건 변경 시 다음을 동시에 갱신합니다.
  - `Backend/supabase_schema.sql`
  - 이 문서(`docs/ref/SCHEMA.md`)의 해당 섹션
  - 필요 시 `docs/ref/ARCHITECTURE.md` (경계 변화가 있을 때)
  - 상태 기록 `docs/status/PROJECT-STATUS.md`

## Current Focus Areas
- 사용자/반려견 프로필과 행동 로그 연계 무결성
- AI 추천 캐시 키 및 로그 스냅샷 데이터 흐름
- Storage(`dog-profiles`) 운영 적용 상태 추적
- 로딩 hot-path 인덱스(`dogs` latest 조회, `training_behavior_snapshots` 시계열 조회) 운영 반영 상태 추적

## Latest Index Patch
- 2026-04-09: `Backend/scripts/patch_2026_04_09_phase3_hotpath_indexes.sql`
  - `idx_dogs_user_created_desc`
  - `idx_dogs_anonymous_sid_created_desc`
  - `idx_behavior_snapshot_user_dog_curriculum_snapshot_date`

## Latest RLS/Index Cleanup
- 2026-04-09: `Backend/scripts/patch_2026_04_09_phase4_rls_perf.sql`
  - service-role 정책 스코프 명시(`TO service_role`)
  - 핵심 own-data policy `auth.uid()` -> `(select auth.uid())` 정리
  - `update_updated_at_column()`에 `search_path=public` 고정
- 2026-04-09: `Backend/scripts/patch_2026_04_09_phase4_rls_initplan_cleanup.sql`
  - 잔여 policy의 direct `auth.uid()/auth.role()` 호출을 initplan-friendly 형태로 정리하는 후속 패치
  - `ai_recommendation_snapshots`의 중복 인덱스 `idx_rec_dedupe_key` 제거
  - canonical schema(`Backend/supabase_schema.sql`)에서도 `idx_rec_dedupe_key` 정의 제거 완료

## Storage Evidence Rule
- 운영 적용 체크 상태(완료/진행/이슈)는 `docs/status/PROJECT-STATUS.md`에 기록합니다.
- 스키마/구조 기준(컬럼, 제약, 정책 참조)은 이 문서와 `Backend/supabase_schema.sql`를 정본으로 유지합니다.
- 관련 결정 이력: `docs/archive/decisions-resolved.md`의 DEC-002.
