# Today Plan

Date: 2026-04-08

## Tasks

### WF-OPS-001
- `id`: WF-OPS-001
- `goal`: `.claude` 운영 자산(commands/hooks/automations/settings)을 코드 구조 기준으로 정착
- `files`: `.claude/*`, `.agent/rules/dogcoach.md`
- `verify`: `bash -n .claude/hooks/self-review-gate.sh`, `bash -n .claude/hooks/doc-drift-reminder.sh`
- `acceptance_criteria`: 훅/명령서/자동화 문서가 실제 프로젝트 경로와 검증 명령을 사용
- `status`: done

### WF-DOC-001
- `id`: WF-DOC-001
- `goal`: `.agent/ai-context`를 2026-04-08 기준으로 리프레시하고 읽기 순서 고정
- `files`: `.agent/ai-context/00~05`, `logs/2026-04-08-session-log.md`
- `verify`: `rg -n "Last Updated|Today Read Order|Next Start Order" .agent/ai-context -S`
- `acceptance_criteria`: 오래된 우선순위/깨진 참조를 제거하고 다음 세션 시작 지점이 명확함
- `status`: done

### WF-DOC-002
- `id`: WF-DOC-002
- `goal`: 루트 `docs/README.md` 링크 드리프트 정리 (`ServerPlan.md`, `schema.md` 등)
- `files`: `docs/README.md`
- `verify`: `ls docs/ServerPlan.md docs/schema.md` 실패 재현 후 링크 수정 검증
- `acceptance_criteria`: 존재하지 않는 링크 0개
- `status`: done

### WF-AUTH-001
- `id`: WF-AUTH-001
- `goal`: 보호 라우트 인증 가드의 실제 위치(레이아웃/미들웨어/페이지)를 문서와 일치시킴
- `files`: `Frontend/src/app/(app)/CLAUDE.md`, 필요 시 `Frontend/src/app/(app)/layout.tsx`
- `verify`: `rg -n "session|redirect|/login" Frontend/src/app/(app) -S`
- `acceptance_criteria`: 문서 설명과 코드 동작이 일치
- `status`: done

### WF-OPS-002
- `id`: WF-OPS-002
- `goal`: `.claude/settings.local.json` 권한 목록을 현 환경 기준 최소 세트로 정리하고 민감 흔적 제거
- `files`: `.claude/settings.local.json`
- `verify`: `python3 -m json.tool .claude/settings.local.json >/dev/null`, `rg -n "SUPABASE_ACCESS_TOKEN|sbp_" .claude/settings.local.json -S`
- `acceptance_criteria`: JSON 유효, 하드코딩 토큰/과거 임시 명령 미포함
- `status`: done

### WF-RULE-001
- `id`: WF-RULE-001
- `goal`: `AGENTS.md` 시작 경로 규칙을 mac/windows 호환 형태로 보강
- `files`: `AGENTS.md`
- `verify`: `rg -n "macOS|Windows|TailLogweb/CLAUDE.md" AGENTS.md -S`
- `acceptance_criteria`: 단일 규칙에서 OS별 경로가 명확히 표현됨
- `status`: done
