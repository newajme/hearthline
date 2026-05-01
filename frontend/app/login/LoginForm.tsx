"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.detail || "Could not sign you in. Check your credentials.");
        setBusy(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setErr("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <Link href="/" className="auth-brand" aria-label="Hearthline home">
        <span className="brand-mark">
          <Flame />
        </span>
        <span>Hearthline</span>
      </Link>

      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">
          Sign in to your Hearthline dashboard. Don&apos;t have an account?{" "}
          <a href="https://calendly.com/contact-codewithmuh/30min" target="_blank" rel="noreferrer">
            Book a demo
          </a>
          .
        </p>

        {err && <div className="auth-error" role="alert">{err}</div>}

        <label className="auth-label" htmlFor="email">Email or username</label>
        <input
          id="email"
          name="username"
          type="text"
          autoComplete="username"
          required
          autoFocus
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />

        <label className="auth-label" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
          {!busy && <span aria-hidden>→</span>}
        </button>

        <p className="auth-foot">
          Trouble signing in? Email{" "}
          <a href="mailto:contact@codewithmuh.com">contact@codewithmuh.com</a>.
        </p>
      </form>

      <p className="auth-back">
        <Link href="/">← Back to hearthline.com</Link>
      </p>
    </main>
  );
}

function Flame() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.5-.5 3-1.5 1-1.6.6-3.4-1-5-1.6-1.6-2-3.4-1-5C12.5 4 12 3 11 2.5 9.5 2 8 2.5 7 4 5.5 6 5 9 6.5 11c.5 1 .5 2.5-.5 3.5z" />
    </svg>
  );
}
