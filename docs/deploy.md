# TailLog Deploy Guide (Vercel + Render)

> Current migration note: for low-risk transition to Fly backend only, see `docs/fly-backend-phase1.md`.
> Current production note (2026-04-08): frontend는 Vercel, backend는 Railway 기준으로 운영 중.

## 0) Current Production Baseline (Verified 2026-04-08)
- Frontend: `https://www.mungai.co.kr` (Vercel)
- Backend: `https://backend-production-61c6.up.railway.app` (Railway)
- Frontend env:
  - `NEXT_PUBLIC_API_URL=https://backend-production-61c6.up.railway.app`
  - `NEXT_PUBLIC_SITE_URL=https://www.mungai.co.kr`
- Backend env (핵심):
  - `ENVIRONMENT=production`
  - `BACKEND_CORS_ORIGINS` includes `https://www.mungai.co.kr`
  - `ANONYMOUS_COOKIE_SECURE=true`
  - `ANONYMOUS_COOKIE_SAMESITE=none`
- 증적:
  - `docs/qa/artifacts/2026-04-08/VERCEL_CHECK_REPORT.md`
  - `docs/qa/artifacts/2026-04-08/context_mapping_real_flow_after_fix.json`

## 1) Architecture
- Frontend: Vercel (`Frontend` root)
- Backend: Render Web Service (`Backend` root)
- DB/Auth: Supabase

## 2) Backend Deploy (Render)

### Create service
- Runtime: Python
- Root Directory: `Backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health Check Path: `/health`

### Required env vars
- `ENVIRONMENT=production`
- `DATABASE_URL=postgresql+asyncpg://...`
- `SECRET_KEY=...`
- `SUPABASE_URL=https://<project>.supabase.co`
- `SUPABASE_ANON_KEY=...`
- `OPENAI_API_KEY=...`
- `BACKEND_CORS_ORIGINS=https://<your-vercel-domain>,http://localhost:3000`

### Cookie options (guest -> user migration)
- Default in production:
  - `ANONYMOUS_COOKIE_SECURE=true`
  - `ANONYMOUS_COOKIE_SAMESITE=none`
- Optional override:
  - `ANONYMOUS_COOKIE_DOMAIN=.your-domain.com`

## 3) Frontend Deploy (Vercel)

### Project settings
- Root Directory: `Frontend`

### Required env vars
- `NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `NEXT_PUBLIC_API_URL=https://<your-render-domain>`

Note:
- If `NEXT_PUBLIC_API_URL` is empty, app falls back to DEMO mode.

## 4) Validation Checklist
1. Backend health:
   - `GET https://<render-domain>/health` returns `{"status":"ok"}`.
2. CORS:
   - Requests from Vercel domain are allowed.
3. Guest onboarding cookie:
   - `POST /api/v1/onboarding/survey` sets `anonymous_sid`.
4. Guest dashboard:
   - Same browser can call `/api/v1/dashboard/`.
5. Guest -> user migration:
   - After login, `POST /api/v1/auth/migrate-guest` returns `migrated_count > 0`.
6. Auth endpoints:
   - `/api/v1/auth/me`, `/api/v1/logs/{dog_id}`, `/api/v1/coach/*` work with token.
7. Admin-only endpoint:
   - `/api/v1/coach/cost-status` must return `403` for non-admin users.

## 5) Demo Runbook
1. Warm up Render 5-10 minutes before demo (`/health` ping).
2. Run full rehearsal once:
   - guest survey -> dashboard -> login -> migrate -> logged-in dashboard/logs.
3. Keep `NEXT_PUBLIC_API_URL` fixed to Render URL during demo.
