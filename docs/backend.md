DogCoach 백엔드는 Feature-based Architecture(기능 기반 아키텍처) 를 채택하여 유지보수성과 확장성을 높였습니다.

## 1. 아키텍처 개요 (Architecture)
```
Backend/
├── app/
│   ├── core/                  # 프로젝트 전역 설정 (정적/인프라)
│   ├── shared/                # 기능 간 공통 리소스
│   ├── features/              # 비즈니스 로직 (도메인 주도)
│   └── main.py                # 앱 엔트리포인트
```

## 2. 기술 스택 (Tech Stack)
- **Framework**: FastAPI (Python 3.10+)
- **Database**: Supabase (PostgreSQL)
- **ORM**: SQLAlchemy 2.0 (AsyncIO)
- **Auth**: Supabase Auth (JWT)
- **Frontend Caching**: TanStack Query (React Query) [NEW]
- **AI**: Ollama (Qwen2.5-1.5B) + Cloudflare Tunnel

## 3. 구현 단계 (Implementation Status)

### ✅ Phase 1: 기반 (Core & Shared)
- [x] 환경 변수 관리, DB 연결, 공통 모델링, JWT 보안 설정 완료.

### ✅ Phase 2: 사용자 접근 (Auth & Onboarding)
- [x] 익명 로그인(Guest Support) 및 설문 API 연동 완료.

### ✅ Phase 3: 핵심 루프 (Log & Dashboard)
- [x] **Log & Dashboard API**: CRUD 및 통계 집계 연동 완료.
- [x] **프론트엔드 최적화**: 
    - [x] **TanStack Query**를 통한 서버 상태 캐싱 및 데이터 무결성 보장.
    - [x] **Strict Query Keys** 설계를 통한 캐시 충돌 방지 및 자동 무효화(Invalidation) 적용.
    - [x] **Timezone Awareness**: `X-Timezone` 헤더 기반 로컬 시간 처리.

### ✅ Phase 4: 지능 (Coach & Curriculum) [COMPLETED]
- [x] **AI 코칭 API**: 기본적인 슬롯 필링 기반 코칭 로직 (`coach/service.py`) 구현 완료.
- [x] **Local AI 리포트**: `AIClient`를 통한 로컬 LLM 연동 및 최근 로그 기반 행동 데이터 심층 분석 기능 구현.
- [x] **모듈형 커리큘럼 아키텍처**: 커리큘럼 데이터를 증상별 모듈로 분리하여 유지보수성 극대화 (`src/data/curriculum/`).
- [x] **가변형 훈련 개입 (Plan B)**: 미션 단계별 AI 맞춤형 대안 스와핑 시스템 및 프리미엄 스캔 UX 구축.
- [x] **훈련 보관함 (Vault)**: 원래의 계획(Plan A)을 보관하고 언제든지 조회/취소할 수 있는 보관 시스템 구현.
- [x] **UX 최적화**: 결과 분석 -> AI 리포트 생성 -> 훈련 추천으로 이어지는 유기적인 전환 flow 구축.
- [ ] **RAG 고도화**: 벡터 DB(Supabase Vector) 연동 및 실제 로그 데이터 컨텍스트 주입 예정.
- [ ] **사용자 설정**: 알림 채널 및 AI 페르소나 설정 API 구현 예정.

## 4. 리팩토링 및 개선 사항
- [x] **Feature-based Isolation**: 각 기능 폴더 내에서 Router-Service-Repository 패턴 준수.
- [x] **React Query Factory**: 도메인별 쿼리 키 중앙 관리 (`src/lib/query-keys.ts`).
- [x] **Error Boundary & Error Handling**: 백엔드 DomainException 및 프론트엔드 API 클라이언트 에러 핸들링 고도화.
- [x] **Training Status Convention**: `UserTrainingStatus` Enum의 엄격한 타입 제한으로 인해, 플랜 B 교체(Swap) 시 `SKIPPED_INEFFECTIVE` 상태값을 사용하도록 규약 정의 (추후 Phase 2 스키마 마이그레이션 시 변경 예정).
- [x] **Dashboard Query Consolidation (2026-04-09)**: `Dog+DogEnv`, 로그 통계(`count/max`), 최근로그 재사용으로 `/dashboard` DB round trip 1차 축소.
- [x] **Hot-path Index Patch (2026-04-09)**: `dogs(user_id, created_at desc)`, `dogs(anonymous_sid, created_at desc)`, `training_behavior_snapshots(..., snapshot_date desc)` 추가 스크립트 작성.
