import { MarketingFooter, MarketingTopbar } from "../MarketingShell";

import { FAQS } from "./data";
import FaqList from "./FaqList";

export const metadata = {
  title: "FAQ",
  description: "Common questions about Hearthline — pricing, setup, integrations, security, and more.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Hearthline · FAQ",
    description: "Common questions about Hearthline — pricing, setup, integrations, security, and more.",
    url: "/faq",
  },
};

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.aText },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <MarketingTopbar />
      <main>
        <section className="shell hero hero-tight">
          <span className="hero-meet">
            <span className="hero-meet-avatar">?</span>
            <span>Frequently asked questions</span>
          </span>
          <h1 className="hero-title">
            Honest answers.<br />
            <span className="hero-title-em">No marketing fluff.</span>
          </h1>
          <p className="hero-sub">
            Setup, pricing, integrations, security — the things home-service teams actually ask before signing up.
          </p>
        </section>

        <section className="shell section-tight">
          <FaqList items={FAQS} />
        </section>

        <section className="shell section-tight">
          <div className="final-cta">
            <h2 className="final-cta-title">Still have a question?</h2>
            <p className="final-cta-sub">Book a 30-minute call and ask directly.</p>
            <div className="final-cta-actions">
              <a
                href="https://calendly.com/contact-codewithmuh/30min"
                target="_blank"
                rel="noreferrer"
                className="btn btn-onDark btn-lg"
              >
                Book a demo <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>

        <MarketingFooter />
      </main>
    </>
  );
}
