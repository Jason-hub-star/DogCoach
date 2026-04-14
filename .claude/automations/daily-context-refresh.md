# Daily Context Refresh

목표: 세션 시작 전에 `.agent/ai-context`를 실행 가능한 상태로 고정한다.

## Steps
1. `git status --short`로 현재 변경 상태 확인
2. `.agent/ai-context/00-index.md`의 읽기 순서 점검
3. `01-today-plan.md`의 `todo/doing/done` 상태 갱신
4. 전일 완료 항목을 `02-progress.md`에 반영
5. 미해결 항목을 `03-open-issues.md`로 이동
6. `05-handoff.md`의 "Next Start Order"와 "First 3 Tasks" 업데이트

## Output
- 오늘 우선순위 1~3
- 문서 드리프트 여부
- 바로 실행 가능한 검증 명령 2개
