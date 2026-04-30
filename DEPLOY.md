# Deploying Hearthline

This guide covers the production deploy stack the project is wired for:

- **Frontend → Vercel** (free tier works, ~30s deploys)
- **Backend → Railway** (Dockerfile-based, $5/mo hobby plan)
- **Postgres → Railway** (managed, same project)

You can swap any component (Fly.io, Render, Supabase, etc.) — the configs in this repo are the recommended path.

---

## 1. Prerequisites

- A GitHub account (the repo lives there — Vercel + Railway both deploy from GitHub)
- A custom domain you control (e.g. `codewithmuh.com` with a subdomain like `hearthline.codewithmuh.com`)
- API keys (only for the features you want live):
  - `ANTHROPIC_API_KEY` — Anna talking
  - `OPENAI_API_KEY` — photo-quote vision
  - Vapi account + phone number — inbound voice
  - Twilio account + phone number — outbound SMS

---

## 2. Backend on Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo → pick `hearthline`
2. Set the root directory to `backend/` (Railway will read `backend/railway.json` and `backend/Dockerfile.prod`)
3. Add a **Postgres** plugin to the project → Railway auto-injects `DATABASE_URL` and the `POSTGRES_*` vars
4. Set environment variables on the backend service:

```
DJANGO_SECRET_KEY=<generate-a-long-random-string>
DJANGO_DEBUG=0
DJANGO_ALLOWED_HOSTS=api.hearthline.codewithmuh.com,*.up.railway.app
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
VAPI_API_KEY=...
VAPI_PHONE_NUMBER_ID=...
VAPI_WEBHOOK_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
# CORS
DJANGO_CORS_ALLOWED_ORIGINS=https://hearthline.codewithmuh.com
```

5. Generate a public domain (Settings → Networking → Generate Domain) — copy it.
6. Add a custom domain `api.hearthline.codewithmuh.com` and create a CNAME in your DNS pointing to the Railway domain.

The backend deploys automatically on every push to `main`.

---

## 3. Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → Add New Project → Import the same `hearthline` GitHub repo
2. Set the **Root Directory** to `frontend/`
3. Vercel auto-detects Next.js. Set environment variables:

```
INTERNAL_API_URL=https://api.hearthline.codewithmuh.com/api
NEXT_PUBLIC_API_URL=https://api.hearthline.codewithmuh.com/api
```

> `INTERNAL_API_URL` is what server components use; `NEXT_PUBLIC_API_URL` is what the browser uses. Both point to your Railway domain.

4. Add a custom domain `hearthline.codewithmuh.com` (or whatever you chose) → Vercel gives you DNS records to add.
5. Push to `main` → Vercel ships automatically.

---

## 4. Post-deploy

### Seed demo data

```bash
railway run --service backend python manage.py seed_demo --wipe
```

(or run it via the Railway shell tab in the web UI)

### Wire Vapi to the live URL

On your Vapi Assistant:

| Field | Value |
|------|-------|
| Custom LLM URL | `https://api.hearthline.codewithmuh.com/api/calls/vapi/chat/completions/` |
| Server URL | `https://api.hearthline.codewithmuh.com/api/calls/webhooks/vapi/` |
| Model | `claude-sonnet-4-6` |
| First message | `Hi, this is Anna at Rolling Shutters. How can I help?` |

### Custom-domain SMS confirmation

Buy a Twilio number, set `TWILIO_FROM_NUMBER=+1...` on Railway, restart the backend service, place a real test call to the Vapi number. Anna runs `qualify_lead` → `book_appointment` → `send_sms` and the customer gets a real SMS.

---

## 5. Cost ballpark (single-business demo)

| Service | Cost |
|---------|------|
| Railway backend (hobby) | $5/mo |
| Railway Postgres (hobby) | $5/mo (or use the free tier for tiny demos) |
| Vercel frontend | $0 (Hobby) |
| Vapi phone number | ~$2/mo + $0.07/min talk |
| Twilio SMS | ~$0.0079 per SMS |
| Anthropic Claude usage | $3-15/M tokens |
| OpenAI GPT-4o vision | $2.50/M input · $10/M output |
| **Total monthly demo** | **~$15-30/mo** including a few hundred test calls |

---

## 6. Troubleshooting

**Frontend shows "Backend unreachable"**
→ Check `NEXT_PUBLIC_API_URL` and `INTERNAL_API_URL` on Vercel point to your Railway domain. Re-deploy after changing.

**Vapi calls don't trigger the webhook**
→ Confirm the Server URL on the Assistant matches your Railway domain exactly. Check Railway logs (`railway logs`) for incoming POSTs.

**Anna sounds robotic / says "I'd love to help, but my AI brain isn't connected"**
→ `ANTHROPIC_API_KEY` isn't set on Railway, or the key doesn't have access to Claude Sonnet 4.6. Set it and restart the backend service.

**Migration error on first deploy**
→ Railway runs migrations automatically on container start. Check the deploy logs for the actual error. Often it's `DATABASE_URL` not being injected — make sure the Postgres plugin is attached to the project.

---

## 7. Going further

- **Single-tenant per business:** spin up one Railway project per customer, set their business name + Vapi assistant + DNS subdomain. Costs ~$15-30/mo per tenant.
- **Multi-tenant SaaS:** add row-level filtering on `business_id` everywhere, add auth (NextAuth.js), and a billing layer (Stripe). Out of scope for this repo today.
- **Self-host on VPS:** the existing `docker-compose.yml` is production-capable. Pop it on a $5 Hetzner box, add Caddy in front for HTTPS, point your DNS at the IP. Runs forever.

Questions? Open an issue or [book a call](https://calendly.com/contact-codewithmuh/30min).
