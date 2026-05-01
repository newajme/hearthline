"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SessionUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  is_staff: boolean;
};

export function DashGlobalTopbar({ user }: { user: SessionUser }) {
  return (
    <div className="dash-global-topbar">
      <DashSearch />
      <div className="dash-topbar-right">
        <DashBell />
        <DashUser user={user} />
      </div>
    </div>
  );
}

function DashSearch() {
  const [val, setVal] = useState("");
  return (
    <form
      className="dash-search"
      onSubmit={(e) => {
        e.preventDefault();
        if (!val.trim()) return;
        window.location.href = `/dashboard/leads?q=${encodeURIComponent(val)}`;
      }}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Search leads, calls, customers…"
      />
      <kbd>⌘K</kbd>
    </form>
  );
}

function DashBell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="dash-pop">
      <button className="dash-icon-btn" aria-label="Notifications" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
        <span className="dash-bell-dot" />
      </button>
      {open && (
        <>
          <span className="dash-pop-overlay" onClick={() => setOpen(false)} />
          <div className="dash-pop-menu">
            <div className="dash-pop-head">Notifications</div>
            <div className="dash-pop-empty">You&apos;re all caught up.</div>
          </div>
        </>
      )}
    </div>
  );
}

function initials(user: SessionUser): string {
  const src = (user.first_name || user.username || user.email || "U").trim();
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function DashUser({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore — we still redirect */
    }
    router.push("/");
    router.refresh();
  }

  const display = user.first_name || user.username || user.email;

  return (
    <div className="dash-pop">
      <button className="dash-user-btn" onClick={() => setOpen((o) => !o)}>
        <span className="dash-user-avatar">{initials(user)}</span>
        <span className="dash-user-meta">
          <span className="dash-user-name">{display}</span>
          <span className="dash-user-role">{user.is_staff ? "Admin" : "Member"}</span>
        </span>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <>
          <span className="dash-pop-overlay" onClick={() => setOpen(false)} />
          <div className="dash-pop-menu dash-pop-menu-right">
            <div className="dash-pop-head" style={{ fontWeight: 600 }}>{user.email || user.username}</div>
            <a href="/dashboard/settings" className="dash-pop-item">Settings</a>
            <a href="/dashboard/customers" className="dash-pop-item">Customers</a>
            {user.is_staff && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}`.replace(/\/api\/?$/, "") + "/admin/"}
                target="_blank"
                rel="noreferrer"
                className="dash-pop-item"
              >
                Django admin ↗
              </a>
            )}
            <hr />
            <a href="/" className="dash-pop-item">← Back to landing</a>
            <button
              type="button"
              className="dash-pop-item dash-pop-item-danger"
              onClick={signOut}
              disabled={signingOut}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
