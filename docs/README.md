# TailLogweb Documentation Guide

TailLogweb 문서는 `vibehub-media` 문서관리 방식을 이식해 운영합니다.
핵심은 `정본 1곳(SSOT)`, `Tier 읽기 순서`, `Change Class 기반 갱신`입니다.

## 1) 문서 구조

```text
docs/
├── status/
│   ├── PROJECT-STATUS.md
│   ├── PHASED-PERF-OPT-PLAYBOOK.md
│   └── DECISION-LOG.md
├── ref/
│   ├── ARCHITECTURE.md
│   ├── SCHEMA.md
│   └── DOC-CHANGE-CLASS.md
├── archive/
│   ├── ARCHIVE-RULES.md
│   └── decisions-resolved.md
├── Plan.md
├── backend.md
├── deploy.md
└── qa/
```

## 2) Tier 읽기 순서

### Tier 1: Always (매 세션 필수)
1. `CLAUDE.md`
2. `docs/status/PROJECT-STATUS.md`
3. `docs/ref/ARCHITECTURE.md`

### Tier 2: On-Demand (작업 영역별)
- `docs/ref/SCHEMA.md`
- `docs/Plan.md`
- `docs/status/PHASED-PERF-OPT-PLAYBOOK.md`
- `docs/backend.md`
- `docs/deploy.md`
- `docs/qa/*`

### Tier 3: Reference (판단 필요 시)
- `docs/status/DECISION-LOG.md`
- `docs/archive/decisions-resolved.md`
- `docs/future_roadmap.md`

## 3) 문서 운영 규칙

- 하나의 사실은 하나의 문서에만 상세히 기록합니다.
- 어떤 코드 변경이든 `docs/status/PROJECT-STATUS.md`를 먼저 갱신합니다.
- 해결되지 않은 결정은 `docs/status/DECISION-LOG.md`에만 유지합니다.
- 해결된 결정은 `docs/archive/decisions-resolved.md`로 이동합니다.
- `done` 표기는 반드시 `done (YYYY-MM-DD)` 형식을 사용합니다.

## 4) 운영 커맨드

- 적용 동기화 가이드: `.claude/commands/doc-update.md`
- 점검 전용 가이드: `.claude/commands/doc-sync.md`
- 오래된 done 항목 점검/정리:

```bash
bash scripts/docs/prune-project-status.sh --dry-run
bash scripts/docs/prune-project-status.sh
```

- Phase5 모니터링 스냅샷:

```bash
bash scripts/qa/run_phase5_monitoring_snapshot.sh
```

## 5) Change Class 매핑

변경 영역별 필수 문서 매핑은 아래 문서를 정본으로 사용합니다.

- `docs/ref/DOC-CHANGE-CLASS.md`

## 6) 기존 도메인 문서

- 제품/기능 계획: `docs/Plan.md`
- 백엔드 구현 개요: `docs/backend.md`
- 배포/운영: `docs/deploy.md`
- QA 실행 전략: `docs/qa/README.md`
- 협업 인코딩 규칙: `docs/collaboration-encoding.md`

## 7) 주간 문서 정리 루틴

매주 1회 아래 순서로 문서 상태를 점검합니다.

1. `bash scripts/docs/prune-project-status.sh --dry-run` 실행
2. 출력 후보를 검토해 `PROJECT-STATUS`에서 오래된 `done` 항목 정리
3. 같은 변경 턴에 관련 정본 문서(`status/ref`) 동기화
4. 필요 시 `docs/archive` 이동 기준에 따라 아카이브 수행

아카이브 기준 정본:
- `docs/archive/ARCHIVE-RULES.md`
