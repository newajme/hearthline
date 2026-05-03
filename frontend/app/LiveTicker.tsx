"use client";

import { useEffect, useState } from "react";

type TickerItem = {
  kind: "call" | "quote" | "deal" | "subsidy" | "booked" | "sms";
  text: string;
};

const ITEMS: TickerItem[] = [
  { kind: "deal", text: "Deal won · $12,300 HVAC install" },
  { kind: "quote", text: "Photo quote drafted · $8,500 roof replacement" },
  { kind: "sms", text: "HVAC lead qualified via SMS in 38s" },
  { kind: "booked", text: "Saturday 9 AM booked · garage door repair" },
  { kind: "subsidy", text: "Solar rebate match found · $2,400 saved" },
  { kind: "call", text: "Anna answered call · 02:14 duration" },
  { kind: "deal", text: "Deal won · $9,450 window install" },
  { kind: "quote", text: "Smart-thermostat add-on quoted · $1,200" },
  { kind: "call", text: "Burst-pipe emergency routed · tech ETA 22 min" },
  { kind: "booked", text: "Tuesday 9:30 AM survey on the calendar" },
  { kind: "sms", text: "Customer photo received · measuring 5 windows" },
  { kind: "deal", text: "Deal won · $4,820 furnace tune-up package" },
  { kind: "subsidy", text: "Insulation grant matched · $1,800 covered" },
  { kind: "quote", text: "Drainage estimate sent · $720 with site survey" },
  { kind: "call", text: "After-hours call qualified · routed to on-call" },
  { kind: "booked", text: "Friday 11 AM roof leak quote booked" },
  { kind: "sms", text: "WhatsApp lead → quote in 41 seconds" },
  { kind: "deal", text: "Deal won · $18,900 full HVAC retrofit" },
];

const ICONS: Record<TickerItem["kind"], { color: string; symbol: string }> = {
  call: { color: "#16a34a", symbol: "●" },
  quote: { color: "#7c3aed", symbol: "●" },
  deal: { color: "#16a34a", symbol: "✓" },
  subsidy: { color: "#d2532b", symbol: "●" },
  booked: { color: "#2563eb", symbol: "●" },
  sms: { color: "#0ea5e9", symbol: "●" },
};

// Deterministic baseline so the counter "feels alive" without random hydration drift.
function baselineCount() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const minutesSinceMidnight = Math.floor((Date.now() - start.getTime()) / 60000);
  return 247 + Math.floor(minutesSinceMidnight * 0.3);
}

export default function LiveTicker() {
  const loop = [...ITEMS, ...ITEMS];
  const [counter, setCounter] = useState(247);

  useEffect(() => {
    setCounter(baselineCount());
    const id = setInterval(() => setCounter((c) => c + 1), 3700);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ticker-wrap">
      <div className="ticker-stat">
        <span className="ticker-pulse" />
        <strong>{counter}</strong>
        <span>calls handled today</span>
      </div>
      <div className="ticker-track-mask">
        <div className="ticker-track">
          {loop.map((it, i) => (
            <span className="ticker-item" key={i}>
              <span className="ticker-dot" style={{ background: ICONS[it.kind].color }}>
                {ICONS[it.kind].symbol}
              </span>
              {it.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
