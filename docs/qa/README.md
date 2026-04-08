# QA Documentation Index

TailLog 웹/앱 QA 전략, 체크리스트, 실행 로그 아카이브를 한곳에서 찾기 위한 인덱스 문서다.

## Core Docs
- [Parallel Web QA Strategy](./PARALLEL_WEB_QA_STRATEGY.md)
- [Login + App QA Checklist](./LOGIN_APP_QA_CHECKLIST.md)

## Latest Run Archive
- [2026-04-08 QA Run Report](./artifacts/2026-04-08/QA_RUN_REPORT.md)

## Quick Commands
```bash
# Web smoke
scripts/qa/run_parallel_web_smoke.sh

# API parallel lanes
scripts/qa/run_parallel_api_qa.sh
```

## Notes
- 운영 장애 재현/수정 사례는 Run Report에 날짜별로 누적한다.
- 장애 수정 시 "원인 -> 수정 -> 재검증" 순서로 로그를 반드시 함께 남긴다.
