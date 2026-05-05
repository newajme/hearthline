import Link from "next/link";

import { getT } from "../lib/i18n-server";
import { MarketingFooter, MarketingTopbar } from "../MarketingShell";
import ArchitectureOverview from "./ArchitectureOverview";

export const metadata = {
  title: "Docs",
  description:
    "Self-host Hearthline — Django 5 + DRF backend, Next.js 15 frontend, Vapi + Twilio voice. Stack, architecture, quick start, roadmap.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Hearthline · Docs",
    description: "Self-host Hearthline. Stack, architecture, quick start, roadmap.",
    url: "/docs",
  },
};

const GITHUB_URL = "https://github.com/codewithmuh/hearthline";
const YT_URL = "https://www.youtube.com/@codewithmuh";
const REPO_TREE = "https://github.com/codewithmuh/hearthline/blob/main";

const STACK = [
  {
    tag: "Backend",
    title: "Django 5 + DRF",
    body: "5 apps · 8 models · Vapi custom-LLM endpoint · Twilio webhooks · service layer for Claude orchestration + OpenAI Vision.",
    codeHint: "backend/apps/",
    href: `${REPO_TREE}/backend/apps`,
  },
  {
    tag: "Frontend",
    title: "Next.js 15 + React 19",
    body: "App Router, server components, real-time dashboard with KPIs, lead detail, quote line items, customers, settings.",
    codeHint: "frontend/app/dashboard/",
    href: `${REPO_TREE}/frontend/app/dashboard`,
  },
  {
    tag: "Voice",
    title: "Vapi + Twilio (custom-LLM mode)",
    body: "Vapi POSTs every conversation turn to /api/calls/vapi/chat/completions/. Anna runs an agentic loop server-side and returns the next utterance plus optional X-Vapi-End-Call header.",
    codeHint: "apps/calls/views.py · chat_completions",
    href: `${REPO_TREE}/backend/apps/calls/views.py`,
  },
  {
    tag: "AI Pipeline",
    title: "Anna · Claude Sonnet 4.6 + GPT-4o vision",
    body: "5-tool loop (qualify_lead, check_availability, book_appointment, send_sms, end_call). Tools persist Customer, Lead, Conversation rows in real time.",
    codeHint: "apps/calls/agent/{prompts,tools,receptionist}.py",
    href: `${REPO_TREE}/backend/apps/calls/agent`,
  },
  {
    tag: "Database",
    title: "Postgres 16",
    body: "Single docker volume. Seed command included — one shell command and you have 8 leads, 5 calls, 4 quotes to play with.",
    codeHint: "manage.py seed_demo --wipe",
    href: `${REPO_TREE}/backend/apps/leads/management/commands/seed_demo.py`,
  },
  {
    tag: "Infra",
    title: "Docker Compose",
    body: "Three services: db, backend, frontend. Hot-reload mounted on both apps. No build tooling, no Vercel config required.",
    codeHint: "docker-compose.yml",
    href: `${REPO_TREE}/docker-compose.yml`,
  },
];

const PIPELINE = [
  {
    stage: "Inbound call",
    code: "Vapi · custom-LLM mode",
    body: "Vapi handles STT + TTS. The caller hears Anna in the voice you picked, in the language you configured.",
    href: `${REPO_TREE}/backend/apps/calls/views.py`,
  },
  {
    stage: "Every turn POSTs the transcript",
    code: "POST /api/calls/vapi/chat/completions/",
    body: "OpenAI-compatible payload. Django converts it to Claude format and runs the agent loop.",
    href: `${REPO_TREE}/backend/apps/calls/views.py`,
  },
  {
    stage: "Anna decides what to do next",
    code: "agent/receptionist.py",
    body: "Claude Sonnet 4.6 picks from 5 tools — qualify_lead, check_availability, book_appointment, send_sms, end_call — or speaks.",
    href: `${REPO_TREE}/backend/apps/calls/agent/receptionist.py`,
  },
  {
    stage: "Tools write to the database",
    code: "services/persistence.py",
    body: "qualify_lead creates/updates Customer + Lead + Conversation. book_appointment confirms a slot. Every fact Anna learned is persisted.",
    href: `${REPO_TREE}/backend/apps/calls/services/persistence.py`,
  },
  {
    stage: "Dashboard updates live",
    code: "GET /api/leads/ · GET /api/calls/",
    body: "Server component re-fetches, action pill flips to Qualified / Quote Sent / Booked / Won.",
    href: `${REPO_TREE}/frontend/app/dashboard`,
  },
];

