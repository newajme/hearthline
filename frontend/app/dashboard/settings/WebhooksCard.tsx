export default function WebhooksCard() {
  return (
    <article className="dash-card">
      <div className="dash-card-head">
        <h2>Webhook URLs</h2>
        <span className="dash-card-meta">Point your providers at these</span>
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
  );
}
