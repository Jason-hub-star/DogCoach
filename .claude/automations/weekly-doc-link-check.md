# Weekly Doc Link Check

목표: 문서 링크 드리프트를 조기에 감지한다.

## Steps
1. `docs/README.md`와 `.agent/ai-context/*.md`의 파일 경로 참조를 수집한다.
2. 실제 파일 존재 여부를 확인한다.
3. 깨진 링크를 `03-open-issues.md`에 등록한다.
4. 영향 문서를 우선순위 순으로 제안한다.

## Quick Commands
```bash
cd /Users/family/jason/TailLogweb
rg -n "\./docs/|docs/|\.agent/|Backend/|Frontend/" docs .agent -S
find docs .agent Backend Frontend -type f | wc -l
```
