# Phase1 Instrumentation Check

Date: 2026-04-09
Scope: FE request-id trace + BE timing headers

## Code Changes
- `Frontend/src/lib/api.ts`
  - request별 `x-request-id` 자동 생성/전송
  - `window.__TL_API_TRACES__` ring buffer 기록
  - `performance.mark/measure` 기반 클라이언트 duration 측정
  - 네트워크 실패(`Failed to fetch`)도 trace로 기록
- `Backend/app/main.py`
  - 모든 HTTP 응답에 `X-Request-ID`, `X-Process-Time-MS`, `Server-Timing` 주입
  - `request.state.request_id` 유지로 예외 응답과 동일 ID 정합
  - CORS `expose_headers`에 추적 헤더 노출

## Verification

### 1) Backend Header Verification
Command:
```bash
RID=test-phase1-12345
curl -sS -D - "http://localhost:8000/health" -H "x-request-id: $RID" -o /tmp/tl_health_body2.txt
```
Observed headers:
- `x-request-id: test-phase1-12345`
- `x-process-time-ms: 1.58`
- `server-timing: app;dur=1.58`

### 2) Frontend Trace Buffer Verification
Command: Playwright open `/dashboard` and inspect `window.__TL_API_TRACES__`.
Observed:
- trace count: 2
- sample trace fields present:
  - `requestId`
  - `path`
  - `durationMs`
  - `status`
  - `serverRequestId`
  - `serverProcessTimeMs`
  - `serverTiming`
  - `networkError`

## Notes
- Local check used `http://localhost:3002` frontend and `http://localhost:8000` backend.
- Current backend CORS fallback allows `localhost:3000` by default, so `3002`에서는 네트워크 에러 trace가 기록될 수 있음.
- 프로덕션에서는 FE/BE 동일 추적 헤더 경로로 request correlation 가능.
