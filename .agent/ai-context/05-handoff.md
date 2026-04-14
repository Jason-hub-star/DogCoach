# Handoff

Last Updated: 2026-04-08

## Next Start Order
1. `.agent/ai-context/00-index.md`
2. `.agent/ai-context/05-handoff.md`
3. `.agent/ai-context/01-today-plan.md`
4. `.agent/ai-context/03-open-issues.md`

## First 3 Tasks for Next Session
1. `STORAGE-CHECK-001`: `dog-profiles` 버킷/RLS 실제 적용 여부 확인 후 `docs/status/PROJECT-STATUS.md`와 `docs/ref/SCHEMA.md`에 반영
2. 임의 코드 변경 1건을 기준으로 `/doc-sync` → `/doc-update` 루틴을 실제 1회 실행해 드리프트 검증
3. 중앙가드(layout/middleware) 전환 필요성 재평가 후 필요 시 신규 decision 등록

## Verification Baseline
- `cd Frontend && npm run check:utf8`
- `cd Frontend && npm run build`
- `cd Backend && python -m compileall app`
- `cd Backend && python -m pytest tests`

## Latest Completions (2026-04-08)
- DEC-001/DEC-002 resolve 완료 및 `docs/archive/decisions-resolved.md` 이동
- `vibehub-media` 문서관리 프레임워크 이식: `docs/status`, `docs/ref`, `docs/archive` 구조 및 운영 규칙 도입
- `/doc-sync` 점검 커맨드 추가 + `/doc-update`를 apply 모드로 재정의
- 상태 자동 정리 스크립트 추가: `scripts/docs/prune-project-status.sh`
- `.claude` 운영 자산 보강: `commands/`, `automations/`, `hooks/`, `settings.json` 추가
- `.agent/rules/dogcoach.md`를 현재 프로젝트 경로/규칙 기준으로 재작성
- `.agent/ai-context` 핵심 문서(00/01/03/04/05)를 코드 현실 기준으로 리프레시
- `docs/README.md` 문서 링크 정합화: 실제 존재 문서 기준으로 교체
- `Frontend/src/app/(app)/CLAUDE.md` 설명 정합화: app layout 역할과 인증 처리 위치를 코드 기준으로 수정
- `.claude/settings.local.json` 최소 권한화 + 민감 토큰/임시 명령 흔적 제거
- `AGENTS.md` 시작 규칙 보강: macOS/Windows 경로 병기

## Risks
- Supabase Storage `dog-profiles` 버킷/RLS 적용 여부가 코드 밖 수동 상태일 수 있음
