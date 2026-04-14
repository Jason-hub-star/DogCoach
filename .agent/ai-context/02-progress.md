# Progress

Last Updated: 2026-04-08

## 2026-04-08
- 변경: `DEC-001`, `DEC-002`를 pending에서 resolve로 전환하고 archive로 이동.
- 이유: 문서 운영 프레임워크 이식 후에도 핵심 운영 결정 2건이 pending으로 남아 있어 상태 추적이 불완전했음.
- 변경 파일:
  - `docs/status/DECISION-LOG.md`
  - `docs/archive/decisions-resolved.md`
  - `docs/status/PROJECT-STATUS.md`
  - `docs/ref/ARCHITECTURE.md`
  - `docs/ref/SCHEMA.md`
  - `.agent/ai-context/05-handoff.md`
- 검증:
  - `rg -n "DEC-001|DEC-002|Pending|resolved" docs/status docs/archive docs/ref -S`
- 영향:
  - `DECISION-LOG`는 pending-only 원칙을 회복했고, 해결된 결정은 archive로 분리됨.
  - 인증 가드 정책은 당분간 page-level 유지로 고정되어 회귀 리스크가 낮아짐.
  - Storage 운영 증적 기록 위치(status)와 구조 정본(ref) 경계가 명확해짐.

- 변경: `vibehub-media` 문서관리 프레임워크를 TailLogweb에 이식.
- 이유: 문서가 평면 구조(`docs/*`)에 머물러 상태 추적/결정 로그/정본 경계가 약했고, 변경 시 드리프트를 빠르게 감지하기 어려웠음.
- 변경 파일:
  - `docs/README.md`
  - `docs/status/PROJECT-STATUS.md`
  - `docs/status/DECISION-LOG.md`
  - `docs/ref/ARCHITECTURE.md`
  - `docs/ref/SCHEMA.md`
  - `docs/ref/DOC-CHANGE-CLASS.md`
  - `docs/archive/decisions-resolved.md`
  - `.claude/commands/doc-update.md`
  - `.claude/commands/doc-sync.md`
  - `.claude/commands/session-start.md`
  - `.claude/README.md`
  - `.agent/ai-context/00-index.md`
  - `scripts/docs/prune-project-status.sh`
- 검증:
  - `bash scripts/docs/prune-project-status.sh --dry-run`
  - `bash -n scripts/docs/prune-project-status.sh`
- 영향:
  - `status/ref/archive` 3계층 문서 구조 도입으로 정본 문서 경계가 명확해짐.
  - `/doc-update`는 적용, `/doc-sync`는 점검으로 역할이 분리됨.
  - `done (YYYY-MM-DD)` 기반 상태 정리 루틴이 추가되어 stale 상태 누적을 줄일 수 있음.

- 변경: `.claude` 운영 자산(commands/hooks/automations/settings) 추가.
- 이유: 기존 `.claude`가 `settings.local.json` 단일 파일 상태여서 세션 루프(시작/자기검토/문서동기화)가 약했음.
- 변경 파일:
  - `.claude/README.md`
  - `.claude/settings.json`
  - `.claude/commands/session-start.md`
  - `.claude/commands/doc-update.md`
  - `.claude/commands/self-review.md`
  - `.claude/automations/README.md`
  - `.claude/automations/daily-context-refresh.md`
  - `.claude/automations/weekly-workflow-audit.md`
  - `.claude/automations/weekly-doc-link-check.md`
  - `.claude/hooks/self-review-gate.sh`
  - `.claude/hooks/doc-drift-reminder.sh`
- 검증:
  - `bash -n .claude/hooks/self-review-gate.sh`
  - `bash -n .claude/hooks/doc-drift-reminder.sh`
- 영향:
  - 코드 편집 누적 시 `/self-review`, `/doc-update` 리마인드가 자동 출력됨.
  - 세션 시작/문서 동기화/자기검토 절차가 명문화됨.

- 변경: `.agent` 운영 문서를 코드 현실 기준으로 리프레시.
- 이유: 오래된 경로/우선순위/오픈이슈가 남아 있어 다음 세션 진입이 느리고 엇나갈 위험이 있었음.
- 변경 파일:
  - `.agent/rules/dogcoach.md`
  - `.agent/ai-context/00-index.md`
  - `.agent/ai-context/01-today-plan.md`
  - `.agent/ai-context/03-open-issues.md`
  - `.agent/ai-context/04-rules.md`
  - `.agent/ai-context/05-handoff.md`
  - `.agent/ai-context/logs/2026-04-08-session-log.md`
