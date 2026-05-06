"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Business } from "../lib";
import { patchBusiness } from "./api";

type KeyRow = {
  field: keyof Business;
  label: string;
  hint: string;
  configured: boolean;
  masked: string;
};

export default function ApiKeysCard({ business }: { business: Business }) {
  const router = useRouter();
  const provider = business.llm_provider || "anthropic";
  const usingOpenAI = provider === "openai";
  const allRows: (KeyRow & { hidden?: boolean })[] = [
    {
      field: "anthropic_api_key",
      label: "Anthropic API key",
      hint: "Required — Claude powers Anna and lead extraction.",
      configured: business.has_anthropic_key,
      masked: business.anthropic_api_key,
      hidden: usingOpenAI,
    },
    {
      field: "openai_api_key",
      label: "OpenAI API key",
      hint: "Required — GPT powers Anna and lead extraction.",
      configured: business.has_openai_key,
      masked: business.openai_api_key,
      hidden: !usingOpenAI,
    },
    { field: "vapi_api_key", label: "Vapi API key", hint: "For programmatic call placement (optional).", configured: business.has_vapi_key, masked: business.vapi_api_key },
    { field: "vapi_phone_number_id", label: "Vapi phone number ID", hint: "Public number Vapi answers on.", configured: !!business.vapi_phone_number_id, masked: business.vapi_phone_number_id },
    { field: "twilio_account_sid", label: "Twilio Account SID", hint: "Twilio voice + SMS fallback.", configured: !!business.twilio_account_sid, masked: business.twilio_account_sid },
    { field: "twilio_auth_token", label: "Twilio Auth token", hint: "", configured: business.has_twilio_creds, masked: business.twilio_auth_token },
    { field: "twilio_from_number", label: "Twilio from number", hint: "Outbound caller ID.", configured: !!business.twilio_from_number, masked: business.twilio_from_number },
    { field: "whatsapp_access_token", label: "WhatsApp access token", hint: "Meta Cloud API permanent token. Powers inbound support tickets.", configured: business.has_whatsapp_creds, masked: business.whatsapp_access_token },
    { field: "whatsapp_phone_number_id", label: "WhatsApp phone number ID", hint: "From Meta Business Manager → WhatsApp → API Setup.", configured: !!business.whatsapp_phone_number_id, masked: business.whatsapp_phone_number_id },
    { field: "whatsapp_verify_token", label: "WhatsApp verify token", hint: "Anything you choose — paste the same string into Meta's webhook config.", configured: !!business.whatsapp_verify_token, masked: business.whatsapp_verify_token },
  ];
  const rows: KeyRow[] = allRows.filter((r) => !r.hidden);

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = Object.values(drafts).some((v) => v && v.length > 0);

  function setDraft(field: string, value: string) {
    setDrafts((d) => ({ ...d, [field]: value }));
    setSavedAt(null);
    setError(null);
  }

  async function clearKey(field: string) {
    setSaving(true);
    setError(null);
    const res = await patchBusiness(business.id, { [field]: "__CLEAR__" });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to clear");
      return;
    }
    setDrafts((d) => ({ ...d, [field]: "" }));
    setSavedAt(new Date());
    router.refresh();
  }

  async function saveAll() {
    if (!dirty || saving) return;
    const patch: Record<string, string> = {};
    for (const [k, v] of Object.entries(drafts)) {
      if (v && v.trim()) patch[k] = v.trim();
    }
    setSaving(true);
    setError(null);
    const res = await patchBusiness(business.id, patch);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to save");
      return;
    }
    setDrafts({});
    setSavedAt(new Date());
    router.refresh();
  }

  async function setProvider(next: "anthropic" | "openai") {
    if (next === provider) return;
    setSaving(true);
    setError(null);
    const res = await patchBusiness(business.id, { llm_provider: next });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to switch provider");
      return;
    }
    setSavedAt(new Date());
    router.refresh();
  }

  return (
    <article className="dash-card settings-keys">
      <div className="dash-card-head">
        <h2>Provider API keys</h2>
        <div className="settings-saved">
          {error && <span className="settings-saved-err">{error}</span>}
          {!error && savedAt && <span className="settings-saved-ok">Saved · {savedAt.toLocaleTimeString()}</span>}
          {!error && !savedAt && dirty && <span className="settings-saved-dirty">{Object.values(drafts).filter(Boolean).length} key(s) staged</span>}
        </div>
      </div>

      <div className="provider-toggle" role="radiogroup" aria-label="LLM provider for Anna">
        <span className="provider-toggle-label">LLM provider</span>
        <div className="provider-toggle-options">
          <button
            type="button"
            role="radio"
            aria-checked={provider === "anthropic"}
            className={`provider-pill ${provider === "anthropic" ? "is-active" : ""}`}
            onClick={() => setProvider("anthropic")}
            disabled={saving}
          >
            <strong>Claude</strong>
            <span>Anthropic · {`claude-sonnet-4-6`}</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={provider === "openai"}
            className={`provider-pill ${provider === "openai" ? "is-active" : ""}`}
            onClick={() => setProvider("openai")}
            disabled={saving}
          >
            <strong>OpenAI</strong>
            <span>GPT · gpt-4o</span>
          </button>
        </div>
        <p className="provider-toggle-hint">
          Powers Anna and lead extraction. Switch any time — the unused provider&apos;s key isn&apos;t needed.
        </p>
      </div>

      <p className="settings-keys-hint">
        Stored encrypted-at-rest in your Postgres. Per-business keys override the server&apos;s
        env-var defaults. Leave a field blank to keep the existing value.
      </p>
      <div className="keys-list">
        {rows.map((row) => (
          <KeyRowItem
            key={String(row.field)}
            row={row}
            businessId={business.id}
            value={drafts[String(row.field)] ?? ""}
            onChange={(v) => setDraft(String(row.field), v)}
            onClear={() => clearKey(String(row.field))}
            disabled={saving}
          />
        ))}
      </div>
      <div className="settings-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setDrafts({})} disabled={!dirty || saving}>
          Discard
        </button>
        <button type="button" className="btn btn-primary" onClick={saveAll} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save keys"}
        </button>
      </div>
    </article>
  );
}

