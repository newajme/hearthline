"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Business } from "../lib";

const KIND_OPTIONS = ["phone", "sms", "whatsapp", "email", "chat"];

type Channel = Business["channels"][number];

export default function ChannelsEditor({ business }: { business: Business }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New-channel draft
  const [draftKind, setDraftKind] = useState("phone");
  const [draftAddr, setDraftAddr] = useState("");

  async function add() {
    if (!draftAddr.trim()) return;
    setBusy("add");
    setError(null);
    const res = await fetch("/api/proxy/channels/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business: business.id, kind: draftKind, address: draftAddr.trim(), is_active: true }),
    });
    setBusy(null);
    if (!res.ok) {
      const text = await res.text();
      setError(text || `HTTP ${res.status}`);
      return;
    }
    setDraftAddr("");
    router.refresh();
  }

  async function toggle(ch: Channel) {
    setBusy(`t${ch.id}`);
    setError(null);
    const res = await fetch(`/api/proxy/channels/${ch.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !ch.is_active }),
    });
    setBusy(null);
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    router.refresh();
  }

  async function remove(ch: Channel) {
    if (!confirm(`Remove ${ch.kind} channel "${ch.address}"?`)) return;
    setBusy(`d${ch.id}`);
    setError(null);
    const res = await fetch(`/api/proxy/channels/${ch.id}/`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    router.refresh();
  }

  return (
    <article className="dash-card">
      <div className="dash-card-head">
        <h2>Channels</h2>
        <span className="dash-card-meta">{business.channels.length} configured</span>
      </div>
      {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}
      {business.channels.length === 0 ? (
        <p className="kv-value-muted" style={{ fontSize: 13.5, margin: 0 }}>
          No channels yet — add one below.
        </p>
      ) : (
        <ul className="channels-list">
          {business.channels.map((ch) => (
            <li key={ch.id}>
              <span className="channel-icon">{glyph(ch.kind)}</span>
              <div className="channels-meta">
                <div className="channels-kind">{ch.kind}</div>
                <div className="channels-addr">{ch.address}</div>
              </div>
              <button
                type="button"
                className={`pill pill-${ch.is_active ? "active" : "disabled"} channel-btn`}
                onClick={() => toggle(ch)}
                disabled={busy === `t${ch.id}`}
                title="Toggle active"
              >
                {ch.is_active ? "active" : "disabled"}
              </button>
              <button
                type="button"
                className="channel-remove"
                onClick={() => remove(ch)}
                disabled={busy === `d${ch.id}`}
                aria-label="Remove channel"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="channel-add">
        <select
          className="text-input"
          value={draftKind}
          onChange={(e) => setDraftKind(e.target.value)}
          disabled={busy === "add"}
        >
          {KIND_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <input
          className="text-input"
          value={draftAddr}
          onChange={(e) => setDraftAddr(e.target.value)}
          placeholder={
            draftKind === "email" ? "hi@yourcompany.com"
            : draftKind === "chat" ? "yourcompany.com/chat"
            : "+1 (555) 010-1010"
          }
          disabled={busy === "add"}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={add}
          disabled={busy === "add" || !draftAddr.trim()}
        >
          {busy === "add" ? "Adding…" : "+ Add"}
        </button>
      </div>
    </article>
  );
}

function glyph(kind: string): string {
  switch (kind) {
    case "phone": return "📞";
    case "sms": return "💬";
    case "email": return "✉";
    case "whatsapp": return "🟢";
    case "chat": return "◔";
    default: return "•";
  }
}