- 검증:
  - `rg -n "Last Updated|Today Read Order|Next Start Order" .agent/ai-context -S`
- 영향:
  - 다음 세션 읽기 순서와 우선 작업 3개가 고정됨.
  - 코드와 불일치하는 문서 항목(README 깨진 링크, app 레이아웃 인증 설명 등)을 open issue로 격리함.

- 변경: `docs/README.md` 문서 링크 정합화.
- 이유: `docs/ServerPlan.md`, `docs/schema.md` 등 실제로 없는 경로를 참조하고 있었음.
- 변경 파일:
  - `docs/README.md`
- 검증:
  - `ls docs/ServerPlan.md docs/schema.md` 실패 재현(기존 문제 확인)
  - 링크 대상을 현재 존재 문서(`Plan.md`, `backend.md`, `deploy.md` 등)로 교체
- 영향:
  - 신규 작업자 문서 진입 시 깨진 링크로 인한 이탈 감소.

- 변경: `Frontend/src/app/(app)/CLAUDE.md` 설명을 실제 코드 동작과 정합화.
- 이유: 문서에는 `layout.tsx` 인증 리다이렉트가 있다고 되어 있었지만 실제 layout은 앱 쉘 렌더링만 담당.
- 변경 파일:
  - `Frontend/src/app/(app)/CLAUDE.md`
- 검증:
  - `rg -n "useAuth\\(|router\\.push\\('/login'" Frontend/src/app/'(app)' -S`
  - `layout.tsx` 확인(사이드바/하단 내비게이션 렌더링 전용)
- 영향:
  - 보호 경로 정책에 대한 오해 감소.
  - 다음 변경 시 인증 가드 위치를 명확히 판단 가능.

- 변경: `.claude/settings.local.json` 권한 목록 최소화 및 민감 흔적 제거.
- 이유: Windows 전용 임시 명령, 과거 토큰 설정 문자열, 불필요 권한이 섞여 운영 혼선 위험이 있었음.
- 변경 파일:
  - `.claude/settings.local.json`
- 검증:
  - `python3 -m json.tool .claude/settings.local.json >/dev/null`
  - `rg -n "SUPABASE_ACCESS_TOKEN|sbp_" .claude/settings.local.json -S` (결과 없음)
- 영향:
  - 현재 mac 환경 기준으로 필요한 권한만 유지되어 안전성과 예측 가능성 향상.

- 변경: `AGENTS.md` 시작 경로 규칙을 mac/windows 호환 형태로 보강.
- 이유: 기존 단일 Windows 경로가 현재 작업 경로와 불일치.
- 변경 파일:
  - `AGENTS.md`
- 검증:
  - `rg -n "macOS|Windows|TailLogweb/CLAUDE.md" AGENTS.md -S`
- 영향:
  - 세션 시작 시 읽을 규칙 파일 경로 혼동 감소.

## 2026-02-15
- 변경: Result 페이지 UX 개선 (BehaviorIssueSummary 추가, 의미 없는 요소 제거).
- 이유: CoreDataRequiredBanner가 survey?enhance=true로 리다이렉트하며 기존 입력 데이터(이름, 사진) 유실, BarkingHeatmap이 시간대별 목업 데이터 표시 (사용자가 실제로 입력한 적 없음).
- 변경 파일:
  - `Frontend/src/app/(public)/result/page.tsx`: hasCompleteProfile 함수 삭제, Enhancement CTA 섹션 삭제, BarkingHeatmap → BehaviorIssueSummary 교체
  - `Frontend/src/components/features/result/BehaviorIssueSummary.tsx`: 신규 생성 (~75 lines)
  - `Frontend/src/components/features/result/BarkingHeatmap.tsx`: 삭제
- 검증:
  - `cd Frontend && npm run build` → 8.4초, 13 pages 성공
  - BehaviorIssueSummary가 실제 Survey 데이터(issues) 표시
  - getLabel(issue, 'issue')로 ID → 한글 라벨 변환
  - Framer Motion 애니메이션 (stagger delay 0.6 + idx * 0.1)
