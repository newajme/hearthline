import Image from "next/image";

const FEATURES: Array<{ icon: string; title: string; body: string }> = [
  {
    icon: "📥",
    title: "Leads in your pocket",
    body: "Anna's qualified leads sync to your phone the second they land — name, project, temperature, value.",
  },
  {
    icon: "🔔",
    title: "Push the moment a job books",
    body: "Tap a notification to jump straight into the customer's conversation. No noise, just signal.",
  },
  {
    icon: "📄",
    title: "View & edit AI-drafted quotes",
    body: "Open Anna-drafted PDFs in-app, change status, edit notes, share with the customer.",
  },
  {
    icon: "📞",
    title: "Call transcripts on the go",
    body: "Skim what Anna and the caller said, grouped by day. Catch up on yesterday's calls in two minutes.",
  },
];

export default function MobileAppsBand() {
  return (
    <section className="shell section-tight" id="apps" aria-labelledby="apps-title">
      <div className="apps-band">
        <div className="apps-band-text">
          <p className="section-eyebrow">Now on iPhone &amp; Android</p>
          <h2 id="apps-title" className="apps-band-title">
            Anna in your pocket.
          </h2>
          <p className="apps-band-body">
            The Hearthline mobile apps put every lead, call and quote on your home screen. Tap a push,
            open the conversation, dispatch the crew. Built native — SwiftUI on iOS, Jetpack Compose on
            Android — against the same self-hostable backend.
          </p>

          <ul className="apps-feature-list">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <span aria-hidden className="apps-feature-icon">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="apps-store-row">
            <StoreBadge kind="apple" top="Coming soon to the" bottom="App Store" />
            <StoreBadge kind="google" top="COMING SOON ON" bottom="Google Play" />
          </div>
          <p className="apps-band-note">
            Self-hosting? Both apps point to your own backend via a single &quot;API URL&quot; setting in
            the app. One binary on the stores, your data on your server.
          </p>
        </div>

        <div className="apps-band-art" aria-hidden>
          <div className="apps-phone-frame">
            <Image
              src="/hearthline-ios-overview.png"
              alt="Hearthline iOS Overview screen showing today's leads, calls, pipeline and recent activity"
              width={392}
              height={848}
              priority={false}
              className="apps-phone-img"
            />
          </div>
          <div className="apps-art-glow" aria-hidden />
        </div>
      </div>
    </section>
  );
}

function StoreBadge({
  kind,
  top,
  bottom,
}: {
  kind: "apple" | "google";
  top: string;
  bottom: string;
}) {
  return (
    <span className="apps-store-badge" role="img" aria-label={`${top} ${bottom}`}>
      <span className="apps-store-mark" aria-hidden>
        {kind === "apple" ? <AppleMark /> : <PlayMark />}
      </span>
      <span className="apps-store-text">
        <span className="apps-store-top">{top}</span>
        <span className="apps-store-bottom">{bottom}</span>
      </span>
    </span>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M16.4 12.7c0-2.7 2.2-4 2.3-4-.5-.8-1.4-1.2-1.7-1.3-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7.1-3.4 1-4.3 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.3 2.6 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.5.9c1.4 0 2.4-1.3 3.3-2.6.6-.9 1-1.7 1.3-2.6-3.3-1.3-3.3-3.7-3.2-3.9zM13.4 5.4c.7-.9 1.2-2.1 1.1-3.4-1 .1-2.3.7-3 1.6-.7.8-1.3 2.1-1.1 3.3 1.2.1 2.3-.6 3-1.5z" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <defs>
        <linearGradient id="hl-play-l-a" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#00d2ff" />
          <stop offset="1" stopColor="#3a7bd5" />
        </linearGradient>
        <linearGradient id="hl-play-l-b" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ff6a00" />
          <stop offset="1" stopColor="#ee0979" />
        </linearGradient>
        <linearGradient id="hl-play-l-c" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#43e97b" />
          <stop offset="1" stopColor="#38f9d7" />
        </linearGradient>
        <linearGradient id="hl-play-l-d" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fceabb" />
          <stop offset="1" stopColor="#f8b500" />
        </linearGradient>
      </defs>
      <path d="M3 2.5L13.6 12 3 21.5z" fill="url(#hl-play-l-a)" />
      <path d="M3 2.5L18 11l-4.4 1z" fill="url(#hl-play-l-c)" />
      <path d="M3 21.5L18 13l-4.4-1z" fill="url(#hl-play-l-b)" />
      <path d="M18 11l3 1L18 13z" fill="url(#hl-play-l-d)" />
    </svg>
  );
}
