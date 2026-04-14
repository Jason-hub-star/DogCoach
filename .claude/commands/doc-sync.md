# /doc-sync — TailLogweb 문서 점검 (Check-Only)

문서를 수정하지 않고 누락 여부만 점검합니다.

## 1) 변경 파일 수집
```bash
git diff --name-only HEAD
git diff --name-only --cached
git status --porcelain
```

## 2) change class 분류
- 기준 문서: `docs/ref/DOC-CHANGE-CLASS.md`

## 3) 필수 문서 체크
- 변경 class별 필수 문서가 최신인지 확인
- done 날짜 포맷(`done (YYYY-MM-DD)`) 위반 여부 확인
- pending 결정이 archive에 중복 기록됐는지 확인

## 4) 판정 출력
```text
## Doc Sync Report
- changed files:
- change classes:
- required docs:
- missing updates:
- verdict: ✅ all docs updated | ⚠️ N doc(s) need update
```