const ROADMAP = {
  done: [
    "Django data model (Business, Channel, Customer, Lead, Conversation, Message, Call, Quote, LineItem)",
    "Vapi + Twilio webhook handlers with structured-JSON Claude extraction",
    "OpenAI Vision pipeline → drafted quote with line items, tax, total",
    "Next.js dashboard: Overview, Leads, Calls, Quotes, Customers, Support, Settings",
    "Support tickets app — WhatsApp / SMS / email / web-chat threads with status workflow and agent reply that posts back through the original channel",
    "Lead-detail conversation timeline + extracted_fields inspector",
    "seed_demo management command for instant believable data",
    "Docker Compose 3-service stack with hot-reload",
  ],
  wip: [
    "Stripe checkout for deposit collection on quote acceptance",
    "Outbound SMS / WhatsApp via Twilio for quote delivery",
    "Multi-tenant auth (today: single business, no login)",
    "PDF rendering for the customer-facing quote",
  ],
  todo: [
    "Subsidy lookup integration (solar / energy renovation)",
    "Tech dispatch + GPS routing for booked jobs",
    "Review request automation (Google + Trustpilot webhooks)",
    "Eval harness for the Claude extraction prompt",
  ],
};

function buildToc(t: (k: string) => string) {
  return [
    { id: "quickstart", label: t("docs.toc.quickstart"), group: t("docs.tocStarted") },
    { id: "architecture", label: t("docs.toc.architecture"), group: t("docs.tocStarted") },
    { id: "stack", label: t("docs.toc.stack"), group: t("docs.tocConcepts") },
    { id: "pipeline", label: t("docs.toc.pipeline"), group: t("docs.tocConcepts") },
    { id: "voice", label: t("docs.toc.voice"), group: t("docs.tocIntegrations") },
    { id: "demo-data", label: t("docs.toc.demoData"), group: t("docs.tocIntegrations") },
    { id: "roadmap", label: t("docs.toc.roadmap"), group: t("docs.tocProject") },
    { id: "license", label: t("docs.toc.license"), group: t("docs.tocProject") },
  ];
}

