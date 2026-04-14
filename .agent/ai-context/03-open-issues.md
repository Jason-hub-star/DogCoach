# Open Issues

Last Updated: 2026-04-08

## Medium
- 이슈: Supabase Storage `dog-profiles` 버킷과 RLS 수동 적용 상태가 코드 밖에 남아 있을 수 있음.
- 근거: `Backend/migrations/create_dog_profiles_bucket.sql`, `fix_dog_profiles_rls.sql`는 존재하지만 적용 여부가 문서에만 기록.
- 다음 액션: 실제 적용 여부 체크리스트를 운영 로그에 남기고 검증 스텝 추가.
- 소유자: Dev/Ops