function KeyRowItem({
  row, businessId, value, onChange, onClear, disabled,
}: {
  row: KeyRow; businessId: number; value: string; onChange: (v: string) => void; onClear: () => void; disabled: boolean;
}) {
  const [show, setShow] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function reveal() {
    if (revealed !== null) {
      setRevealed(null);
      return;
    }
    setRevealing(true);
    try {
      const res = await fetch(`/api/proxy/businesses/${businessId}/reveal-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: String(row.field) }),
      });
      if (!res.ok) {
        alert(res.status === 403 ? "Staff only — sign in as a staff user to reveal saved keys." : "Failed to reveal key.");
        return;
      }
      const data = await res.json();
      setRevealed(data.value || "");
    } finally {
      setRevealing(false);
    }
  }

  async function copyCurrent() {
    const text = revealed ?? row.masked ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Clipboard blocked by the browser. Long-press to copy manually.");
    }
  }

  async function copyDraft() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Clipboard blocked by the browser.");
    }
  }

  return (
    <div className="key-row">
      <div className="key-row-meta">
        <div className="key-row-label">
          {row.label}
          {row.configured && <span className="key-row-status pill pill-active">configured</span>}
          {!row.configured && <span className="key-row-status pill pill-disabled">not set</span>}
        </div>
        {row.hint && <div className="key-row-hint">{row.hint}</div>}
        {row.configured && row.masked && (
          <div className="key-row-current">
            Current: <code>{revealed ?? row.masked}</code>
            <span className="key-row-current-actions">
              <button
                type="button"
                className="key-row-current-btn"
                onClick={reveal}
                disabled={disabled || revealing}
                title={revealed ? "Hide saved key" : "Show saved key (staff only)"}
              >
                {revealing ? "…" : revealed ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                className={`key-row-current-btn ${copied ? "is-copied" : ""}`}
                onClick={copyCurrent}
                disabled={disabled}
                title="Copy to clipboard"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </span>
          </div>
        )}
      </div>
      <div className="key-row-input">
        <input
          className="text-input"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={row.configured ? "Leave blank to keep current" : "Paste key here"}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="key-row-toggle"
          onClick={() => setShow((s) => !s)}
          disabled={disabled || !value}
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          className="key-row-toggle"
          onClick={copyDraft}
          disabled={disabled || !value}
          aria-label="Copy what you typed"
          title="Copy what you typed"
        >
          Copy
        </button>
        {row.configured && (
          <button
            type="button"
            className="key-row-clear"
            onClick={() => {
              if (confirm(`Clear ${row.label}? Server env-var fallback (if any) will be used after.`)) onClear();
            }}
            disabled={disabled}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
