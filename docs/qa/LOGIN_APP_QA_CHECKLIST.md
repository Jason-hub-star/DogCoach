# Login + App QA Checklist

## Lane A: Auth/OAuth
- `A-01` 로그인 페이지 로드
  - Step: `/login` 진입
  - Expect: Google/Kakao 로그인 버튼 표시
- `A-02` 이미 로그인 사용자 리다이렉트
  - Step: 로그인 세션 상태로 `/login` 진입
  - Expect: `latest_dog_id` 있으면 `/dashboard`, 없으면 `/survey`
- `A-03` 콜백 세션 검증 실패 처리
  - Step: 세션 없이 `/auth/callback` 진입
  - Expect: 에러 화면 + 다시 시도/로그인 이동 버튼 노출
- `A-04` 게스트 마이그레이션 비차단
  - Step: 콜백에서 `/auth/migrate-guest` 실패 유도
  - Expect: 경고 로그 후 라우팅은 계속 진행

## Lane B: Guest Onboarding
- `B-01` 게스트 설문 진입
  - Step: 비로그인으로 `/survey` 진입
  - Expect: 설문 진행 가능, 차단 없음
- `B-02` 필수값 검증
  - Step: Step1 이름/견종 미입력, Step4 문제행동 미선택, Step5 트리거 미선택
  - Expect: 다음 단계/제출 차단, 검증 안내 노출
- `B-03` 설문 제출 후 결과
  - Step: 필수값 입력 후 최종 제출
  - Expect: `/result?newDog=true...` 이동
- `B-04` 게스트 대시보드 진입
  - Step: 제출 후 `/dashboard` 접근
  - Expect: 개 프로필이 있으면 대시보드, 없으면 핵심 데이터 배너/안내

## Lane C: Logged-in Core App
- `C-01` 대시보드 조회
  - Step: 로그인 후 `/dashboard` 진입
  - Expect: 스켈레톤 후 데이터 렌더
- `C-02` 로그 생성
  - Step: `openDetailLog=1` 또는 생성 버튼으로 다이얼로그 열기 후 저장
  - Expect: 생성 성공 + 목록 반영
- `C-03` 로그 수정
  - Step: 기존 로그 수정 후 저장
  - Expect: 수정 내용 반영
- `C-04` 로그 삭제
  - Step: 삭제 실행
  - Expect: 목록에서 제거
- `C-05` 코치 기능 호출
  - Step: `/coach`에서 추천/생성 요청
  - Expect: 성공 응답 또는 정책성 실패 메시지 일관성 유지
- `C-06` 설정 페이지 계정 액션
  - Step: `/settings` 진입 및 계정 관련 액션
  - Expect: 정상 동작 또는 미구현 안내 일관성

## Lane D: Observability
- `D-01` 헬스체크
  - Step: `/health` 호출
  - Expect: 200 + `{\"status\":\"ok\"}`
- `D-02` 인증 없는 API 응답코드
  - Step: `/api/v1/auth/me` 토큰 없이 호출
  - Expect: 401
- `D-03` 게스트 대시보드 API
  - Step: `/api/v1/dashboard/` 쿠키/토큰 없이 호출
  - Expect: 401
- `D-04` 서버 로그 상관관계
  - Step: 실패 케이스 시간대에 Railway 로그 조회
  - Expect: 요청/오류 로그 매칭 가능