export default async function DocsPage() {
  const { t } = await getT();
  const TOC = buildToc(t);
  const groups = Array.from(new Set(TOC.map((x) => x.group)));

  return (
    <>
      <MarketingTopbar
        ossPill="AGPL-3.0"
        links={[
          { href: "/", label: t("nav.how").startsWith("How") ? "Home" : "Home" },
          { href: "#quickstart", label: t("docs.toc.quickstart") },
          { href: "#stack", label: t("docs.toc.stack") },
          { href: "#pipeline", label: t("docs.toc.pipeline") },
          { href: "#roadmap", label: t("docs.toc.roadmap") },
        ]}
      />

      <main className="docs-main">
        <div className="docs-shell">
          <aside className="docs-toc" aria-label="Documentation table of contents">
            <div className="docs-toc-inner">
              {groups.map((g) => (
                <div className="docs-toc-group" key={g}>
                  <p className="docs-toc-group-label">{g}</p>
                  <ul>
                    {TOC.filter((t) => t.group === g).map((t) => (
                      <li key={t.id}>
                        <a href={`#${t.id}`} className="docs-toc-link">
                          {t.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="docs-toc-foot">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="docs-toc-cta"
                >
                  {t("docs.toc.starGh")}
                </a>
                <a href={YT_URL} target="_blank" rel="noreferrer" className="docs-toc-yt">
                  {t("docs.toc.buildAlong")}
                </a>
              </div>
            </div>
          </aside>

          <article className="docs-body">
            <header className="docs-hero">
              <span className="docs-hero-eyebrow">
                <span className="dot" /> {t("docs.eyebrow")}
              </span>
              <h1 className="docs-hero-title">{t("docs.title")}</h1>
              <p className="docs-hero-sub">{t("docs.sub")}</p>
            </header>

            <section id="quickstart" className="docs-section">
              <h2 className="docs-h2">{t("docs.h.quickstart")}</h2>
              <pre className="docs-code">
                <code>{`# 1 — clone
git clone https://github.com/codewithmuh/hearthline.git
cd hearthline

# 2 — copy the env template (works without API keys)
cp .env.example .env

# 3 — bring it up
docker compose up --build

#   http://localhost:3000        Next.js dashboard
#   http://localhost:8000/admin  Django admin
#   http://localhost:8000/api    REST API`}</code>
              </pre>
              <div className="docs-next-cards">
                <a href="#voice" className="docs-next-card">
                  <strong>{t("docs.next.vapi")}</strong>
                  <span>{t("docs.next.vapiSub")}</span>
                </a>
                <a href="#demo-data" className="docs-next-card">
                  <strong>{t("docs.next.seed")}</strong>
                  <span>{t("docs.next.seedSub")}</span>
                </a>
                <a
                  href={`${REPO_TREE}/DEPLOY.md`}
                  target="_blank"
                  rel="noreferrer"
                  className="docs-next-card"
                >
                  <strong>{t("docs.next.deploy")}</strong>
                  <span>{t("docs.next.deploySub")}</span>
                </a>
              </div>
            </section>

            <section id="architecture" className="docs-section">
              <h2 className="docs-h2">{t("docs.h.architecture")}</h2>
              <p className="docs-p">{t("docs.archP")}</p>
              <ArchitectureOverview />
            </section>

            <section id="stack" className="docs-section">
              <h2 className="docs-h2">{t("docs.h.stack")}</h2>
              <p className="docs-p">{t("docs.stackP")}</p>
              <div className="docs-stack-grid">
                {STACK.map((s) => (
                  <article className="docs-stack-card" key={s.title}>
                    <span className="docs-stack-tag">{s.tag}</span>
                    <h3 className="docs-stack-title">{s.title}</h3>
                    <p className="docs-stack-body">{s.body}</p>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="docs-stack-code"
                    >
                      <code>{s.codeHint}</code>
                      <span aria-hidden>↗</span>
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section id="pipeline" className="docs-section">
              <h2 className="docs-h2">{t("docs.h.pipeline")}</h2>
              <p className="docs-p">{t("docs.pipelineP")}</p>
              <ol className="docs-pipeline">
                {PIPELINE.map((s, i) => (
                  <li key={s.stage} className="docs-pipeline-step">
                    <span className="docs-pipeline-num">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="docs-pipeline-stage">{s.stage}</div>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="docs-pipeline-code"
                      >
                        <code>{s.code}</code>
                        <span aria-hidden>↗</span>
                      </a>
                      <p className="docs-pipeline-body">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section id="voice" className="docs-section">
              <h2 className="docs-h2">{t("docs.h.voice")}</h2>
              <p className="docs-p">{t("docs.voiceP1")}</p>
              <pre className="docs-code docs-code-mini">
                <code>https://&lt;your-host&gt;/api/calls/webhooks/vapi/</code>
              </pre>
              <p className="docs-p">
                {t("docs.voiceP2.pre")}{" "}
                <code>/api/calls/vapi/chat/completions/</code>{t("docs.voiceP2.post")}
              </p>
            </section>

            <section id="demo-data" className="docs-section">
              <h2 className="docs-h2">{t("docs.h.demoData")}</h2>
              <p className="docs-p">{t("docs.demoP")}</p>
              <pre className="docs-code docs-code-mini">
                <code>{`docker compose exec backend \\
  python manage.py seed_demo --wipe`}</code>
              </pre>
            </section>

            <section id="roadmap" className="docs-section">
              <h2 className="docs-h2">{t("docs.h.roadmap")}</h2>
              <p className="docs-p">{t("docs.roadmapP")}</p>
              <div className="docs-roadmap">
                <RoadmapCol title={t("docs.roadmap.shipped")} tone="done" items={ROADMAP.done} />
                <RoadmapCol title={t("docs.roadmap.wip")} tone="wip" items={ROADMAP.wip} />
                <RoadmapCol title={t("docs.roadmap.todo")} tone="todo" items={ROADMAP.todo} />
              </div>
            </section>

            <section id="license" className="docs-section">
              <h2 className="docs-h2">{t("docs.h.license")}</h2>
              <p className="docs-p">
                {t("docs.licenseP.pre")}
                <a
                  href={`${GITHUB_URL}/blob/main/LICENSE`}
                  target="_blank"
                  rel="noreferrer"
                >
                  GNU AGPL-3.0
                </a>
                {t("docs.licenseP.mid")}
                <a href="mailto:contact@codewithmuh.com">contact@codewithmuh.com</a>
                {t("docs.licenseP.post")}
              </p>
              <div className="docs-cta">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  {t("docs.cloneCta")}
                </a>
                <Link href="/login" className="btn btn-ghost">
                  {t("docs.signinCta")}
                </Link>
              </div>
            </section>
          </article>
        </div>

        <MarketingFooter />
      </main>
    </>
  );
}

function RoadmapCol({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "done" | "wip" | "todo";
  items: string[];
}) {
  const symbol = tone === "done" ? "✓" : tone === "wip" ? "·" : "○";
  return (
    <div className={`docs-roadmap-col tone-${tone}`}>
      <h3>
        {title} <span className="docs-roadmap-count">{items.length}</span>
      </h3>
      <ul>
        {items.map((it) => (
          <li key={it}>
            <span className="docs-roadmap-bullet">{symbol}</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
