# /session-start — TailLogweb 시작 루틴

작업 시작 시 아래 순서를 고정해서 읽는다.

## Read Order
1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/status/PROJECT-STATUS.md`
4. `docs/ref/ARCHITECTURE.md`
5. `.agent/ai-context/00-index.md`
6. `.agent/ai-context/05-handoff.md`
7. `.agent/ai-context/01-today-plan.md`
8. 변경 대상 폴더의 `CLAUDE.md`

## 60초 Preflight
- `git status --short`
- `find .claude -maxdepth 3 -type f | sort`
- `find .agent/ai-context -maxdepth 2 -type f | sort`
- `find docs -maxdepth 3 -type f | sort`
- 오늘 작업의 change class 1~2개 선언

## Start Output Template
```text
## Session Start
- change classes:
- target files:
- verification plan:
- docs to sync:
```
