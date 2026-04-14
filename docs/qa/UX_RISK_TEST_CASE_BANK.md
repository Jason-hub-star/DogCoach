# TailLog 실사용 UX 리스크 테스트 케이스 뱅크

생성일: 2026-04-08

이 문서는 TailLog 실제 사용자 경험에서 깨지기 쉬운 구간을 병렬로 검증하기 위한 사례 뱅크다.  
목표는 기능 성공률만 보는 것이 아니라, 사용자가 "실패했다고 느끼는 순간"을 먼저 잡아내는 것이다.

## 운영 원칙
- 브라우저 오류가 CORS처럼 보여도 서버 500일 수 있으므로, UI 로그와 Railway 로그를 함께 본다.
- 로그인 경로와 게스트 경로를 분리해서 검증한다.
- 설문/대시보드/로그 생성은 "API 직접 호출"과 "실브라우저 E2E"를 모두 확인한다.
- 실패 시에는 `request_id`를 기준으로 서버 로그를 반드시 매칭한다.
- 같은 시나리오를 게스트, 로그인, 토큰 만료, 재접속 상태로 나눠 본다.

## 실행 메모
- 자동화 우선순위: `auto` > `hybrid` > `manual`
- 심각도 기준:
  - `P0`: 로그인 불가, 데이터 유실, 잘못된 사용자 데이터 노출
  - `P1`: 핵심 여정 불가, 결제/설문/대시보드 중단, 500 반복
  - `P2`: 우회 가능하지만 반복 불편, 오해 유발, 경계 상태 오류
  - `P3`: 경미한 문구/레이아웃/피드백 문제

## Lane A - Auth / OAuth / Session

| ID | 시나리오 | Precondition | Steps | Expected | Severity | Automation |
|---|---|---|---|---|---|---|
| AUTH-01 | 로그인 페이지 기본 진입 | 로그인 안 된 상태 | `/login` 진입 | Google/Kakao 버튼과 안내문이 보인다 | P2 | auto |
| AUTH-02 | 이미 로그인한 사용자의 /login 리다이렉트 | 유효 세션 존재 | `/login` 진입 | `/dashboard` 또는 `/survey`로 즉시 이동한다 | P1 | auto |
| AUTH-03 | 로그인 후 세션 만료 상태 재진입 | 만료된 Supabase 세션 | `/login` 진입 | 무한 로딩 없이 로그인 UI가 노출된다 | P1 | hybrid |
| AUTH-04 | `/auth/callback` 세션 누락 | callback URL 직접 진입 | 세션 없이 callback 진입 | 에러 화면 + 로그인 이동 버튼이 보인다 | P1 | auto |
| AUTH-05 | OAuth 후 `/auth/callback?returnTo=/survey` | OAuth 완료 직후 | 로그인 완료 후 callback 확인 | 설문으로 복귀한다 | P1 | auto |
| AUTH-06 | OAuth 후 `/auth/callback?returnTo=/dashboard` | OAuth 완료 직후 | 로그인 완료 후 callback 확인 | 대시보드로 복귀한다 | P1 | auto |
| AUTH-07 | OAuth 후 `/auth/callback?returnTo=/settings&link=google` | 계정 연결 플로우 | 설정에서 Google 연결 | settings에 linked 상태가 반영된다 | P2 | hybrid |
| AUTH-08 | `/auth/me` 404를 세션 없음으로 오인하지 않기 | 로그인했으나 프로필 없음 | 로그인 후 `/auth/me` 호출 | 404는 onboarding 필요로 해석된다 | P1 | auto |
| AUTH-09 | `migrate-guest` 실패가 로그인 전체를 막지 않기 | guest cookie 없음 | callback에서 migrate-guest 호출 | 마이그레이션 실패해도 라우팅은 지속된다 | P1 | auto |
| AUTH-10 | 브라우저 localStorage 세션 손상 | localStorage 오염 | 로그인 페이지 진입 | 앱이 예외 없이 복구 경로를 보여준다 | P1 | manual |
| AUTH-11 | 토큰은 유효하나 프로필이 없는 첫 로그인 | 신규 로그인 계정 | `/login` -> `/survey` | onboarding 유도 후 설문 시작 가능 | P1 | auto |
| AUTH-12 | 토큰은 유효하나 dog profile이 없는 상태 | 프로필 없음 | `/dashboard` 진입 | dashboard가 no-dog 에러로 멈추지 않는다 | P1 | auto |

