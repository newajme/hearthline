# Hearthline — Agent Guide

This file is the entry point for AI coding agents (Claude Code, Cursor, Copilot, etc.).
Read this before touching any file. The full project context lives in `CLAUDE.md`.

---

## What this project is

**Hearthline** is an open-source AI front desk for home-service businesses (HVAC,
plumbing, roofing, solar, electrical, landscaping, cleaning, pest control).
A voice persona named **Anna** answers inbound calls via Vapi, qualifies leads,
books appointments, and sends SMS confirmations. Everything lands in a Next.js
dashboard backed by Django + Postgres.

- License: **AGPL-3.0** (commercial license available — see `COMMERCIAL.md`)
- Repo: `github.com/codewithmuh/hearthline`
- Creator: Muhammad Rashid (`@codewithmuh`) — content creator, not a SaaS company

---

## Stack at a glance

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 + React 19 + TypeScript (App Router) |
| Backend | Django 5 + DRF |
| Database | Postgres 16 |
| Voice | Vapi (custom-LLM mode) + Twilio (SMS) |
| AI | Anthropic Claude Sonnet 4.6 + OpenAI GPT-4o (vision) |
| Local dev | Docker Compose |
| Production | Vercel (frontend) + VPS Docker Compose (backend) |

---

## Repo layout

```
hearthline/
├── AGENTS.md                    # this file
├── CLAUDE.md                    # extended project context
├── CONTRIBUTING.md              # PR workflow
├── DEPLOY.md                    # Vercel + VPS deploy guide
├── docker-compose.yml           # local dev (3 services: db, backend, frontend)
├── docker-compose.prod.yml      # VPS production
├── Caddyfile                    # auto-HTTPS reverse proxy for VPS
├── .env.example                 # all env vars documented with generation commands
├── scripts/
│   └── test-quickstart.sh       # smoke-tests the docker-compose stack
├── .github/workflows/ci.yml     # CI: TypeScript check + Next.js build
├── frontend/                    # Next.js app
│   └── app/
│       ├── page.tsx             # marketing landing (no real PII)
│       ├── faq/, privacy/, terms/, docs/
│       └── dashboard/           # /dashboard/{leads,calls,quotes,customers,support,settings,test-call}
└── backend/                     # Django
    ├── api/index.py             # Vercel Python WSGI entrypoint
    ├── manage.py
    ├── requirements.txt
    ├── hearthline/              # Django project (settings, urls, wsgi, asgi)
    └── apps/
        ├── core/                # Business, Channel, encrypted-key fields
        ├── leads/               # Customer, Lead, Conversation, Message
        │   └── management/commands/seed_demo.py
        ├── calls/               # Call + Vapi/Twilio handlers + Anna agent loop
        │   ├── agent/
        │   │   ├── prompts.py        # Anna's system prompt
        │   │   ├── tools.py          # 7 tool schemas
        │   │   └── receptionist.py   # agentic loop (Claude + OpenAI)
        │   ├── services/
        │   │   ├── sms.py, email.py, scheduling.py, persistence.py
        │   └── tests/               # test_views.py, test_persistence.py
        ├── quotes/              # Quote, LineItem (editable + server-side PDF)
        ├── support/             # Tickets, threaded messages, WhatsApp/SMS/email webhooks
        └── ai/                  # Transcript → structured lead extraction
```

---

## Key API endpoints

```
GET  /api/health/
GET  /api/businesses/
GET  /api/leads/                    GET/PATCH /api/leads/<id>/
GET  /api/calls/
GET  /api/quotes/                   GET/PATCH /api/quotes/<id>/
POST /api/calls/webhooks/vapi/      (end-of-call report)
POST /api/calls/webhooks/twilio/    (voice/SMS)
POST /api/calls/vapi/chat/completions/   (Vapi custom-LLM, OpenAI-compatible)
```

---

## Anna's agent loop (how it works)

1. Vapi handles STT + TTS, POSTs the conversation to `/api/calls/vapi/chat/completions/` each turn.
2. Django converts OpenAI-format messages → Claude/OpenAI format, runs `receptionist.py`.
3. Anna can call 7 tools: `qualify_lead`, `check_availability`, `book_appointment`,
   `draft_quote`, `send_sms`, `send_email`, `end_call`.
4. Lead/Customer rows are created/updated as Anna learns more.
5. Response returns as an OpenAI completion. `X-Vapi-End-Call: true` tells Vapi to hang up.

Missing `ANTHROPIC_API_KEY` → friendly stub response, never crashes.

---

## Local dev

```bash
cp .env.example .env
docker compose up --build

# Seed demo data + default admin (admin / hearthline)
docker compose exec backend python manage.py seed_demo --wipe
docker compose exec backend python manage.py seed_admin

# Run backend tests
docker compose exec backend python manage.py test apps.calls.tests

# Smoke-test the full stack
./scripts/test-quickstart.sh
```

URLs:
- `http://localhost:3000` — Next.js dashboard
- `http://localhost:8000/admin` — Django admin
- `http://localhost:8000/api` — REST API

---

## Coding conventions

- **No Tailwind.** All styles in `frontend/app/globals.css` — intentional.
- **No `any` in TypeScript** without a `// reason:` comment.
- **No comments** unless the *why* is non-obvious. The *what* is the code.
- **Python:** PEP 8, type hints encouraged. Pylint `no 'objects' member` warnings are false positives — ignore.
- **Django models** in `apps/<app>/models.py`. Migrations in `apps/<app>/migrations/`.
- **Short PRs.** One concern per PR.
- **No emojis in code** unless explicitly requested. OK in CSS for UI badges.

---

## Hard constraints — do NOT add these

- Tailwind CSS or any CSS framework
- Multi-tenant auth / billing (out of scope until traction)
- Fake customer logos, testimonials, or case studies
- Realistic PII on the marketing page (`/` and its sub-pages)
- Background job queues (Celery / Redis) — use Vercel Cron if needed
- Server-Sent Events on the dashboard

---

## Brand rules

- The AI receptionist is always called **Anna** — not "the bot", "the assistant", etc.
- Creator credit: "by codewithmuh" — links to codewithmuh.com, YouTube, LinkedIn, X, GitHub.
- Never position Hearthline as an alternative to a named competitor.
- Marketing page mock data: `Customer 001`–`Customer 008`, `+1 (000) 123-4567`, `example.test` emails.
- Dashboard seed data can use realistic names (Mark Johnson, etc.) — that split is intentional.

---

## Production deploy

Two supported paths — see `DEPLOY.md` for full instructions.

**Path A — Vercel frontend + Vercel Python backend (serverless)**
- Root `vercel.json` declares both services.
- Backend served at `/_/backend/...`.
- Run migrations locally against Neon: `DATABASE_URL=<neon-url> python manage.py migrate`

**Path B — Vercel frontend + Docker Compose VPS backend**
- `docker compose -f docker-compose.prod.yml up -d --build`
- Caddy handles auto-HTTPS. Set `API_DOMAIN` and `FRONTEND_ORIGIN` in `.env`.

Required env vars for production:
- `DJANGO_SECRET_KEY` — long random string
- `HEARTHLINE_ENCRYPTION_KEY` — Fernet key (generate once, never rotate)
- `VAPI_WEBHOOK_SECRET` — shared secret for Vapi auth
- `DATABASE_URL` or `POSTGRES_*` vars
- `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`)

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR to `main`:
- TypeScript type-check (`tsc --noEmit`)
- Next.js production build

Backend tests are run manually via `manage.py test` (see above). A backend CI
job is a known gap — tracked in `AGENTS-IMPROVEMENT-SPEC.md`.