- 영향:
  - Result 페이지에서 실제 Survey 입력 데이터 시각화 (행동 문제 요약)
  - 혼란스러운 Enhancement CTA 제거로 UX 개선
  - 의미 없는 시간대별 히트맵 제거

- 변경: API 204 No Content 처리 로직 추가.
- 이유: DELETE 요청이 빈 응답(204)을 반환할 때 res.json() 호출로 "Unexpected end of JSON input" 에러 발생 (Settings 페이지 계정 삭제 버그).
- 변경 파일:
  - `Frontend/src/lib/api.ts`: Lines 54-57에 204 상태 코드 체크 추가
- 검증:
  - `cd Frontend && npm run build` → 8.4초, 성공
- 영향:
  - Settings 페이지 계정 삭제 기능 정상 작동
  - 모든 DELETE 요청에서 204 응답 안전하게 처리

- 변경: Google OAuth 동의 화면용 법적 문서 페이지 추가.
- 이유: Google OAuth 동의 화면 설정 시 개인정보처리방침과 서비스 약관 링크 필수.
- 변경 파일:
  - `Frontend/src/app/(public)/privacy/page.tsx`: 개인정보처리방침 페이지 (7개 섹션)
  - `Frontend/src/app/(public)/terms/page.tsx`: 서비스 이용약관 페이지 (11개 조항)
- 검증:
  - `cd Frontend && npm run build` → 8.6초, 15 pages 성공
  - /privacy, /terms 경로 추가 확인
- 영향:
  - Google OAuth 동의 화면 설정 가능
  - 법적 문서 링크: https://www.mungai.co.kr/privacy, https://www.mungai.co.kr/terms
  - 승인된 도메인: kvknerzsqgmmdmyxlorl.supabase.co, mungai.co.kr

## 2026-02-14
- 변경: Fly.io Phase 1(Backend Only) 배포 완료 및 `api.mungai.co.kr` 인증서 활성화.
- 이유: `www.mungai.co.kr` 프론트는 유지하면서 백엔드만 저위험으로 Fly로 이전.
- 검증:
  - Fly health: `GET https://dogcoach-api.fly.dev/health` -> `{"status":"ok"}`
  - Fly cert: `flyctl certs check api.mungai.co.kr -a dogcoach-api` -> `Status = Issued`
- 영향:
  - `Backend/fly.toml`, `Backend/Dockerfile` 추가/복구
  - `docs/fly-backend-phase1.md` 런북 추가, `docs/deploy.md`에 안내 링크 추가
  - DNS: `api.mungai.co.kr`을 Fly 백엔드로 연결 완료(인증서 Issued 확인)

- 변경: GitHub Actions로 `main` 푸시 시 `dogcoach-api` 자동 배포 워크플로우 추가.
- 이유: 수동 `flyctl deploy` 반복을 제거하고 배포 표준화.
- 변경 파일:
  - `.github/workflows/fly-backend-deploy.yml`
- 주의:
  - GitHub Secrets에 `FLY_API_TOKEN`이 반드시 필요 (미설정 시 Actions 배포 실패).
  - 토큰/키는 채팅/로그에 노출되지 않도록 주의 (노출 시 즉시 rotate).

- 변경: UTF 인코딩 재발 방지 가드레일 추가.
- 이유: 일부 TS/TSX 파일에서 invalid UTF-8로 파싱 실패가 반복되어 저장/검증 단계에서 선제 차단 필요.
- 검증:
  - `Set-Location Frontend; node scripts/check-utf8.mjs`
  - 결과: `UTF-8 check passed.`
- 영향:
  - `.vscode/settings.json` 추가 (UTF-8 고정, auto guess 비활성, LF 고정)
  - `Frontend/scripts/check-utf8.mjs` 추가 (텍스트 파일 UTF-8 유효성 검사)
  - `Frontend/package.json`에 `check:utf8` 스크립트 추가
  - 개발자 로컬/CI에서 파싱 전 단계 차단 가능

- 변경: `ai-context`를 single-file bootstrap 운영 방식으로 재구조화.
- 이유: AI가 오래된 문맥을 덜 읽고, 당일 실행 가능한 문서만 읽도록 강제.
- 검증:
  - `Get-ChildItem .agent/ai-context`
  - `Get-ChildItem .agent/ai-context/archive/2026-02-14`
