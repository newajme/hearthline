# AGENTS-IMPROVEMENT-SPEC.md

Concrete improvements to agent-facing documentation and tooling, based on an
audit of `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `DEPLOY.md`, CI config,
and the codebase as of 2026-05-08.

---

## Audit summary

### What's good

- `CLAUDE.md` is thorough: stack, repo layout, endpoints, agent loop, coding
  conventions, "what NOT to add", brand rules, lessons learned, roadmap.
- Explicit brand rules prevent common mistakes (Anna persona, no PII on
  marketing page, no fake testimonials, no competitor comparisons).
- `CONTRIBUTING.md` has a solid PR checklist and code style section.
- `DEPLOY.md` covers both deploy paths with env var docs, rotation guidance,
  and a troubleshooting section.
- `.env.example` is well-documented with inline generation commands.
- `scripts/test-quickstart.sh` smoke-tests the full docker-compose stack.
- Backend tests exist (`apps/calls/tests/`).

### What's missing

1. **`AGENTS.md` didn't exist** — no agent-facing entry point. Created in this
   session; see `AGENTS.md`.
2. **Backend CI job** — CI only runs TypeScript check + Next.js build. Django
   tests have no automated gate.
3. **Root `vercel.json`** — `DEPLOY.md` and `CLAUDE.md` reference it, but the
   file is absent from the repo. Vercel Path A deploy is broken without it.
4. **`support/` app undocumented in `CLAUDE.md`** — the app exists and is
   referenced in `README.md` but `CLAUDE.md`'s repo layout omits it entirely.
5. **`seed_admin` command undocumented in `CLAUDE.md`** — README mentions it,
   CLAUDE.md doesn't.
6. **`scripts/` directory undocumented in `CLAUDE.md`** — the repo layout
   section omits it.
7. **Branch and PR naming conventions** — not documented anywhere.
8. **Test-running instructions** — not in `CLAUDE.md` or `AGENTS.md` (now
   added to `AGENTS.md`).

### What's wrong

1. **License contradiction** — `CLAUDE.md` says "MIT licensed" but the actual
   license is AGPL-3.0 with a commercial option (`LICENSE`, `COMMERCIAL.md`,
   `README.md` all say AGPL-3.0). Any agent reading only `CLAUDE.md` will
   generate incorrect license headers.
2. **Root `vercel.json` referenced but absent** — `CLAUDE.md` lists it in the
   repo layout tree; it doesn't exist. Path A deploy fails silently.
3. **Tool count mismatch** — `CLAUDE.md` lists 5 Anna tools; the actual
   `tools.py` defines 7 (`qualify_lead`, `check_availability`,
   `book_appointment`, `draft_quote`, `send_sms`, `send_email`, `end_call`).
   README correctly says 7.
4. **`CLAUDE.md` repo layout is stale** — missing `support/`, `scripts/`,
   `COMMERCIAL.md`, `solar-pakistan-knowledge-base.md`.

---

## Improvement tasks

### P0 — Correctness (breaks things if not fixed)

#### 1. Fix license statement in `CLAUDE.md`

**File:** `CLAUDE.md`, "What this project is" section.

Change:
```
MIT licensed. Built in public.
```
To:
```
AGPL-3.0 licensed (commercial license available). Built in public.
```

**Why:** Agents generating license headers, README sections, or legal copy
will produce incorrect output if they read the wrong license from `CLAUDE.md`.

---

#### 2. Create root `vercel.json`

**File:** `vercel.json` (repo root) — currently absent.

`DEPLOY.md` documents a multi-service Vercel deploy where the root
`vercel.json` declares both the Next.js frontend and the Django backend. The
file is referenced in `CLAUDE.md`'s repo layout but doesn't exist, so Path A
deploy is broken.

Required structure (adapt to actual Vercel multi-service schema):

```json
{
  "version": 2,
  "projects": [
    {
      "src": "frontend",
      "use": "@vercel/next"
    },
    {
      "src": "backend",
      "use": "@vercel/python",
      "routePrefix": "/_/backend"
    }
  ]
}
```

Verify against Vercel's current multi-service docs before shipping — the
schema has changed across Vercel versions.

---

#### 3. Fix tool count in `CLAUDE.md`

**File:** `CLAUDE.md`, "How Anna's agent loop works" section.

Change:
```
Claude can call tools (`qualify_lead`, `check_availability`,
`book_appointment`, `send_sms`, `end_call`).
```
To:
```
Claude can call tools (`qualify_lead`, `check_availability`,
`book_appointment`, `draft_quote`, `send_sms`, `send_email`, `end_call`).
```

---

### P1 — Completeness (agents produce incomplete output without these)

#### 4. Add backend CI job

**File:** `.github/workflows/ci.yml`

Add a `backend` job that runs Django tests on every push/PR to `main`:

```yaml
backend:
  name: Backend (Django)
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:16
      env:
        POSTGRES_DB: hearthline_test
        POSTGRES_USER: hearthline
        POSTGRES_PASSWORD: hearthline_test
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
      ports:
        - 5432:5432
  defaults:
    run:
      working-directory: backend
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-python@v5
      with:
        python-version: '3.12'
        cache: pip
        cache-dependency-path: backend/requirements.txt
    - run: pip install -r requirements.txt
    - run: python manage.py test apps.calls.tests --verbosity=2
      env:
        DJANGO_SECRET_KEY: ci-only-not-for-production
        DJANGO_DEBUG: "1"
        DATABASE_URL: postgres://hearthline:hearthline_test@localhost:5432/hearthline_test
        HEARTHLINE_ENCRYPTION_KEY: ""
