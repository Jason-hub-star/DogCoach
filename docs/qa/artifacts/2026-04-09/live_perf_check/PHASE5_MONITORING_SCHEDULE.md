# Phase5 Monitoring Schedule (KST)

## Goal
- Phase5 DoD(24~48시간 회귀 감시)를 날짜/시각 기준으로 고정해 실행 누락을 방지한다.

## Fixed Checkpoints
- Baseline snapshot: done (`2026-04-09 21:01 KST`, dir `phase5_monitoring/210104`)
- Short-cycle snapshots: done (`2026-04-09 21:08`, `2026-04-09 21:09 KST`)
- +24h checkpoint: pending (`2026-04-10 21:00 KST` ± 30m)
- +48h checkpoint: pending (`2026-04-11 21:00 KST` ± 30m)

## Run Command
```bash
cd /Users/family/jason/TailLogweb
scripts/qa/run_phase5_monitoring_snapshot.sh
```

## Pass Criteria
- performance warn count가 연속 스냅샷에서 `0` 유지
- security warn count는 `auth_leaked_password_protection` 1건 외 신규 경고 없음
- `dog-profiles` bucket row `1` 유지
- storage.objects 정책 row `3` 유지

## Finalize
- +48h 체크포인트 완료 후 `PHASE5_FINAL_GO_CHECK.md` 작성
- `PROJECT-STATUS`의 P3 마지막 항목을 `done (2026-04-11)`로 종료
