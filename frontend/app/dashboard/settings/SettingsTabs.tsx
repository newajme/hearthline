"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { Business } from "../lib";
import ProfileForm from "./ProfileForm";
import KnowledgeForm from "./KnowledgeForm";
import ApiKeysCard from "./ApiKeysCard";
import ChannelsEditor from "./ChannelsEditor";
import WebhooksCard from "./WebhooksCard";

type TabKey = "profile" | "ai" | "channels" | "webhooks";

const TABS: { key: TabKey; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "ai", label: "AI & Keys" },
  { key: "channels", label: "Channels" },
  { key: "webhooks", label: "Webhooks" },
];

function normalize(raw: string | null): TabKey {
  return TABS.some((t) => t.key === raw) ? (raw as TabKey) : "profile";
}

export default function SettingsTabs({ business }: { business: Business }) {
  const router = useRouter();
  const params = useSearchParams();
  const [active, setActive] = useState<TabKey>(() => normalize(params.get("tab")));

  const select = useCallback(
    (key: TabKey) => {
      setActive(key);
      const next = new URLSearchParams(params.toString());
      next.set("tab", key);
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  return (
    <>
      <nav className="settings-tabs" role="tablist" aria-label="Settings sections">
        {TABS.map((t) => {
          const isActive = active === t.key;
          const count = t.key === "channels" ? business.channels.length : null;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`settings-pane-${t.key}`}
              className={`settings-tab ${isActive ? "is-active" : ""}`}
              onClick={() => select(t.key)}
            >
              <span>{t.label}</span>
              {count !== null && <span className="settings-tab-count">{count}</span>}
            </button>
          );
        })}
      </nav>

      <div
        className="settings-pane"
        id={`settings-pane-${active}`}
        role="tabpanel"
        aria-labelledby={`settings-tab-${active}`}
      >
        {active === "profile" && <ProfileForm business={business} />}
        {active === "ai" && (
          <>
            <ApiKeysCard business={business} />
            <KnowledgeForm business={business} />
          </>
        )}
        {active === "channels" && <ChannelsEditor business={business} />}
        {active === "webhooks" && <WebhooksCard />}
      </div>
    </>
  );
}
