# Honkonomics — RBC InvestEase Sandbox Demo

## Winner of the Tech@RBC InvestEase Challenge

A Next.js app with a FastAPI backend that demos portfolio management on the RBC InvestEase sandbox. It auto‑provisions a sandbox client, fetches and simulates portfolios, renders RBC‑styled charts, and includes an “Explain My Portfolio” AI helper (OpenAI or Gemini). It also supports multi‑currency display with a live FX badge from the Bank of Canada.

## Features

- RBC InvestEase sandbox integration
  - FastAPI BFF proxies your frontend calls to the RBC sandbox under `/investease/*`.
  - Auto‑provisions an InvestEase client on first use (if missing) using name/email.
- Portfolio management UI (RBC themed)
  - Client overview, cash/total KPIs, deposit/transfer/withdraw flows
  - Per‑portfolio KPIs + simple SVG line charts (monthly and yearly)
  - Currency selector (CAD, USD, EUR, GBP, JPY, INR, …); amounts shown in selected currency
  - Live FX badge (BoC Valet) pinned bottom‑right of the overview card
- “Explain My Portfolio” (LLM)
  - Large card with Goose image and 5 strategy options (RBC Aggressive Growth → RBC Very Conservative)
  - On selection, sends a brief context to an LLM endpoint (OpenAI or your custom backend)
  - Attaches `public/rbc_portfolios_summary.md` to the prompt if present
- Learning mini‑courses (Gemini/OpenAI)
  - `app/api/learn/route.ts` uses Gemini by default and falls back to OpenAI if Gemini keys are missing
- Supabase profile persistence
  - Backend route persists `investEaseClientId` to your `profiles` table by email

## Repo Layout

- `app/` — Next.js (App Router) frontend
  - `components/portfolio-management.tsx` — main RBC InvestEase demo page
  - `components/auth-provider.tsx` — mock auth + InvestEase auto‑provision + local persistence
  - `api/learn/route.ts` — server route generating mini‑courses via Gemini/OpenAI
- `backend/` — FastAPI services
  - `main.py` — BFF proxy for `/investease/*`, mounts account routes
  - `account.py` — Supabase profile helpers; POST `/account/set-investease`
  - `gemini_api.py` — optional Gemini API (with dotenv/env support)
  - `requirements.txt` — FastAPI + Supabase + Google GenAI clients
- `public/`
  - RBC + Goose assets, optional `rbc_portfolios_summary.md` reference doc for LLM

## Prerequisites

- Node 18+ and npm
- Python 3.10+ and pip (for the backend)

## Environment Variables

Frontend (.env.local)

- `NEXT_PUBLIC_BFF_URL` — URL to your FastAPI BFF (e.g., `http://localhost:8000` or deployed)
- `NEXT_PUBLIC_OPENAI_API_KEY` — optional (demo client‑side OpenAI; use backend in prod)
- `NEXT_PUBLIC_OPENAI_MODEL` — optional (default `gpt-4o-mini`)
- `NEXT_PUBLIC_LLM_ENDPOINT` — optional custom endpoint (e.g., `/api/explain`) to call OpenAI server‑side

Backend (.env or server config)

- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — required by `backend/account.py` if you want to persist `investEaseClientId`
- `GOOGLE_API_KEY` or `GEMINI_API_KEY` — used by `backend/gemini_api.py` and/or `app/api/learn/route.ts`
- RBC sandbox is proxied by `backend/main.py` using a baked JWT; adjust if required.

Note: The repo includes a fallback Gemini key path for local ease-of-use. Replace with env vars in production.

## Running Locally

1) Install and run the backend (FastAPI)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
# Set env:
# export SUPABASE_URL=... SUPABASE_ANON_KEY=...
# export GOOGLE_API_KEY=...  # or GEMINI_API_KEY
uvicorn backend.main:app --reload --port 8000
```

2) Install and run the frontend (Next.js)

```bash
npm install
# Optional .env.local:
# NEXT_PUBLIC_BFF_URL=http://localhost:8000
# NEXT_PUBLIC_OPENAI_API_KEY=sk-...
# NEXT_PUBLIC_OPENAI_MODEL=gpt-4o-mini
npm run dev
```

Open http://localhost:3000 and navigate to the portfolio page. On first visit, a sandbox client will be created automatically if one doesn’t exist.

## Deploying

- Backend: Deploy `backend/main.py` as a FastAPI app (Fly.io/Render/Heroku). Set CORS to allow your frontend origin.
- Frontend: Vercel/Netlify/Node host. Set `NEXT_PUBLIC_BFF_URL` to the deployed backend URL.
- Provide envs for Gemini/OpenAI as needed. Prefer server‑side OpenAI calls for security.

## Key Endpoints

- Frontend → Backend (proxy): `/investease/*` (GET/POST/PATCH… forwarded to RBC sandbox)
- Persist InvestEase ID: `POST /account/set-investease` body `{ email, investEaseClientId }`
- Learn route: `POST /api/learn` body `{ topic, level }` → JSON micro‑course (Gemini/OpenAI)
- Optional Gemini service (backend): `/gemini/chat`, `/gemini/chat/stream`

## Notes & Disclaimers

- “Explain My Portfolio” sends a compact summary of current portfolios and the selected strategy. It can use a custom `/api/explain` if you provide one, or call OpenAI directly when a public key is set. Add `public/rbc_portfolios_summary.md` to enrich the prompt.
- Currency display uses fixed client‑side FX for the amounts (display only). The bottom‑right FX badge shows a live Bank of Canada exchange rate (daily), which may differ from the fixed client display rates.
- The auth flow is mocked (localStorage). Wire your real auth/provider as needed.

## Troubleshooting

- “Missing GOOGLE_API_KEY/GEMINI_API_KEY”: Add Gemini keys or rely on the OpenAI fallback by setting `OPENAI_API_KEY` (server) or `NEXT_PUBLIC_OPENAI_API_KEY` (demo).
- Supabase error at startup: Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set where the backend runs. The app won’t crash; only `/account/*` will return a clear 500 if not set.
- Type errors on `investEaseClientId`: The UI derives it as `const uClientId = (user as any)?.investEaseClientId ?? null` to avoid type coupling. If you prefer, import the exported `User` interface from `auth-provider.tsx`.

---

Made with Honk. 🦆

