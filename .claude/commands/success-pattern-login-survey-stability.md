# /success-pattern-login-survey-stability — 로그인/설문 안정성 성공 패턴

실서비스에서 로그인, survey, result, dashboard 흐름이 엇나가지 않도록 하는 재사용 체크리스트다.

## 사용 시점
- 로그인 후 설문 제출이 실패하거나, 브라우저에서 CORS처럼 보이는 에러가 났을 때
- 게스트 흐름은 통과하는데 로그인 흐름에서만 깨질 때
- `401/404/500`이 섞여 보여서 원인이 흐릿할 때
- enum, 인증 세션, CORS, 리다이렉트, 프로필 조회가 얽힌 배포 직후 점검이 필요할 때

## 핵심 원칙
- 브라우저 에러만 보고 판단하지 않는다.
- API 직접 확인과 브라우저 E2E 확인을 분리한다.
- 게스트 흐름과 로그인 흐름을 둘 다 확인한다.
- Railway 로그는 반드시 `request_id` 기준으로 역추적한다.
- 화면의 CORS 문구가 보여도, 실제 원인은 DB enum 라벨 불일치나 서버 500일 수 있다.

## 안티 리그레션 체크리스트
- API 직접 확인: `auth/me`, `dogs/profile`, `onboarding/survey`를 브라우저 없이 먼저 확인하고, 인증 토큰 유무에 따라 응답이 어떻게 달라지는지 분리해서 본다.
- 브라우저 확인: 게스트 흐름은 `랜딩 -> survey -> result -> dashboard`, 로그인 흐름은 `로그인 완료 상태 -> survey 재진입 -> 제출 -> result -> dashboard`로 각각 본다.
- 로그 확인: Railway 로그에서 `request_id`를 찾고, 같은 `request_id`로 API 응답 코드, 예외 메시지, DB 쿼리 실패를 묶어서 본다.
- 원인 분리: `404`는 라우트/프록시/경로 문제인지, `500`은 서버 예외인지 본다. CORS처럼 보여도 실제로는 백엔드 예외 때문에 preflight/실요청이 함께 깨졌을 수 있다.
- enum 검증: DB enum label과 ORM/스키마 enum 값이 같은지 확인하고, 특히 role/status 같은 값은 대소문자나 label mismatch를 다시 본다.

## 빠른 점검 명령 예시
```bash
# 1) API 직접 확인
curl -i "$API_BASE/api/v1/auth/me"
curl -i -X POST "$API_BASE/api/v1/onboarding/survey" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @payload.json

# 2) 로그에서 request_id 추적
railway logs | rg "request_id=<REQUEST_ID>|/api/v1/onboarding/survey|/api/v1/auth/me"

# 3) 브라우저 E2E는 별도 실행
npm run e2e -- --grep "login|survey"
```

## 판정 기준
- `API direct OK`인데 `browser E2E FAIL`이면 프론트 상태/세션/리다이렉트/CORS 브랜치로 분리한다.
- `browser에서 CORS`인데 `Railway 로그 500`이면 서버 원인으로 본다.
- 게스트 PASS, 로그인 FAIL이면 세션/권한/프로필 조회 분기부터 본다.

## 보고 템플릿
```text
## Login Survey Stability Report
- flow: guest | logged-in
- api direct:
- browser e2e:
- request_id:
- railway log note:
- suspected cause:
- next fix:
```
