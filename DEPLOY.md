# Deploying Hearthline

Two supported paths — pick the one that matches your operations.

| Path | Cost | Best for |
|------|------|----------|
| **A — Vercel frontend + Docker Compose VPS backend** *(recommended)* | $6 VPS + Vercel free | No cold starts, persistent Vapi webhooks, full Django admin |
| B — All on Vercel (frontend + Django serverless) | Free + Postgres ~$10/mo | Zero-VPS, demo only — cold starts affect voice calls |

---

## Path A — Vercel frontend + Docker Compose VPS backend (recommended)

The Next.js frontend deploys to Vercel (free). The Django backend runs on a
small VPS via Docker Compose + Caddy (auto-HTTPS). This is the most reliable
path for real voice calls — no cold starts, no 60s serverless timeout.

The repo ships with everything needed:

- `vercel.json` (root) — Next.js frontend config, proxies `/api/*` to your VPS
- `docker-compose.prod.yml` — Django + Caddy production stack
- `Caddyfile` — auto-HTTPS via Let's Encrypt

### a. Provision a VPS

Any $6/mo VPS works (Hetzner CX22, DigitalOcean Droplet, Vultr). Ubuntu 22.04 LTS recommended.

Install Docker:
```bash
curl -fsSL https://get.docker.com | sh
```

### b. Deploy the backend on the VPS

```bash
git clone https://github.com/codewithmuh/hearthline.git && cd hearthline
cp .env.example .env && nano .env   # fill in required vars (see below)
docker compose -f docker-compose.prod.yml up -d --build
```

Point DNS:
```
api.hearthline.codewithmuh.com  →  <your-vps-ip>
```

Caddy issues a Let's Encrypt cert on first request — HTTPS in ~30s.

Run migrations + seed:
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_demo --wipe
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_admin
```

Required `.env` vars on the VPS:

```
DJANGO_SECRET_KEY=<openssl rand -base64 50>
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=api.hearthline.codewithmuh.com
DJANGO_CORS_ALLOWED_ORIGINS=https://hearthline.codewithmuh.com

# REQUIRED — encrypts per-business API keys at rest.
# Generate: python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'
# Set once, back it up, never rotate — rotating invalidates all saved credentials.
HEARTHLINE_ENCRYPTION_KEY=<paste output>

# REQUIRED if wiring Vapi — shared secret for webhook + custom-LLM auth.
# Generate: openssl rand -hex 32
# Paste the same value into vapi.ai → assistant → Server URL → Secret.
VAPI_WEBHOOK_SECRET=<paste output>

API_DOMAIN=api.hearthline.codewithmuh.com
FRONTEND_ORIGIN=https://hearthline.codewithmuh.com

ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
VAPI_API_KEY=...
VAPI_PHONE_NUMBER_ID=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...

DATABASE_URL=postgres://hearthline:<password>@localhost:5432/hearthline
# Or use POSTGRES_* vars if running Postgres in Docker Compose
```

Set these environment variables in Vercel (Production):

```
# Frontend → Backend (your VPS)
NEXT_PUBLIC_API_URL=https://api.hearthline.codewithmuh.com/api
INTERNAL_API_URL=https://api.hearthline.codewithmuh.com/api
NEXT_PUBLIC_ADMIN_URL=https://api.hearthline.codewithmuh.com/admin
```

4. Add a custom domain in Vercel → `hearthline.codewithmuh.com` → point DNS CNAME to `cname.vercel-dns.com`.
5. Push to `main` — Vercel auto-deploys on every push.

### d. Wire Vapi to the VPS backend

| Field | Value |
|------|-------|
| Custom LLM URL | `https://api.hearthline.codewithmuh.com/api/calls/vapi/chat/completions/` |
| Server URL | `https://api.hearthline.codewithmuh.com/api/calls/webhooks/vapi/` |
| Model | `claude-sonnet-4-6` |
| First message | `Hi, this is Anna. How can I help?` |

Buy a phone number on Vapi → attach the assistant → call it.

---

## Path B — All on Vercel (frontend + Django serverless)

Use this only for a zero-VPS demo. Voice calls may hit cold starts (~2s delay
on first call after idle). The 60s function timeout is already configured in
`backend/vercel.json`.

If you outgrow Vercel's serverless constraints (long Vapi calls, large transcripts, full Django admin with media uploads), switch to Path A.

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