## Lane B - Onboarding / Survey

| ID | 시나리오 | Precondition | Steps | Expected | Severity | Automation |
|---|---|---|---|---|---|---|
| SURVEY-01 | 게스트 설문 시작 | 비로그인 | `/survey` 진입 | 설문 1단계가 열린다 | P1 | auto |
| SURVEY-02 | 로그인 후 설문 진입 | 유효 로그인 세션 | `/survey` 진입 | 기존 프로필 있으면 dashboard, 없으면 survey | P1 | auto |
| SURVEY-03 | 이름 미입력 검증 | 1단계 | 이름 비움 후 다음 | 다음 단계로 넘어가지 않는다 | P2 | auto |
| SURVEY-04 | 견종 미입력 검증 | 1단계 | 견종 비움 후 다음 | 검증 메시지가 보인다 | P2 | auto |
| SURVEY-05 | 필수 행동문제 미선택 | 4단계 | 문제행동 선택 없이 다음 | 제출 차단 및 안내 표시 | P1 | auto |
| SURVEY-06 | 필수 트리거 미선택 | 5단계 | 트리거 선택 없이 다음 | 제출 차단 및 안내 표시 | P1 | auto |
| SURVEY-07 | 단계 이동 중 상태 유실 | 1~7단계 이동 | 뒤로가기/앞으로가기 반복 | 입력값이 유지된다 | P2 | hybrid |
| SURVEY-08 | 카카오 동기화 모달 발생 | step3 도달, 비로그인 | 모달 표시 후 계속 진행 | 로그인 유도 또는 계속 진행 둘 다 정상 | P2 | manual |
| SURVEY-09 | 카카오 모달 닫기 | step3 도달 | 모달 닫기 | 설문이 끊기지 않는다 | P2 | manual |
| SURVEY-10 | 이미지 없는 제출 | 프로필 이미지 없음 | 설문 최종 제출 | 서버가 201로 응답한다 | P1 | auto |
| SURVEY-11 | 생년월일 경계값 | 미래 날짜 또는 과거 날짜 | 날짜 입력 후 제출 | 검증 규칙에 맞게 처리된다 | P2 | auto |
| SURVEY-12 | 제출 후 result 라우팅 | 전체 필수값 입력 | 최종 제출 | `/result?newDog=true`로 이동한다 | P1 | auto |

## Lane C - Dashboard / Logging

| ID | 시나리오 | Precondition | Steps | Expected | Severity | Automation |
|---|---|---|---|---|---|---|
| DASH-01 | 로그인 직후 대시보드 실데이터 렌더 | 유효 세션 + dog profile | `/dashboard` 진입 | 스켈레톤 후 실데이터가 보인다 | P1 | auto |
| DASH-02 | 대시보드 로딩 지연 | 느린 네트워크 | 대시보드 진입 | 로딩 상태가 너무 오래 고정되지 않는다 | P1 | hybrid |
| DASH-03 | quick log 생성 | 대시보드 진입 완료 | 빠른기록 클릭 후 저장 | 저장 완료 토스트와 리스트 반영 | P1 | auto |
| DASH-04 | quick log 후 총 개수 증가 | 기존 로그 존재 | quick log 1회 추가 | 총 기록 수가 1 증가한다 | P2 | auto |
| DASH-05 | 로그 편집 저장 | 기존 로그 존재 | 로그 수정 후 저장 | 수정값이 리스트와 상세에 반영된다 | P1 | hybrid |
| DASH-06 | 로그 삭제 | 기존 로그 존재 | 삭제 후 확인 | 목록에서 제거된다 | P1 | manual |
| DASH-07 | 로그 탭 timeline | 로그 존재 | `/log` 진입 | 타임라인이 0개로 보이지 않는다 | P1 | auto |
| DASH-08 | 로그 탭 analytics | 로그 존재 | 분석 탭 전환 | 맞춤 솔루션/코칭 CTA가 정상 표시된다 | P2 | auto |
| DASH-09 | 대시보드 no-dog 상태 | 프로필 없음 | `/dashboard` 진입 | 친절한 안내 또는 onboarding 경로가 보인다 | P1 | auto |
| DASH-10 | 대시보드 API 401 처리 | 인증 없음 | `/dashboard` 호출 | 로그인 유도 또는 guest 안내로 처리된다 | P1 | auto |
| DASH-11 | `/dogs/profile` 404 처리 | 프로필 없음 | dashboard 로딩 | 크래시 없이 onboarding 안내로 처리된다 | P1 | auto |
| DASH-12 | 빠른 기록 모달 열기/닫기 | dashboard 진입 | openDetailLog 켜고 Esc | 모달이 안정적으로 닫힌다 | P2 | hybrid |

