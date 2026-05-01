"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Anna } from "./Anna";

type Phase = "ringing" | "live" | "ended";

type Bubble = { role: "in" | "out"; text: string };

const SCRIPT: Array<{ role: "in" | "out"; text: string; afterMs: number }> = [
  { role: "out", text: "Hi, this is Anna at Hearthline — how can I help tonight?", afterMs: 600 },
  { role: "in", text: "Yeah, my furnace just stopped working. It's freezing in here.", afterMs: 2600 },
  { role: "out", text: "I'm sorry to hear that. Is there any smell or visible damage?", afterMs: 4800 },
  { role: "in", text: "No smell. The pilot light is just out.", afterMs: 7000 },
  { role: "out", text: "Got it. I can have a tech at your address by 7:45 AM. Shall I book it and text you the confirmation?", afterMs: 9000 },
];

const DEMO_URL = "https://calendly.com/contact-codewithmuh/30min";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AnnaDemoModal({ open, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("ringing");
  const [seconds, setSeconds] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [typingFor, setTypingFor] = useState<"in" | "out" | null>(null);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    setPhase("ringing");
    setSeconds(0);
    setBubbles([]);
    setTypingFor(null);

    const ringTimer = setTimeout(() => {
      setPhase("live");
      setTypingFor("out");
    }, 2200);

    return () => clearTimeout(ringTimer);
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "live") return;
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [open, phase]);

  useEffect(() => {
    if (!open || phase !== "live") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    SCRIPT.forEach((entry, i) => {
      timers.push(
        setTimeout(() => {
          setBubbles((cur) => [...cur, { role: entry.role, text: entry.text }]);
          const next = SCRIPT[i + 1];
          setTypingFor(next ? next.role : null);
          if (i === SCRIPT.length - 1) {
            timers.push(setTimeout(() => setPhase("ended"), 2200));
          }
        }, entry.afterMs),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [open, phase]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");

  return createPortal(
    <div
      className="anna-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Anna live demo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="anna-modal" ref={dialogRef}>
        <button
          ref={closeBtnRef}
          className="anna-modal-close"
          aria-label="Close demo"
          onClick={onClose}
          type="button"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="anna-modal-head">
          <span className="anna-modal-eyebrow">
            <span className="dot-pulse" aria-hidden /> Live demo · simulated call
          </span>
          <h3 className="anna-modal-title">
            Watch Anna take a 3 AM emergency.
          </h3>
        </div>

        <div className="anna-modal-stage">
          {/* Phone card */}
          <div className={`anna-phone phase-${phase}`}>
            <div className="anna-phone-glow" aria-hidden />
            <div className="anna-phone-avatar">
              {phase === "ringing" && (
                <>
                  <span className="phone-avatar-ring" />
                  <span className="phone-avatar-ring delay" />
                </>
              )}
              <Anna size={56} />
            </div>
            <div className="anna-phone-name">Anna · Hearthline</div>
            <div className="anna-phone-status">
              {phase === "ringing" && "Incoming call · ringing…"}
              {phase === "live" && (
                <>
                  <span className="dot-pulse" aria-hidden /> Connected · {mm}:{ss}
                </>
              )}
              {phase === "ended" && "Call ended · summary saved to CRM"}
            </div>
          </div>

          {/* Transcript feed */}
          <div className="anna-feed" aria-live="polite">
            {phase === "ringing" && (
              <div className="anna-feed-empty">
                <span className="anna-feed-empty-dots"><i /><i /><i /></span>
                <span>Customer dialing in…</span>
              </div>
            )}
            {phase !== "ringing" && (
              <>
                {bubbles.map((b, i) => (
                  <div key={i} className={`anna-feed-bubble ${b.role}`}>
                    <span className="anna-feed-avatar">
                      {b.role === "out" ? "A" : (
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>
                      )}
                    </span>
                    <span className="anna-feed-text">{b.text}</span>
                  </div>
                ))}
                {typingFor && phase === "live" && (
                  <div className={`anna-feed-bubble ${typingFor} typing`}>
                    <span className="anna-feed-avatar">
                      {typingFor === "out" ? "A" : (
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>
                      )}
                    </span>
                    <span className="anna-feed-text">
                      <span className="typing-dots"><i /><i /><i /></span>
                    </span>
                  </div>
                )}
                {phase === "ended" && (
                  <div className="anna-feed-summary">
                    <div className="anna-feed-summary-title">What just happened</div>
                    <ul>
                      <li>Lead qualified — emergency, no safety risk</li>
                      <li>Tech booked · Tomorrow 7:45 AM</li>
                      <li>Customer texted confirmation + tech name</li>
                      <li>Deal created in HubSpot · #D-1042</li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="anna-modal-foot">
          <p className="anna-modal-foot-note">
            This is a scripted preview. The real Anna runs on your business's own pricing,
            voice, and CRM.
          </p>
          <div className="anna-modal-actions">
            <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn btn-primary">
              Book a real demo
            </a>
            <Link href="/dashboard/test-call" className="btn btn-ghost" onClick={onClose}>
              Open the full simulator →
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
