import { fetchJson, type Business, type Page } from "../lib";
import { getAdminUrl } from "../../lib/api";
import SettingsTabs from "./SettingsTabs";

const EMPTY_BUSINESS: Business = {
  id: 0,
  name: "",
  slug: "",
  trade: "general",
  timezone: "UTC",
  currency: "USD",
  phone_number: "",
  voice_persona: "Anna",
  knowledge_base: "",
  llm_provider: "anthropic",
  anthropic_api_key: "",
  openai_api_key: "",
  vapi_api_key: "",
  vapi_phone_number_id: "",
  twilio_account_sid: "",
  twilio_auth_token: "",
  twilio_from_number: "",
  whatsapp_access_token: "",
  whatsapp_phone_number_id: "",
  whatsapp_verify_token: "",
  has_anthropic_key: false,
  has_openai_key: false,
  has_vapi_key: false,
  has_twilio_creds: false,
  has_whatsapp_creds: false,
  channels: [],
};

export default async function SettingsPage() {
  const data = await fetchJson<Page<Business>>("/businesses/");
  const biz = data?.results?.[0] ?? EMPTY_BUSINESS;
  const isNew = biz.id === 0;

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Settings</h1>
          <p>Business profile, channels, and integrations.</p>
        </div>
        <div className="app-pagebar-actions">
          {!isNew && (
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
        {isNew && (
          <div className="settings-onboarding-banner">
            <strong>No business configured yet.</strong>
            <span>Fill in the profile below and hit save to create one.</span>
          </div>
        )}
        <SettingsTabs business={biz} />
      </div>
    </>
  );
}