```

---

#### 5. Update `CLAUDE.md` repo layout

**File:** `CLAUDE.md`, "Repo layout" section.

Add the missing entries:
- `COMMERCIAL.md` — commercial license terms
- `AGENTS.md` — agent entry point (this file)
- `scripts/test-quickstart.sh` — smoke-test script
- `solar-pakistan-knowledge-base.md` — domain knowledge file
- `backend/apps/support/` — Tickets, threaded messages, WhatsApp/SMS/email webhooks

Also update the `calls/agent/tools.py` comment from "5 tool schemas" to "7 tool schemas".

---

#### 6. Document `support/` app in `CLAUDE.md`

**File:** `CLAUDE.md`, "Repo layout" and "Key URLs / endpoints" sections.

Add to repo layout under `backend/apps/`:
```
├── support/             # Ticket, TicketMessage — WhatsApp/SMS/email/chat webhooks + reply
```

Add to Key URLs:
```
GET  /api/support/tickets/
GET/PATCH /api/support/tickets/<id>/
POST /api/support/webhooks/whatsapp/
POST /api/support/webhooks/email/
```

---

#### 7. Document `seed_admin` in `CLAUDE.md`

**File:** `CLAUDE.md`, "Commands" section.

Add after the `seed_demo` line:
```bash
docker compose exec backend python manage.py seed_admin
# Default credentials: admin / hearthline (override with HEARTHLINE_ADMIN_PASSWORD)
```

---

#### 8. Add branch and PR naming conventions

**File:** `CONTRIBUTING.md`

Add a "Branch naming" section:

```markdown
## Branch naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<short-description>` | `feature/stripe-deposit` |
| Bug fix | `fix/<short-description>` | `fix/anna-sms-dedup` |
| Docs | `docs/<short-description>` | `docs/deploy-guide` |
| Chore | `chore/<short-description>` | `chore/bump-anthropic` |

PR titles follow the same prefix: `feature:`, `fix:`, `docs:`, `chore:`.
```

---

### P2 — Quality of life

#### 9. Add `AGENTS.md` reference to `CLAUDE.md`

**File:** `CLAUDE.md`, top of file.

Add a one-liner after the title:
```
> Agent entry point: see `AGENTS.md` for a concise quick-start.
```

---

#### 10. Add linting to CI

**File:** `.github/workflows/ci.yml`

Frontend: add `npx eslint . --max-warnings 0` (requires ESLint config — check
if one exists before adding).

Backend: add `pip install ruff && ruff check .` as a separate step in the
backend job. Ruff is fast and zero-config for PEP 8.

---

#### 11. Document the `solar-pakistan-knowledge-base.md` file

**File:** `CLAUDE.md`

Add a note explaining what this file is and how Anna uses it:
```
solar-pakistan-knowledge-base.md  # Domain knowledge injected into Anna's system prompt
                                  # for solar / energy-renovation calls in Pakistan.
                                  # Edit this to update pricing, subsidy rules, service area.
```

---

## Priority order

| # | Task | Priority | Effort |
|---|------|----------|--------|
| 1 | Fix license in `CLAUDE.md` | P0 | 1 min |
| 2 | Create root `vercel.json` | P0 | 30 min |
| 3 | Fix tool count in `CLAUDE.md` | P0 | 1 min |
| 4 | Add backend CI job | P1 | 30 min |
| 5 | Update `CLAUDE.md` repo layout | P1 | 10 min |
| 6 | Document `support/` app in `CLAUDE.md` | P1 | 10 min |
| 7 | Document `seed_admin` in `CLAUDE.md` | P1 | 5 min |
| 8 | Branch/PR naming conventions | P1 | 10 min |
| 9 | `AGENTS.md` reference in `CLAUDE.md` | P2 | 2 min |
| 10 | Add linting to CI | P2 | 20 min |
| 11 | Document knowledge-base file | P2 | 5 min |
