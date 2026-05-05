import Image from "next/image";

import { getT } from "./lib/i18n-server";

export default async function MobileAppsBand() {
  const { t } = await getT();
  const FEATURES: Array<{ icon: string; title: string; body: string }> = [
    { icon: "📥", title: t("apps.f1.title"), body: t("apps.f1.body") },
    { icon: "🔔", title: t("apps.f2.title"), body: t("apps.f2.body") },
    { icon: "📄", title: t("apps.f3.title"), body: t("apps.f3.body") },
    { icon: "📞", title: t("apps.f4.title"), body: t("apps.f4.body") },
  ];
  return (
    <section className="shell section-tight" id="apps" aria-labelledby="apps-title">
      <div className="apps-band">
        <div className="apps-band-text">
          <p className="section-eyebrow">{t("apps.eyebrow")}</p>
          <h2 id="apps-title" className="apps-band-title">
            {t("apps.title")}
          </h2>
          <p className="apps-band-body">
            {t("apps.body")}
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
            <StoreBadge kind="apple" top={t("apps.appleTop")} bottom={t("apps.appleBottom")} />
            <StoreBadge kind="google" top={t("apps.googleTop")} bottom={t("apps.googleBottom")} />
          </div>
          <p className="apps-band-note">
            {t("apps.note")}
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
