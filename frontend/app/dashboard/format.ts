export function fmtAge(iso: string | null | undefined): string {
  if (!iso) return "";
  const sec = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return "Just now";
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// Locale that produces the most natural grouping for the given currency.
// PKR/INR use the South Asian lakh/crore grouping (1,50,000) which is what
// people actually read prices as in those markets.
const CURRENCY_LOCALE: Record<string, string> = {
  PKR: "en-PK",
  INR: "en-IN",
  AED: "en-AE",
  SAR: "ar-SA",
  GBP: "en-GB",
  EUR: "en-IE",
  CAD: "en-CA",
  AUD: "en-AU",
};

export function fmtMoney(
  n: number | string | null | undefined,
  currency: string = "USD",
): string {
  if (n === null || n === undefined || n === "") return "—";
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (Number.isNaN(num)) return "—";
  const cur = (currency || "USD").toUpperCase();
  const locale = CURRENCY_LOCALE[cur] ?? "en-US";
  try {
    return num.toLocaleString(locale, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    });
  } catch {
    return `${cur} ${num.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
  }
}

export type Lead = {
  id: number;
  status: string;
  temperature: string;
  estimated_value: number | null;
  project_summary: string;
  extracted_fields: Record<string, unknown>;
  customer: { id: number; name: string; phone: string; email: string; address?: string };
  conversations: Array<{ id: number; messages: Array<{ id: number; role: string; body: string; created_at: string }> }>;
  created_at: string;
  updated_at: string;
};

export type Call = {
  id: number;
  provider: string;
  provider_call_id: string;
  status: string;
  from_number: string;
  to_number: string;
  duration_seconds: number | null;
  recording_url: string;
  summary: string;
  transcript: string;
  persona_used: string;
  started_at: string;
  ended_at: string | null;
  lead: number | null;
};

export type Quote = {
  id: number;
  lead: number;
  reference: string;
  subtotal: string;
  tax: string;
  total: string;
  notes: string;
  status: string;
  drafted_by_ai: boolean;
  photo_assessment: Record<string, unknown>;
  line_items: Array<{ id: number; description: string; quantity: string; unit_price: string; total: string }>;
  created_at: string;
};

export type Business = {
  id: number;
  name: string;
  slug: string;
  trade: string;
  timezone: string;
  currency: string;
  phone_number: string;
  voice_persona: string;
  knowledge_base: string;
  llm_provider: "anthropic" | "openai";
  anthropic_api_key: string;
  openai_api_key: string;
  vapi_api_key: string;
  vapi_phone_number_id: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_from_number: string;
  whatsapp_access_token: string;
  whatsapp_phone_number_id: string;
  whatsapp_verify_token: string;
  has_anthropic_key: boolean;
  has_openai_key: boolean;
  has_vapi_key: boolean;
  has_twilio_creds: boolean;
  has_whatsapp_creds: boolean;
  channels: Array<{ id: number; kind: string; address: string; is_active: boolean }>;
};

export type Ticket = {
  id: number;
  channel: "whatsapp" | "sms" | "email" | "webchat";
  sender_id: string;
  sender_name: string;
  subject: string;
  status: "open" | "waiting" | "escalated" | "resolved";
  human_only: boolean;
  last_message_at: string | null;
  created_at: string;
  last_message_preview: string;
  message_count: number;
};

export type TicketMessage = {
  id: number;
  direction: "in" | "out";
  author: "customer" | "ai" | "agent" | "system";
  body: string;
  created_at: string;
  metadata: Record<string, unknown>;
};

export type TicketDetail = Ticket & { messages: TicketMessage[] };

export type Page<T> = { count: number; results: T[] };
