"use client";

import { useEffect, useRef, useState } from "react";

export default function StatsBand() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);
  const [t1, setT1] = useState(0);
  const [t2, setT2] = useState(0);
  const [t3, setT3] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!seen) return;
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setT1(Math.round(100 * e));
      setT2(Math.round(43 * e));
      setT3(Math.round(38 * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen]);

  return (
    <section className="shell section" id="impact">
      <div className="stats-band" ref={ref}>
        <div>
          <span className="section-flourish" style={{ color: "rgba(255,255,255,0.55)" }}>
            Why teams switch
          </span>
          <h2 className="stats-band-title">
            Every missed call is a job your competitor books.
          </h2>
          <p className="stats-band-body">
            Hearthline picks up every inbound across every channel, qualifies it on
            the spot, and hands your crew a deal-ready conversation. Anna never
            sleeps, never takes a smoke break, and never forgets to ask for the photo.
          </p>
          <ul>
            <li>Calls answered while you&rsquo;re on a roof at 3 AM</li>
            <li>Photos turned into drafted quotes before you finish your coffee</li>
            <li>Every interaction synced to HubSpot, Pipedrive, or your CRM</li>
          </ul>
        </div>
        <div className="stats-band-right">
          <div className="stats-card night">
            <div className="stats-card-num">
              {t1}
              <span className="stats-card-suffix">%</span>
            </div>
            <div className="stats-card-label">
              of after-hours calls picked up — the ones your voicemail used to lose.
            </div>
          </div>
          <div className="stats-card ember">
            <div className="stats-card-num">
              {t2}
              <span className="stats-card-suffix">s</span>
            </div>
            <div className="stats-card-label">
              average time from customer photo to drafted PDF quote in tonight&rsquo;s demo.
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-card-num">
              {t3}
              <span className="stats-card-suffix">s</span>
            </div>
            <div className="stats-card-label">
              average time-to-first-response across phone, SMS, and chat.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
