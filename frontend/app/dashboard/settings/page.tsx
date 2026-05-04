import { fetchJson, type Business, type Page } from "../lib";
import { getAdminUrl } from "../../lib/api";
import SettingsTabs from "./SettingsTabs";

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
          <SettingsTabs business={biz} />
        )}
      </div>
    </>
  );
}
