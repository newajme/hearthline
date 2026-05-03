"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

const DEMO_URL = "https://calendly.com/contact-codewithmuh/30min";
const REPO_URL = "https://github.com/codewithmuh/hearthline";

export type NavLink = { href: string; label: string };

const HOME_LINKS: NavLink[] = [
  { href: "/#story", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#industries", label: "Industries" },
  { href: "/#impact", label: "Impact" },
  { href: "/docs", label: "Docs" },
];

type TopbarProps = {
  links?: NavLink[];
  showBuiltBy?: boolean;
  ossPill?: string;
};

export function MarketingTopbar({
  links = HOME_LINKS,
  showBuiltBy = false,
  ossPill,
}: TopbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`topbar-wrap ${scrolled ? "is-scrolled" : ""}`}>
      <header className="topbar">
        <div className="brand-cluster">
          <Link href="/" className="brand" aria-label="Hearthline home">
            <span className="brand-mark"><Flame /></span>
            <span>Hearthline</span>
            {ossPill && <span className="oss-pill">{ossPill}</span>}
          </Link>
          {showBuiltBy && (
            <a
              href="https://codewithmuh.com"
              target="_blank"
              rel="noreferrer author"
              className="built-by-pill"
              title="Built by codewithmuh"
            >
              by <strong>codewithmuh</strong>
            </a>
          )}
        </div>

        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="topbar-right">
          <LanguageSwitcher />
          <ThemeToggle />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="topbar-icon-link"
            aria-label="Star Hearthline on GitHub"
            title="Star on GitHub"
          >
            <Github />
          </a>
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary topbar-cta"
          >
            Book a demo
          </a>
          <button
            type="button"
            className="topbar-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`burger ${open ? "open" : ""}`}>
              <i /><i /><i />
            </span>
          </button>
        </div>
      </header>

      {open && (
        <div className="mobile-sheet" role="dialog" aria-modal="true" aria-label="Menu">
          <nav className="mobile-sheet-nav">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="mobile-sheet-link"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/faq" className="mobile-sheet-link" onClick={() => setOpen(false)}>
              FAQ
            </Link>
            <Link href="/login" className="mobile-sheet-link" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </nav>
          <div className="mobile-sheet-actions">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost mobile-sheet-btn"
            >
              <Github /> Star on GitHub
            </a>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mobile-sheet-btn"
            >
              Book a demo →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function MarketingFooter() {
  return (
    <footer className="shell footer">
      <div>
        <div className="brand" style={{ marginBottom: 12 }}>
          <span className="brand-mark"><Flame /></span>
          <span>Hearthline</span>
        </div>
        <p className="footer-tag">
          The 24/7 AI front desk for home-service teams.
        </p>
      </div>
      <div className="footer-col">
        <h5>Product</h5>
        <Link href="/#features">Features</Link>
        <Link href="/#industries">Industries</Link>
        <Link href="/login">Sign in</Link>
      </div>
      <div className="footer-col">
        <h5>Resources</h5>
        <Link href="/faq">FAQ</Link>
        <Link href="/docs">Docs</Link>
        <a href={DEMO_URL} target="_blank" rel="noreferrer">Book a demo</a>
      </div>
      <div className="footer-col">
        <h5>Legal</h5>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Hearthline. Open-source under AGPL-3.0.</span>
        <span>
          Built by{" "}
          <a href="https://codewithmuh.com" target="_blank" rel="noreferrer author">
            @codewithmuh
          </a>
        </span>
      </div>
    </footer>
  );
}

export function Flame() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.5-.5 3-1.5 1-1.6.6-3.4-1-5-1.6-1.6-2-3.4-1-5C12.5 4 12 3 11 2.5 9.5 2 8 2.5 7 4 5.5 6 5 9 6.5 11c.5 1 .5 2.5-.5 3.5z" />
    </svg>
  );
}

function Github() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.79-.01 3.16 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}
