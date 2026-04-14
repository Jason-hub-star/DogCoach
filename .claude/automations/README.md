# TailLogweb Automation Prompts

이 폴더는 반복적인 운영 점검을 자동화하기 위한 프롬프트 모음입니다.

## Recommended Prompts
- `daily-context-refresh.md`: 당일 시작 시 `.agent/ai-context` 상태 정리
- `weekly-workflow-audit.md`: `.claude`와 `.agent` 워크플로우 드리프트 점검
- `weekly-doc-link-check.md`: `docs/*.md` 링크/참조 무결성 점검

## Execution Order
1. `daily-context-refresh`
2. `weekly-doc-link-check`
3. `weekly-workflow-audit`
