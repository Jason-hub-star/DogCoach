# Weekly Workflow Audit

목표: `.claude`와 `.agent` 운영 체계가 실제 코드 구조와 어긋나지 않는지 점검한다.

## Checklist
1. `.claude/settings.json` 훅 경로 유효성 확인
2. `.claude/commands/*.md`의 검증 명령이 실제 프로젝트 명령과 일치하는지 확인
3. `.agent/ai-context/04-rules.md`의 라우트/엔드포인트 규칙이 실제 코드와 일치하는지 확인
4. `.agent/rules/dogcoach.md`의 경로/호칭/금지 규칙 확인
5. `docs/README.md`의 깨진 링크 여부 확인

## Output
- 유지할 규칙
- 제거할 규칙
- 추가할 규칙
- 다음 주 우선 보강 항목
