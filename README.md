# TailLogs🐶

> **데이터 기반 반려견 행동 코칭 플랫폼** — 과학적 기록, AI 분석, 맞춤형 트레이닝

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/DB-Supabase-3ecf8e?logo=supabase)](https://supabase.com/)
[![Fly.io](https://img.shields.io/badge/Deploy-Fly.io-8b5cf6?logo=flyio)](https://fly.io/)
[![OpenAI](https://img.shields.io/badge/AI-GPT--4o--mini-412991?logo=openai)](https://openai.com/)

---

## 📋 프로젝트 개요

**DogCoach**는 반려견의 행동을 과학적으로 추적·분석하고, AI 기반 맞춤형 코칭을 제공하는 종합 플랫폼입니다.

주관적인 훈련 방식의 한계를 데이터로 극복합니다:

| 기능 | 설명 |
|------|------|
| 📝 **A-B-C 행동 기록** | 선행(Antecedent)·행동(Behavior)·결과(Consequence) 구조화 기록 |
| 🤖 **AI 맞춤 코칭** | GPT-4o-mini 기반 행동 패턴 분석 & 개인화 추천 (Cache-first) |
| 📊 **대시보드 분석** | 7/15/30일 행동 빈도, 패턴 시각화 |
| 🎯 **트레이닝 커리큘럼** | 증상별 단계형 미션 & AI 대안 제시(Plan B) |
| 🔒 **게스트 → 회원 전환** | 익명 세션 데이터를 로그인 후 무손실 마이그레이션 |
| 💎 **PRO 구독** | 무제한 AI 코칭 & 심층 분석 |

---

## 🏗️ 시스템 아키텍처

```mermaid
graph TB
  subgraph Client["🖥️ Frontend (Next.js 15 + React 19)"]
    AppRouter["App Router<br/>SSR + CSR"]
    TanStack["TanStack Query v5<br/>서버 상태 관리"]
    SupabaseAuth["Supabase Auth<br/>세션/토큰"]
  end

  subgraph Server["⚙️ Backend (FastAPI)"]
    API["REST API<br/>8 도메인"]
    Services["Services Layer"]
    subgraph AI["🤖 AI Engine"]
      OpenAIClient["GPT-4o-mini"]
      RuleEngine["Rule Fallback<br/>규칙 기반"]
      CacheLayer["Cache-first<br/>dedupe_key"]
    end
  end

  subgraph DB["🗄️ Supabase (PostgreSQL)"]
    Tables["14+ 테이블<br/>RLS Enabled"]
    Auth["OAuth / JWT<br/>익명 세션"]
  end

  subgraph Infra["☁️ 인프라"]
    Vercel["Vercel (FE)"]
    Fly["Fly.io (BE)"]
  end

  Client -->|"REST API / apiClient()"| Server
  Server -->|"SQLAlchemy async"| DB
  Client -->|"Auth Session"| Auth
  OpenAIClient -.->|"API 호출"| AI
  Vercel -.-> Client
  Fly -.-> Server

  style Client fill:#1e293b,stroke:#3b82f6,color:#e2e8f0
  style Server fill:#1e293b,stroke:#10b981,color:#e2e8f0
  style DB fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
  style AI fill:#0f172a,stroke:#8b5cf6,color:#e2e8f0
  style Infra fill:#1e293b,stroke:#6b7280,color:#e2e8f0
```

---

## 🔄 핵심 데이터 흐름

```mermaid
flowchart LR
  subgraph Input["사용자 입력"]
    U1["행동 기록<br/>(QuickLog / A-B-C)"]
    U2["강아지 프로필<br/>설문"]
  end

  subgraph Process["AI 추천 엔진"]
    P1["dedupe_key<br/>(sha256)"]
    P2{"캐시 유효?"}
    P3["⚡ 즉시 반환"]
    P4["GPT-4o-mini 호출"]
    P5["Rule Fallback<br/>(예산 초과 시)"]
    P6["스냅샷 저장"]
  end

  subgraph Output["결과"]
    O1["대시보드"]
    O2["AI 추천 카드"]
    O3["트레이닝 미션"]
  end

  U1 --> P1
  U2 --> P1
  P1 --> P2
  P2 -->|HIT| P3 --> O2
  P2 -->|MISS| P4 --> P6 --> O2
  P4 -->|"예산 초과"| P5 --> P6
  U1 --> O1
  P6 --> O3

  style Input fill:#1e3a5f,stroke:#3b82f6,color:#e2e8f0
  style Process fill:#1a3a2a,stroke:#10b981,color:#e2e8f0
  style Output fill:#2a1a3a,stroke:#8b5cf6,color:#e2e8f0
```

---

## 🗂️ 프로젝트 구조

```
DogCoach/
├── Frontend/                      # Next.js 15 웹 애플리케이션
│   └── src/
│       ├── app/
│       │   ├── (public)/          # 온보딩, 설문, 랜딩
│       │   └── (app)/             # 대시보드, 코치, 로그, 설정 (인증 필요)
│       ├── components/
│       │   ├── ui/                # Atomic UI 컴포넌트
│       │   ├── shared/            # 레이아웃, 헤더, 하단 내비
│       │   └── features/          # 도메인별 특화 컴포넌트
│       ├── hooks/                 # TanStack Query 훅 모음
│       ├── lib/                   # API 클라이언트, 타입, Supabase 설정
│           └── theme/colors.ts    # 차트/캔버스/PDF 공용 색상 토큰 상수
│       └── styles/globals.css     # Tailwind v4 @theme 기반 디자인 토큰
│
├── Backend/                       # FastAPI 서버
│   └── app/
│       ├── core/                  # 전역 설정, 예외 처리
│       ├── shared/                # 공용 DB 모델, AI 클라이언트
│       └── features/              # 비즈니스 도메인
│           ├── auth/              # 인증 & 게스트 마이그레이션
│           ├── onboarding/        # 설문 & 초기 설정
│           ├── dashboard/         # 데이터 집계 & 인사이트
│           ├── coach/             # AI 코칭 알고리즘
│           ├── ai_recommendations/# 캐시 기반 AI 추천
│           ├── log/               # 행동 로그 CRUD
│           ├── dogs/              # 강아지 프로필 관리
│           └── settings/          # 사용자 설정
│
└── docs/                          # 프로젝트 문서
    ├── status/                    # 현재 상태/결정 로그
    ├── ref/                       # 아키텍처/스키마 정본
    ├── archive/                   # 해결된 결정 아카이브
    ├── architecture-diagrams.md   # 전체 아키텍처 다이어그램 (Mermaid)
    └── Plan.md                    # 개발 계획
```

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion |
| **상태 관리** | TanStack Query v5 (서버), Supabase Auth (인증) |
| **Backend** | FastAPI, SQLAlchemy 2 (async), Pydantic v2, Python 3.10+ |
| **데이터베이스** | Supabase (PostgreSQL), AsyncPG, JSONB 컬럼 활용 |
| **AI** | OpenAI GPT-4o-mini, Cache-first 전략, Rule Fallback |
| **인증** | Supabase Auth (Google OAuth, Kakao OAuth, 익명 세션) |
| **인프라** | Vercel (FE), Fly.io (BE), GitHub Actions |

---

## 🚀 로컬 실행

### 준비물
- Python 3.10+
- Node.js 18+
- Supabase 프로젝트 (URL & Anon Key)

### 백엔드

```bash
cd Backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

`.env` 파일 설정:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
OPENAI_API_KEY=sk-...
SECRET_KEY=your_jwt_secret
```

```bash
python -m uvicorn app.main:app --reload
# → http://localhost:8000
# → API 문서: http://localhost:8000/api/v1/openapi.json
```

### 프론트엔드

```bash
cd Frontend
npm install
```

`.env.local` 파일 설정:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

```bash
npm run dev
# → http://localhost:3000
```

### 프론트엔드 품질 체크

```bash
cd Frontend
npm run check:color-hardcode   # 임의 hex 클래스(bg-[#...]) 차단
npm run check:utf8             # UTF-8 인코딩 검증
npm run build                  # 프로덕션 빌드 검증
```

---

## 🎨 디자인 토큰 가이드

- **CSS 토큰 소스**: `Frontend/src/styles/globals.css` (`@theme`)
- **TS 토큰 소스**: `Frontend/src/lib/theme/colors.ts`  
  - 차트(Recharts), 캔버스(confetti), PDF(`@react-pdf/renderer`)처럼 CSS 변수 직접 사용이 어려운 경우 이 상수를 사용합니다.
- **원칙**
  - UI 코드에서 `bg-[#...]/text-[#...]` 같은 임의 hex 클래스 사용 금지
  - 반복되는 그림자/글로우는 `globals.css` 유틸리티 클래스로 재사용
  - 색상 변경은 토큰 파일(위 2곳) 중심으로 처리

---

## 🔐 인증 흐름

```mermaid
sequenceDiagram
  actor 사용자
  participant FE as Frontend
  participant Supabase
  participant BE as Backend API

  사용자->>FE: 앱 접속
  FE->>Supabase: 세션 확인
  alt 세션 없음 (게스트)
    FE->>사용자: 게스트 모드 시작
    사용자->>FE: 설문 / 행동 기록
  end
  사용자->>FE: 소셜 로그인 (Google/Kakao)
  FE->>Supabase: signInWithOAuth()
  Supabase-->>FE: access_token 발급
  FE->>BE: POST /auth/migrate-guest<br/>(token + anonymous_sid)
  BE-->>FE: 게스트 데이터 자동 이전 완료
  FE->>사용자: 대시보드 진입 🎉
```

---

## 📅 개발 로드맵

```mermaid
gantt
  title DogCoach 개발 단계
  dateFormat  YYYY-MM
  section 완료
    기반 구축 (DB, 보안, 모델)        :done, p1, 2024-10, 1M
    온보딩 & 인증 (설문, OAuth)       :done, p2, 2024-11, 1M
    핵심 루프 (로그, 대시보드)         :done, p3, 2024-12, 1M
    AI 코칭 (GPT-4o-mini, Cache)      :done, p4, 2025-01, 1M
    시각화 & 챌린지 (커리큘럼, Plan B) :done, p5, 2025-01, 1M
    구조화 & 최적화 (리팩토링, RLS)    :done, p6, 2025-02, 1M
  section 진행 중
    AI 고도화 (RAG, 심층 분석)        :active, p7, 2025-02, 2M
  section 예정
    모바일 최적화 (PWA, 오프라인)      :p8, 2025-04, 2M
    다국어 지원 & 소셜 기능           :p9, 2025-06, 2M
```

---

## ✅ 테스트

```bash
cd Backend
python -m pytest tests -v
```

---

## 📚 문서

| 문서 | 설명 |
|------|------|
| [README.md](./docs/README.md) | 문서 운영 가이드 (SSOT/Tier/Change Class) |
| [status/PROJECT-STATUS.md](./docs/status/PROJECT-STATUS.md) | 현재 진행 상태 및 체크리스트 |
| [status/DECISION-LOG.md](./docs/status/DECISION-LOG.md) | 미해결 의사결정 로그 |
| [ref/ARCHITECTURE.md](./docs/ref/ARCHITECTURE.md) | 아키텍처 정본 문서 |
| [ref/SCHEMA.md](./docs/ref/SCHEMA.md) | 데이터 스키마 참조 정본 |
| [ref/DOC-CHANGE-CLASS.md](./docs/ref/DOC-CHANGE-CLASS.md) | 변경 class별 문서 갱신 매핑 |
| [architecture-diagrams.md](./docs/architecture-diagrams.md) | 전체 아키텍처 Mermaid 다이어그램 (11종) |
| [Plan.md](./docs/Plan.md) | 프로젝트 전체 개발 계획 |
| [AI_Adoption_Plan.md](./docs/AI_Adoption_Plan.md) | AI 도입 전략 |
| [future_roadmap.md](./docs/future_roadmap.md) | 미래 확장 로드맵 |

---

<div align="center">
  <sub>Built with ❤️ for happier dogs and their humans</sub>
</div>
