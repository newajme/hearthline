"use client";

import { useMemo, useState } from "react";

import type { FaqCategory, FaqItem } from "./data";

const CATEGORIES: Array<"All" | FaqCategory> = [
  "All",
  "Setup",
  "Product",
  "Pricing",
  "Security",
  "Open source",
];

export default function FaqList({ items }: { items: FaqItem[] }) {
  const [active, setActive] = useState<"All" | FaqCategory>("All");

  const filtered = useMemo(
    () => (active === "All" ? items : items.filter((i) => i.category === active)),
    [active, items],
  );

  return (
    <>
      <div className="faq-filter" role="tablist" aria-label="FAQ categories">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={c === active}
            className={`faq-chip ${c === active ? "is-active" : ""}`}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="faq-list">
        {filtered.map((item, i) => (
          <details key={item.q} className="faq-item" open={i === 0}>
            <summary className="faq-q">
              <span>
                <span className="faq-q-cat">{item.category}</span>
                {item.q}
              </span>
              <span className="faq-toggle" aria-hidden>+</span>
            </summary>
            <div
              className="faq-a"
              {...(item.aHtml ? { dangerouslySetInnerHTML: { __html: item.aHtml } } : {})}
            >
              {item.aHtml ? null : item.aText}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
