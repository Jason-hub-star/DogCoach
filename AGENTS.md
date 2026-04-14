# DogCoach Agent Rules (MUST)

- MUST: 모든 작업 시작 전에 로컬 CLAUDE 규칙을 먼저 읽고 적용한다.
  - macOS: `/Users/family/jason/TailLogweb/CLAUDE.md`
  - Windows(기존 경로): `C:\Users\gmdqn\DogCoach\CLAUDE.md`
- MUST: 코드/파일 수정 전에 무엇을 바꾸는지 1~2문장으로 먼저 알린다.
- MUST: 작업 중간 진행상황을 주기적으로 짧게 공유한다.
- MUST: 작업 완료 시 변경 파일, 핵심 변경점, 검증 결과를 간단히 보고한다.
- MUST NOT: 사용자 요청 없이 파괴적 명령(`reset --hard`, 대량 삭제 등)을 실행하지 않는다.