## Lane D - Coach / Settings

| ID | 시나리오 | Precondition | Steps | Expected | Severity | Automation |
|---|---|---|---|---|---|---|
| COACH-01 | 코치 탭 진입 | 로그인 + dog profile | `/coach` 진입 | 훈련 아카데미가 보인다 | P2 | auto |
| COACH-02 | 코치 추천 로딩 실패 | AI API 실패 | 추천 요청 | 실패 메시지가 무너지지 않는다 | P1 | hybrid |
| COACH-03 | 코치 CTA 클릭 | coach 화면 | mission CTA 실행 | 다음 행동으로 자연스럽게 이동한다 | P2 | manual |
| COACH-04 | settings 기본 진입 | 로그인 | `/settings` 진입 | 환경 설정/앱 정보가 보인다 | P2 | auto |
| COACH-05 | 계정 연결 상태 확인 | 여러 provider 연결 | settings 진입 | 연결/미연결 상태가 정확하다 | P2 | hybrid |
| COACH-06 | 계정 해제 | provider 연결됨 | unlink 실행 | 해제 후 상태가 반영된다 | P1 | manual |
| COACH-07 | 알림 설정 저장 | settings 진입 | 토글 변경 후 저장 | 저장 결과가 유지된다 | P2 | manual |
| COACH-08 | 구독 섹션 문구/행동 | settings 진입 | 구독 카드 확인 | 혼동 없는 상태 메시지가 나온다 | P3 | auto |
| COACH-09 | 데이터 삭제/내보내기 안내 | settings 진입 | 관련 섹션 확인 | 개인정보 액션이 이해 가능하게 표시된다 | P1 | manual |
| COACH-10 | mobile에서 settings 레이아웃 | 모바일 뷰 | settings 진입 | 카드가 깨지지 않는다 | P2 | auto |
| COACH-11 | coach -> survey 재진입 | coach 진입 상태 | survey로 이동 | 탭 간 이동에 상태 유실이 없다 | P2 | auto |
| COACH-12 | settings -> dashboard 복귀 | settings 진입 상태 | dashboard 이동 | 세션 유지와 데이터 유지가 일치한다 | P2 | auto |

## Lane E - Network / Runtime / Deploy

| ID | 시나리오 | Precondition | Steps | Expected | Severity | Automation |
|---|---|---|---|---|---|---|
| NET-01 | Railway CORS 헤더 확인 | 운영 배포 | OPTIONS preflight | `Access-Control-Allow-Origin`가 맞다 | P1 | auto |
| NET-02 | 브라우저 CORS처럼 보이지만 500인 경우 | API 실패 | 브라우저/로그 동시 확인 | 실제 원인이 서버 예외로 확인된다 | P1 | hybrid |
| NET-03 | request_id 상관관계 추적 | 서버 에러 발생 | request_id로 로그 검색 | 동일 요청이 정확히 매칭된다 | P1 | auto |
| NET-04 | `user_role` enum mismatch | role 저장 경로 변경 | survey submit | 500 없이 201이 나와야 한다 | P0 | auto |
| NET-05 | `user_status` enum mismatch | user create 경로 | 로그인 후 profile create | 500 없이 200/201 처리 | P0 | auto |
| NET-06 | deploy rootDirectory 오해 방지 | Railway 설정 | deploy 실행 | `Backend/Backend` 중첩 없이 성공한다 | P1 | manual |
| NET-07 | env 미설정 fallback | CORS env 비어 있음 | 서버 시작 | production fallback origin 사용 | P1 | auto |
| NET-08 | DB schema drift | 운영 DB 변경 | 핵심 흐름 재실행 | 컬럼/enum drift가 즉시 드러난다 | P0 | hybrid |
| NET-09 | auth/me 404와 401 분기 | 토큰 유무/프로필 유무 | 각 상태 호출 | 401과 404가 의미대로 분리된다 | P1 | auto |
| NET-10 | survey 422 validation | 필수 필드 누락 | 잘못된 payload 전송 | 422로 validation만 반환된다 | P2 | auto |
| NET-11 | log rate limit로 로그 누락 | 에러 폭주 | 반복 실패 유도 | 로그 드롭이 감지되어야 한다 | P2 | manual |
| NET-12 | production recheck after deploy | 새 배포 직후 | guest + login E2E | 둘 다 성공해야 Go 판단 가능 | P0 | hybrid |

