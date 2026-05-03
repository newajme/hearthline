export type FaqCategory = "Setup" | "Product" | "Pricing" | "Security" | "Open source";

export type FaqItem = {
  q: string;
  category: FaqCategory;
  aText: string;
  aHtml?: string;
};

export const FAQS: FaqItem[] = [
  {
    q: "How long does setup take?",
    category: "Setup",
    aText:
      "About 30 minutes for the basics — business hours, service area, pricing rules, and a phone number to forward. Tuning Anna's voice and pricing rules to your exact business is a few hours of iteration after that.",
  },
  {
    q: "Does Anna sound like a robot?",
    category: "Product",
    aText:
      "No — Anna runs on the latest neural voices (ElevenLabs by default; configurable). You pick the voice; most customers can't tell it's AI in a short call.",
  },
  {
    q: "What languages does Anna support?",
    category: "Product",
    aText:
      "English, French, Spanish, German, Italian, Dutch, and Portuguese out of the box. Other languages work too — they just haven't been tuned to a brand voice yet.",
  },
  {
    q: "Can I keep my existing phone number?",
    category: "Setup",
    aText:
      "Yes. We forward your existing line to Hearthline, or you can publish a new dedicated number. SMS / WhatsApp routing works the same way.",
  },
  {
    q: "Which CRMs do you sync with?",
    category: "Setup",
    aText:
      "HubSpot, Pipedrive, Salesforce, Zoho, and ServiceTitan have first-class integrations. Anything else can be wired through Zapier or the REST API — every interaction is just a Lead row.",
  },
  {
    q: "What happens if Anna can't answer something?",
    category: "Product",
    aText:
      "She politely takes a detailed message, files it as a hot lead in your CRM, and pings whoever's on call. No customer is left hanging.",
  },
  {
    q: "Is my data secure?",
    category: "Security",
    aText:
      "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We do not train on your customer data. SOC 2 Type II audit is on the roadmap as the hosted offering scales.",
  },
  {
    q: "How is pricing structured?",
    category: "Pricing",
    aText:
      "For self-host: free under AGPL-3.0. For done-for-you setup: a flat platform fee plus per-minute call usage. Most home-service teams land between $390–$890 / month all-in. Book a demo for an exact quote.",
  },
  {
    q: "Can I try Hearthline before paying?",
    category: "Pricing",
    aText:
      "Yes. The whole stack is open-source — clone the repo and run it locally with one Docker command, no credit card. For done-for-you setup we run a 14-day pilot before invoicing.",
  },
  {
    q: "Can I host Hearthline myself?",
    category: "Open source",
    aText:
      "Yes — the whole stack is open source under AGPL-3.0. A commercial license is available for white-labeling, reselling, or running closed-source forks. See the docs for the self-host quick start.",
    aHtml:
      'Yes — the whole stack is open source under AGPL-3.0. A commercial license is available for white-labeling, reselling, or running closed-source forks. See the <a href="/docs">docs</a> for the self-host quick start.',
  },
];
