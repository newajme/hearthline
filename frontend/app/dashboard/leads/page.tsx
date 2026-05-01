import Link from "next/link";

import { fetchJson, fmtAge, fmtMoney, type Lead, type Page } from "../lib";
import { LeadActionPill } from "../parts";

const STATUSES = ["all", "new", "qualifying", "quoted", "booked", "won", "lost"];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const data = await fetchJson<Page<Lead>>("/leads/");
  let leads = data?.results ?? [];

  if (params.status) leads = leads.filter((l) => l.status === params.status);
  if (params.q) {
    const q = params.q.toLowerCase();
    leads = leads.filter(
      (l) =>
        (l.customer?.name ?? "").toLowerCase().includes(q) ||
        (l.customer?.phone ?? "").toLowerCase().includes(q) ||
        (l.customer?.email ?? "").toLowerCase().includes(q) ||
        l.project_summary.toLowerCase().includes(q),
    );
  }

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Leads</h1>
          <p>Every inbound captured and qualified by Hearthline.</p>
        </div>
        <div className="app-pagebar-actions">
          <a href="http://localhost:8000/admin/leads/lead/add/" target="_blank" rel="noreferrer" className="btn btn-primary">+ New lead</a>
        </div>
      </div>

      <div className="app-content">
        <form className="app-toolbar" method="get">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by name, phone, email, summary…"
            className="search-input"
          />
          <div className="tag-row" style={{ display: "flex" }}>
            {STATUSES.map((s) => {
              const active = (params.status ?? "all") === s;
              const href = s === "all" ? "/dashboard/leads" : `/dashboard/leads?status=${s}`;
              return (
                <Link key={s} href={href} className={`tag-chip ${active ? "active" : ""}`}>
                  {s}
                </Link>
              );
            })}
          </div>
        </form>

        <section className="app-table">
          <div className="app-table-head">
            <span>Customer</span>
            <span>Project</span>
            <span>Value</span>
            <span style={{ textAlign: "right" }}>Status</span>
          </div>
          {leads.length === 0 ? (
            <div className="empty-card" style={{ borderRadius: 0, border: "none", background: "white" }}>
              <h3>No leads match these filters</h3>
              <p>Clear filters or seed demo data with <code>seed_demo</code>.</p>
            </div>
          ) : (
            leads.map((lead) => (
              <Link href={`/dashboard/leads/${lead.id}`} key={lead.id} className="app-table-row">
                <div className="app-row-customer">
                  <span className="app-row-avatar">{(lead.customer?.name || "?").slice(0, 1).toUpperCase()}</span>
                  <div>
                    <div className="app-row-title">{lead.customer?.name || "Unknown"}</div>
                    <div className="app-row-sub">{lead.customer?.phone || lead.customer?.email || "—"}</div>
                  </div>
                </div>
                <div>
                  <div className="app-row-title app-row-title-soft">{lead.project_summary || "(no summary)"}</div>
                  <div className="app-row-sub">{fmtAge(lead.created_at)} · {lead.temperature}</div>
                </div>
                <div className="app-row-value">{fmtMoney(lead.estimated_value)}</div>
                <div className="app-row-action">
                  <LeadActionPill lead={lead} />
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </>
  );
}
