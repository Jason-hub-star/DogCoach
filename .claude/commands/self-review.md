# /self-review — TailLogweb 자기 점검

현재 변경사항의 회귀/정합성/문서 누락을 확인한다.

## 1) 변경 규모
- `git diff --stat`
- `git diff --cached --stat`
- `git status --porcelain`

## 2) 라우트/흐름 점검
- 공개 경로: `/`, `/login`, `/survey`, `/result`, `/privacy`, `/terms`
- 인증 후 경로: `/dashboard`, `/log`, `/coach`, `/settings`, `/dog/profile`
- OAuth callback: `returnTo` 허용 경로(`survey|result|settings|dashboard`) 유지 여부

## 3) 프론트 점검
- `QUERY_KEYS` 표준 사용 여부 (`Frontend/src/lib/query-keys.ts`)
- API 호출이 `apiClient`를 통해 `/api/v1` prefix로 호출되는지
- 인코딩/줄바꿈 규칙(UTF-8 + LF) 위반 여부

## 4) 백엔드 점검
- `Router -> Service -> Repository` 경계 유지 여부
- 주요 엔드포인트 계약(auth/onboarding/dashboard/log/coach/settings/dogs) 회귀 여부
- 204 응답 처리 경로(API delete)와 클라이언트 처리 정합성

## 5) 검증 실행
- `cd Frontend && npm run check:utf8`
- `cd Frontend && npm run build`
- `cd Backend && python -m compileall app`
- `cd Backend && python -m pytest tests`

## 6) 출력 템플릿
```text
## Self-Review Report
- change classes:
- pass:
- warn:
- must fix:
- tests run / skipped:
```