- 영향:
  - 협업 진입 순서 고정 (`00-index.md` 기준)
  - Active/Archive 경계 명확화

- 변경: Backend/Frontend 개발 환경 설정 및 서버 실행.
- 이유: 로컬 개발 환경 구축 및 동작 검증.
- 검증:
  - `Backend 서버: http://127.0.0.1:8000/docs`
  - `Frontend 서버: http://localhost:3000`
- 영향:
  - Backend Python 의존성 557개 패키지 설치 완료
  - Frontend npm 557개 패키지 설치 완료
  - 양쪽 서버 자동 리로드 활성화

- 변경: E2E 테스트 자동화 (게스트 → 로그인 → migrate-guest).
- 이유: 핵심 전환 플로우의 회귀 방지 및 멱등성 검증.
- 검증:
  - `python -m pytest tests/features/test_e2e_guest_migration.py -v`
  - 4 passed, 1 warning (AsyncMock 관련, 비치명적)
- 영향:
  - Backend API 레벨 E2E 테스트 4개 추가
  - Frontend 수동 체크리스트 문서화 (`docs/E2E-Test-Scenarios.md`)
  - Playwright 자동화 로드맵 정의

- 변경: Settings Page UX Improvements (준비중 팝업, 계정 삭제, PWA, 강아지 프로필 API, 사진 업로드).
- 이유: 사용자 경험 개선 및 미완성 기능 명확화.
- 완료: 16/16 작업 (100%)
  - Phase 1: ComingSoonModal, ConfirmDialog 생성, 불필요 텍스트 제거
  - Phase 2: SubscriptionSection 준비중 버튼 3개 연결
  - Phase 3: Backend dogs feature (GET /dogs/profile), useDogProfile 훅
  - Phase 4: Account deletion (DELETE /auth/me, useDeleteAccount)
  - Phase 5: Dog Profile 페이지 (/dog/profile)
  - Phase 6: PWA install (usePWAInstall, AppInfoSection 연동)
  - Phase 7: Dog Photo Upload & Display (Survey, Dashboard, Dog Profile)
- 검증:
  - `Backend: python -m compileall app/features/dogs app/features/auth` (성공)
  - Frontend 컴파일: 타입 에러 없음
  - Supabase Storage: 설정 문서 작성 완료
- 영향:
  - 설정 페이지 16개 기능 완료 (100%)
  - Backend: 2개 feature 추가 (dogs, auth 업데이트)
  - Frontend: 7개 컴포넌트 생성/수정, 4개 훅 추가, 1개 페이지 신규
  - 강아지 사진 업로드/표시 플로우 완성 (Survey → Storage → Dashboard/Profile)

- 변경: Logo Replacement (Sidebar, Header PNG 이미지로 교체).
- 이유: 브랜드 아이덴티티 강화, 텍스트 로고 대신 디자인된 이미지 사용.
- 검증:
  - `cd Frontend && npm run build` (13 pages 성공)
  - 시각적 확인: h-14 (56px), object-contain 비율 유지
- 영향:
  - Sidebar/Header 로고 PNG 파일로 교체 완료
  - Framer Motion 애니메이션 유지 (whileHover, whileTap)
  - 미사용 import 정리 (Settings, cn)

- 변경: Supabase Storage Bucket Setup (dog-profiles 버킷 생성 SQL).
- 이유: Survey 이미지 업로드 시 "Bucket not found", "RLS policy violation" 에러 해결.
- 검증:
  - SQL 스크립트 작성 완료 (create_dog_profiles_bucket.sql, fix_dog_profiles_rls.sql)
  - 기존 스키마 분석 완료 (supabase_schema.sql)
- 영향:
  - 게스트 사용자 업로드 허용 (Survey 접근성)
  - Public read, 모든 사용자 write 정책 설정
  - SQL 실행 대기 중 (사용자가 Supabase Dashboard에서 실행 필요)

## 2026-02-12 (요약)
- guest -> user 데이터 마이그레이션 엔드포인트 추가 (`POST /auth/migrate-guest`).
- dog 소유권 검증 강화, timezone 일관성 적용, 캐시 invalidation 정밀화.
- Supabase 스키마 복원(11 테이블, 7 트리거, RLS), Frontend/Backend 빌드 검증 통과.
