# Deploying Hearthline

Two supported paths — pick the one that matches your operations.

| Path | Cost | Best for |
|------|------|----------|
| **A — All on Vercel** *(experimental multi-service)* | Free + Postgres ~$10/mo | Same workflow as codewithmuh.com, zero-VPS |
| B — Vercel frontend + Docker Compose VPS backend | $6 VPS + Vercel free | Long-running webhooks, no cold starts, full Django admin |

---

## Path A — All on Vercel (recommended for the demo)

Vercel's experimental multi-service feature deploys the Next.js frontend AND the Django backend as serverless functions in one project.

The repo already ships with the right configs:

- `vercel.json` (root) — declares both services and their routePrefixes
- `backend/api/index.py` — Vercel Python entrypoint that exposes Django's WSGI app
- `backend/vercel.json` — Python runtime config with 60s function timeout

### a. Push the repo

```bash
gh repo create codewithmuh/hearthline --public --source=. --remote=origin --push
```

### b. Add a Postgres database

Vercel doesn't host Postgres directly, but its **Storage tab** integrates with **Neon** (recommended) or **Supabase** in one click. Neon's free tier is plenty for the demo and includes pgbouncer pooling for serverless.

1. Vercel project → Storage → Create Database → **Neon Postgres**
2. Vercel auto-injects `DATABASE_URL` into the project env
3. Use the **pooled** connection string (Neon shows a `?pgbouncer=true` URL) — serverless functions open fresh connections per invocation

### c. Import on Vercel

