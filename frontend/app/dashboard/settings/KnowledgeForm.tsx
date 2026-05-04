"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Business } from "../lib";
import { patchBusiness } from "./api";

export default function KnowledgeForm({ business }: { business: Business }) {
  const router = useRouter();
  const initial = business.knowledge_base ?? "";
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = value !== initial;

  async function onSave() {
    if (!dirty || saving) return;
    setSaving(true);
    setError(null);
    const res = await patchBusiness(business.id, { knowledge_base: value });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to save");
      return;
    }
    setSavedAt(new Date());
    router.refresh();
  }

  return (
    <article className="dash-card settings-knowledge">
      <div className="dash-card-head">
        <h2>Knowledge base</h2>
        <div className="settings-saved">
          {error && <span className="settings-saved-err">{error}</span>}
          {!error && savedAt && <span className="settings-saved-ok">Saved · {savedAt.toLocaleTimeString()}</span>}
          {!error && !savedAt && dirty && <span className="settings-saved-dirty">Unsaved changes</span>}
          {!dirty && !savedAt && !error && <span className="dash-card-meta">Used by Anna on every call</span>}
        </div>
      </div>
      <textarea
        className="text-input text-input-area"
        value={value}
        onChange={(e) => { setValue(e.target.value); setSavedAt(null); setError(null); }}
        placeholder="Pricing, service area, hours, common objections — anything Anna should know."
        rows={10}
      />
      <div className="settings-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => { setValue(initial); setError(null); }}
          disabled={!dirty || saving}
        >
          Reset
        </button>
        <button type="button" className="btn btn-primary" onClick={onSave} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save knowledge base"}
        </button>
      </div>
    </article>
  );
}
