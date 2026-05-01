import Link from "next/link";

import { fetchJson, fmtAge, type Call, type Page } from "../lib";
import { StatusPill } from "../parts";

export default async function CallsPage({ searchParams }: { searchParams: Promise<{ provider?: string; q?: string }> }) {
  const params = await searchParams;
  const data = await fetchJson<Page<Call>>("/calls/");
  let calls = data?.results ?? [];

  if (params.provider) calls = calls.filter((c) => c.provider === params.provider);
  if (params.q) {
    const q = params.q.toLowerCase();
    calls = calls.filter(
      (c) =>
        (c.from_number ?? "").toLowerCase().includes(q) ||
        (c.transcript ?? "").toLowerCase().includes(q) ||
        (c.summary ?? "").toLowerCase().includes(q),
    );
  }

  const totalDuration = calls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0);
  const completed = calls.filter((c) => c.status === "completed").length;

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Calls</h1>
          <p>Voice and SMS interactions captured by Anna.</p>
        </div>
        <div className="app-pagebar-actions">
          <Link href="/dashboard/test-call" className="btn btn-primary">▶ Test Anna</Link>
        </div>
      </div>

      <div className="app-content">
        <div className="detail-grid">
          <div className="detail-card">
            <div className="detail-card-label">Total Calls</div>
            <div className="detail-card-value">{calls.length}</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">Completed</div>
            <div className="detail-card-value">{completed}</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">Total Duration</div>
            <div className="detail-card-value">{Math.round(totalDuration / 60)}m</div>
          </div>
        </div>

        <form className="app-toolbar" method="get">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search transcripts, numbers, summaries…"
            className="search-input"
          />
          <div className="tag-row" style={{ display: "flex" }}>
            {["all", "vapi", "twilio"].map((p) => {
              const active = (params.provider ?? "all") === p;
              const href = p === "all" ? "/dashboard/calls" : `/dashboard/calls?provider=${p}`;
              return (
                <Link key={p} href={href} className={`tag-chip ${active ? "active" : ""}`}>
                  {p}
                </Link>
              );
            })}
          </div>
        </form>

        <section className="app-table">
          <div className="app-table-head cols-calls">
            <span>Caller</span>
            <span>Provider</span>
            <span>Summary</span>
            <span style={{ textAlign: "right" }}>Status</span>
          </div>
          {calls.length === 0 ? (
            <div className="empty-card" style={{ borderRadius: 0, border: "none", background: "white" }}>
              <h3>No calls match these filters</h3>
              <p>Wire a Vapi or Twilio webhook to <code>/api/calls/webhooks/vapi/</code>.</p>
            </div>
          ) : (
            calls.map((c) => (
              <div key={c.id} className="app-table-row cols-calls">
                <div className="app-row-customer">
                  <span className="app-row-avatar" style={{ fontSize: 14 }}>📞</span>
                  <div>
                    <div className="app-row-title">{c.from_number || "unknown"}</div>
                    <div className="app-row-sub">→ {c.to_number || "—"}</div>
                  </div>
                </div>
                <div><span className="tag" style={{ marginLeft: 0 }}>{c.provider}</span></div>
                <div>
                  <div className="app-row-title app-row-title-soft">
                    {c.summary || (c.transcript ? c.transcript.slice(0, 160) + "…" : "(no transcript)")}
                  </div>
                  <div className="app-row-sub">{fmtAge(c.started_at)} · {c.duration_seconds ? `${c.duration_seconds}s` : "—"}</div>
                </div>
                <div className="app-row-action">
                  <StatusPill status={c.status} />
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}