1. [vercel.com/new](https://vercel.com/new) → import `codewithmuh/hearthline`
2. Vercel detects both services from the root `vercel.json`:
   - **frontend** — Next.js at `/`
   - **backend** — Django at `/_/backend`
3. Set environment variables (Production):

```
# Django
DJANGO_SECRET_KEY=<openssl rand -base64 50>
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=hearthline.codewithmuh.com,*.vercel.app
DJANGO_CORS_ALLOWED_ORIGINS=https://hearthline.codewithmuh.com

# AI
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...

# Voice (optional, for live calls)
VAPI_API_KEY=...
VAPI_PHONE_NUMBER_ID=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...

# Frontend → Backend (same Vercel project, both deploy together)
INTERNAL_API_URL=https://hearthline.codewithmuh.com/_/backend/api
NEXT_PUBLIC_API_URL=https://hearthline.codewithmuh.com/_/backend/api
```

> Note: with multi-service deploys the backend is served at `https://<your-domain>/_/backend/...`. The Next.js app calls it via the relative `/_/backend/api/...` path.

4. Deploy — Vercel ships the frontend + backend in one push.

### d. Run migrations (one-time)

Vercel doesn't have a persistent shell, so run migrations from your laptop pointed at the Neon DB:

```bash
cd backend
DATABASE_URL=<neon-pooled-url> python manage.py migrate
DATABASE_URL=<neon-pooled-url> python manage.py seed_demo --wipe
DATABASE_URL=<neon-pooled-url> python manage.py createsuperuser
```

### e. Wire Vapi to the Vercel-hosted backend

| Field | Value |
|------|-------|
| Custom LLM URL | `https://hearthline.codewithmuh.com/_/backend/api/calls/vapi/chat/completions/` |
| Server URL | `https://hearthline.codewithmuh.com/_/backend/api/calls/webhooks/vapi/` |
| Model | `claude-sonnet-4-6` |
| First message | `Hi, this is Anna at Rolling Shutters. How can I help?` |

Buy a phone number on Vapi → attach the assistant → call it.

### Vercel serverless caveats

- **60s function timeout** — Anna's agentic loop usually finishes in 4–8s, can spike to 15–30s on heavy tool use. Already set to 60s in `backend/vercel.json`.
- **Cold starts** — first call after idle takes ~2s. Vapi handles this well; the Twilio fallback may not.
- **No background jobs** — async work (review-request after job complete) needs a queue (Vercel Cron + a separate function, or Inngest).

---

## Path B — Vercel frontend + Docker Compose VPS backend

If you outgrow Vercel's serverless constraints (long Vapi calls, large transcripts, full Django admin with media uploads), this path is rock-solid:

- **Frontend → Vercel** (same as Path A — but `INTERNAL_API_URL` / `NEXT_PUBLIC_API_URL` point to your VPS)
- **Backend (Django + Postgres) → Docker Compose on a small VPS** with **Caddy** for auto-HTTPS

The repo already includes `docker-compose.prod.yml` + `Caddyfile`.

```bash
# on a $6 Hetzner / DigitalOcean VPS:
git clone https://github.com/codewithmuh/hearthline.git && cd hearthline
cp .env.example .env && nano .env
docker compose -f docker-compose.prod.yml up -d --build
```

Point DNS:
```
api.hearthline.codewithmuh.com  →  <your-vps-ip>
```

Caddy issues a Let's Encrypt cert on first request — everything HTTPS in 30s.

Vercel env vars:
```
INTERNAL_API_URL=https://api.hearthline.codewithmuh.com/api
NEXT_PUBLIC_API_URL=https://api.hearthline.codewithmuh.com/api
```

Migrations + seed:
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_demo --wipe
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

Wire Vapi the same way but at the VPS domain.

---

## Cost ballpark

| Component | Path A (all Vercel) | Path B (Vercel + VPS) |
|-----------|---------------------|----------------------|
| Frontend | $0 | $0 |
| Backend | $0 (Vercel Hobby) | $6/mo (Hetzner CX22) |
| Postgres | $0–10/mo (Neon free → Pro) | included on VPS |
| Vapi number | $2/mo | $2/mo |
| Vapi talk | $0.07/min | $0.07/min |
| Anthropic / OpenAI | usage-based | usage-based |
| **Demo monthly** | **~$5–15/mo** | **~$10–25/mo** |

---

## Troubleshooting

**Vercel deploy fails — "module not found" in backend**
→ `backend/api/index.py` adds the backend root to `sys.path` so Django imports resolve. Confirm the file shipped (not in `.gitignore`).

**Postgres connection drops mid-request on Vercel**
→ Use Neon's **pooled** URL (with `?pgbouncer=true`) not the direct one. Serverless opens fresh connections per invocation.

**"Backend unreachable" in the dashboard**
→ Verify `INTERNAL_API_URL` and `NEXT_PUBLIC_API_URL` in Vercel env vars. They must include `/api` suffix and match the path your backend is mounted at — `/_/backend/api/` for Path A, `/api/` for Path B.

**Anna says "I'd love to help, but my AI brain isn't connected"**
→ `ANTHROPIC_API_KEY` not set on the backend service. Add it in Vercel env vars (Path A) or `.env` on VPS (Path B), then redeploy / restart.

**Vapi webhook 502 / 504**
→ Path A: confirm `maxDuration: 60` in `backend/vercel.json` and your plan supports it. Path B: bump Caddy `request_body max_size` if transcripts are huge.

**Migrations error on first deploy**
→ Path A: run them locally with `DATABASE_URL=<neon-url>` once. Path B: container automatically migrates on boot — check `docker compose logs backend`.

---

## Going further

- **Per-business deploys (single-tenant):** clone this stack, give each business their own Vercel project + Neon DB + Vapi assistant + DNS subdomain. ~$10–20/mo per tenant.
- **Multi-tenant SaaS:** add row-level filtering on `business_id`, auth (NextAuth.js or django-allauth), and Stripe billing. Out of scope for this OSS today.
- **Self-host on your own laptop:** dev `docker-compose.yml` works as-is. `ngrok http 8000` lets Vapi hit your laptop directly.

Questions? Open an issue or [book a call](https://calendly.com/contact-codewithmuh/30min).
