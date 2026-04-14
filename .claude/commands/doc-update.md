# /doc-update — TailLogweb 문서 동기화 (Apply Mode)

코드 변경 후 문서 드리프트를 실제로 수정하는 절차입니다.
기준 프레임워크는 `vibehub-media` 방식(SSOT + change class + status/archive split)입니다.

## 1) 변경 범위 수집
```bash
git diff --name-only HEAD
git diff --name-only --cached
git status --porcelain
```

## 2) Change Class 분류
- 매핑 표 기준: `docs/ref/DOC-CHANGE-CLASS.md`
- 어떤 변경이든 기본적으로 `docs/status/PROJECT-STATUS.md`는 갱신 대상

## 3) 영향 문서 갱신 (최소 변경 원칙)
- 동일 사실을 여러 문서에 중복 작성하지 않는다.
- 정본 문서 1곳만 상세히 적고, 나머지는 링크/요약으로 유지한다.
- 우선순위:
  1. `docs/status/PROJECT-STATUS.md`
  2. `docs/ref/*` 또는 `docs/deploy.md`/`docs/backend.md`
  3. `.agent/ai-context/*` 운영 문서

## 4) Decision Log 정리
- 미해결 결정은 `docs/status/DECISION-LOG.md`에만 둔다.
- 해결된 결정은 `docs/archive/decisions-resolved.md`로 이동한다.

## 5) Status 형식 검증
- `done` 항목은 반드시 `done (YYYY-MM-DD)` 형식 사용
- 오래된 done 항목 정리 사전 점검:
```bash
bash scripts/docs/prune-project-status.sh --dry-run
```

## 6) 결과 보고
```text
## Doc Update Report
- changed files:
- change classes:
- updated docs:
- archived decisions:
- unresolved doc drift:
```
