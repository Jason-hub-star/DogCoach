# Phase3 DB/RBAC Audit (2026-04-09)

## Scope
- Landing -> App 로딩 최적화 중 Phase3(백엔드 쿼리 축소) + Phase4(DB 인덱스/RLS 정리) 선행 점검
- 대상 API: `/dashboard`, `/dogs/profile`, `/logs/{dog_id}`, `/settings`
- 대상 DB: Supabase project `kvknerzsqgmmdmyxlorl`

## A(Self) Review - 구현/점검 결과
- `dashboard` 서비스 쿼리 통합:
  - `Dog + DogEnv` 단일 조회로 통합
  - `count + max(occurred_at)` 단일 집계로 통합
  - 최근 로그 조회 1회 결과를 streak/최근목록에 재사용
- hot-path 인덱스 추가:
  - `dogs(user_id, created_at DESC)`
  - `dogs(anonymous_sid, created_at DESC)`
  - `training_behavior_snapshots(user_id, dog_id, curriculum_id, snapshot_date DESC)`
- 변경 파일:
  - `Backend/app/features/dashboard/service.py`
  - `Backend/app/shared/models.py`
  - `Backend/supabase_schema.sql`
  - `Backend/scripts/patch_2026_04_09_phase3_hotpath_indexes.sql`
- 로컬 검증:
  - `python3 -m py_compile Backend/app/features/dashboard/service.py Backend/app/shared/models.py Backend/app/main.py` 통과
  - `code-review-graph update` 후 상태 갱신 확인

## B(Cross) Review - 교차 점검 요약
- 서브에이전트 교차분석 결과:
  - `/dashboard`와 `PUT /dogs/profile`가 DB round trip 최다 구간
  - `/settings`는 JIT create 패턴으로 cold-path 쓰기 발생
  - `/logs/{dog_id}`는 ownership 검증 + 목록 조회 직렬 2회
- RLS/Storage 점검 결과:
  - 로컬 `Backend/supabase_schema.sql` 대비 실제 운영 정책은 더 확장되어 있음(실DB 정책 일부 조회 성공으로 확인)
  - Storage(`dog-profiles`) 정책은 별도 SQL로 분리되어 drift 위험 존재

## Supabase CLI 실측 상태
- 확인 완료:
  - `supabase projects list --output json` 성공 (project linked)
  - `supabase db query --linked ... pg_policies ...` 1회 성공 (운영 정책 일부 추출)
  - advisors 재시도 아티팩트:
    - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_ADVISORS_RETRY.md`
  - `supabase db advisors --linked --type performance --level warn` 성공
    - 경고 분포: `auth_rls_initplan(55)`, `multiple_permissive_policies(111)`, `duplicate_index(1)`
  - `supabase db advisors --linked --type security --level warn` 성공
    - 경고: `function_search_path_mutable`, `auth_leaked_password_protection`
  - `SUPABASE_DB_PASSWORD` 지정 후:
    - `supabase inspect db index-stats --linked` 성공
    - `supabase inspect db table-stats --linked` 성공
    - `supabase inspect db long-running-queries --linked` 성공(장기 실행 쿼리 없음)
  - `role-stats`는 CLI 스캔 오류로 실패했으나, `pg_roles` 직접 조회로 `rolbypassrls` 증적 확보
- 차단 이슈:
  - `supabase inspect db role-stats --linked` 명령은 `can't scan null into *string` 오류
- 해석:
  - Phase4 최종 게이트에는 RLS 정책 개선안 + EXPLAIN 증적 + 후속 재검증이 추가로 필요

## 공식문서/오픈소스 근거 반영
- Supabase RLS 성능 가이드:
  - 정책 컬럼 인덱싱, 애플리케이션 쿼리 필터 병행, `TO authenticated` 명시 권장
  - [RLS Performance and Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- Supabase RLS 보안 가이드:
  - service key 브라우저 노출 금지, bypass RLS 주의
  - [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Supabase DB 점검 명령:
  - `inspect db index-usage / seq-scans / long-running-queries` 기반 운영 관측
  - [Debugging and monitoring (inspect)](https://supabase.com/docs/guides/database/inspect)
- 레퍼런스 오픈소스:
  - [CodeGraphContext](https://github.com/CodeGraphContext/CodeGraphContext): 코드 그래프 기반 컨텍스트 축소/탐색
  - [code-review-graph](https://github.com/tirth8205/code-review-graph): 변경 영향 범위 추적으로 리뷰/최적화 범위 고정

## Gate 판정
- Phase3(백엔드 쿼리 축소) 1차 구현: `GO` (코드 반영 + 로컬 검증 완료)
- Phase4(DB 인덱스/RLS 정리) 본 검증: `NO-GO` (실측 수집은 대부분 완료, 정책 개선/EXPLAIN 미완료)

## Next
1. Supabase circuit breaker 해소 후 아래 실행:
   - `supabase db advisors --linked --type performance --level info --output json`
   - `supabase db advisors --linked --type security --level info --output json`
   - `supabase inspect db index-usage --linked`
   - `supabase inspect db seq-scans --linked`
2. 운영 DB `EXPLAIN (ANALYZE, BUFFERS)`로 `/dashboard` hot query 인덱스 hit 확인
3. RLS 정책을 실제 접근 패턴에 맞게 테이블별로 정리하고 문서 SSOT 동기화

## Follow-up
- 후속 적용/재측정:
  - `docs/qa/artifacts/2026-04-09/live_perf_check/PHASE4_RLS_PATCH_APPLY.md`
