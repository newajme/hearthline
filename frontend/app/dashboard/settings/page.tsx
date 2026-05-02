import { fetchJson, type Business, type Page } from "../lib";
import { getAdminUrl } from "../../lib/api";
import ChannelsEditor from "./ChannelsEditor";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const data = await fetchJson<Page<Business>>("/businesses/");
  const biz = data?.results?.[0];

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Settings</h1>
          <p>Business profile, channels, and integrations.</p>
        </div>
        <div className="app-pagebar-actions">
          {biz && (
            <a
              href={getAdminUrl(`/core/business/${biz.id}/change/`)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              Advanced ↗
            </a>
          )}
        </div>
      </div>

      <div className="app-content">
        {!biz ? (
          <div className="empty-card">
            <h3>No business configured yet</h3>
            <p>
              Run <code>docker compose exec backend python manage.py seed_demo</code> or add one
              from Django admin.
            </p>
          </div>
        ) : (
          <div className="settings-grid">
            <SettingsForm business={biz} />
            <ChannelsEditor business={biz} />

            <article className="dash-card" style={{ gridColumn: "1 / -1" }}>
              <div className="dash-card-head">
                <h2>Integrations</h2>
                <span className="dash-card-meta">Webhook URLs</span>
              </div>
              <ul className="integrations-list">
                <li>
                  <div>
                    <div className="integrations-name">Vapi · custom LLM</div>
                    <div className="integrations-sub">Anna&apos;s agentic loop runs on every call turn.</div>
                  </div>
                  <code className="vapi-url">/api/calls/vapi/chat/completions/</code>
                </li>
                <li>
                  <div>
                    <div className="integrations-name">Vapi · server URL</div>
                    <div className="integrations-sub">Receives end-of-call reports + transcripts.</div>
                  </div>
                  <code className="vapi-url">/api/calls/webhooks/vapi/</code>
                </li>
                <li>
                  <div>
                    <div className="integrations-name">Twilio · voice/SMS</div>
                    <div className="integrations-sub">Fallback voice + outbound SMS.</div>
                  </div>
                  <code className="vapi-url">/api/calls/webhooks/twilio/</code>
                </li>
                <li>
                  <div>
                    <div className="integrations-name">Photo → quote</div>
                    <div className="integrations-sub">POST a photo URL + lead ID, get a drafted quote.</div>
                  </div>
                  <code className="vapi-url">/api/quotes/from-photo/</code>
                </li>
              </ul>
            </article>
          </div>
        )}
      </div>
    </>
  );
}