## 추가 대량 케이스 뱅크

| ID | 시나리오 | Precondition | Steps | Expected | Severity | Automation |
|---|---|---|---|---|---|---|
| AUTH-13 | Kakao in-app browser 경고 | Kakao UA | /login 진입 | 외부 브라우저 안내가 보인다 | P2 | manual |
| AUTH-14 | Google login loop 방지 | auto=google 파라미터 | /login 반복 진입 | 무한 redirect가 없다 | P1 | auto |
| AUTH-15 | 세션 있고 `/survey` 재진입 | 유효 세션 + dog 있음 | /survey | dashboard로 자연스럽게 보낸다 | P2 | auto |
| AUTH-16 | 세션 있고 `/survey` 재진입(새 강아지 추가 의도) | 유효 세션 + enhance | /survey?enhance=true | 새 설문을 시작할 수 있다 | P2 | auto |
| SURVEY-13 | 이전 단계 값 복원 | step 4 이상 | 뒤로가기 후 다시 진입 | 이전 값이 유지된다 | P2 | hybrid |
| SURVEY-14 | step5 다중 트리거 선택 | step5 | 복수 선택 후 다음 | 다중 선택이 서버 payload에 유지된다 | P2 | auto |
| SURVEY-15 | step6 past attempts 기타 입력 | step6 | 기타 텍스트 입력 | 기타 텍스트가 손실되지 않는다 | P3 | auto |
| SURVEY-16 | sensitivity score 경계값 1 | step7 | 1 입력 | 최소값도 유효하다 | P3 | auto |
| DASH-13 | dashboard skeleton to data latency | slow network | dashboard 진입 | skeleton에서 데이터로 자연스럽게 전환 | P1 | hybrid |
| DASH-14 | dashboard refresh 후 동일 dog 유지 | 실데이터 상태 | 새로고침 | dog 정보가 유지된다 | P2 | auto |
| DASH-15 | log detail modal on mobile | mobile | 상세 기록 열기 | 스크롤/닫기 가능 | P2 | manual |
| DASH-16 | quick log repeated tap | dashboard | 버튼 연타 | 중복 저장 방지 또는 안정화 | P1 | manual |
| COACH-13 | coach challenge onboarding | coach 처음 방문 | onboarding modal 완료 | 적절한 첫 행동이 보인다 | P2 | manual |
| COACH-14 | recommendation section empty state | 추천 없음 | coach 진입 | 빈 상태가 친절해야 한다 | P2 | auto |
| COACH-15 | settings app info version 표시 | settings | 앱 정보 확인 | 버전/빌드 정보가 보인다 | P3 | auto |
| COACH-16 | privacy/terms visible | public routes | 약관/개인정보 진입 | 문서가 정상 렌더 | P3 | auto |
| NET-13 | survey submit request body map 검증 | known input set | direct API call | snake_case payload가 201 | P1 | auto |
| NET-14 | login session refresh expired | 만료 토큰 | /login 재진입 | 복구 경로 또는 재로그인 유도 | P1 | hybrid |
| NET-15 | 404 api body interpretation | profile 없음 | auth/me 호출 | profile missing로 해석 | P1 | auto |
| NET-16 | release regression smoke | new deploy | guest + login + dashboard | 핵심 여정 100% 통과 | P0 | hybrid |

## 운영 가이드
- 모든 P0/P1 실패는 `request_id`, 브라우저 콘솔, 네트워크 응답, Railway 로그를 함께 저장한다.
- 설문 제출 이슈는 반드시 `POST /api/v1/onboarding/survey`의 HTTP 상태와 서버 stack trace를 같이 본다.
- 로그인 경로 오류는 `/login`, `/auth/callback`, `/auth/me`, `/auth/migrate-guest`를 한 세트로 본다.
- 데이터는 있는데 UX가 깨지는 문제는 dashboard/log에서 먼저 찾아낸다.
- 배포 후에는 `guest`와 `logged-in` 두 경로를 모두 최소 1회씩 통과시킨다.

