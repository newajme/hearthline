"use client";

import { useEffect, useState } from "react";

type TickerItem = {
  kind: "call" | "quote" | "deal" | "subsidy" | "booked" | "sms";
  text: string;
};

const ITEMS: TickerItem[] = [
  { kind: "deal", text: "Deal won · $12,300 HVAC install · demo lead #001" },
  { kind: "quote", text: "Photo quote drafted · $8,500 roof replacement" },
  { kind: "sms", text: "HVAC lead qualified via SMS · demo lead #002" },
  { kind: "booked", text: "Saturday 9 AM booked · garage door repair" },
  { kind: "subsidy", text: "Solar rebate match found · $2,400 saved" },
  { kind: "call", text: "Anna answered call #247 · 02:14 duration" },
  { kind: "deal", text: "Deal won · $9,450 window install · demo lead #003" },
  { kind: "quote", text: "Smart-thermostat add-on quoted · $1,200" },
];

const ICONS: Record<TickerItem["kind"], { color: string; symbol: string }> = {
  call: { color: "#16a34a", symbol: "●" },
  quote: { color: "#7c3aed", symbol: "●" },
  deal: { color: "#16a34a", symbol: "✓" },
  subsidy: { color: "#d2532b", symbol: "●" },
  booked: { color: "#2563eb", symbol: "●" },
  sms: { color: "#0ea5e9", symbol: "●" },
};

export default function LiveTicker() {
  // Just duplicate the list once for a seamless infinite-scroll loop
  const loop = [...ITEMS, ...ITEMS];
  const [counter, setCounter] = useState(247);

  useEffect(() => {
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
