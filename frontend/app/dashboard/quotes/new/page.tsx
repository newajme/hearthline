import { fetchJson, type Business, type Lead, type Page } from "../../lib";
import NewQuoteForm from "./NewQuoteForm";

export default async function NewQuotePage() {
  const [leadsRes, businessesRes] = await Promise.all([
    fetchJson<Page<Lead>>("/leads/"),
    fetchJson<Page<Business>>("/businesses/"),
  ]);
  const leads = leadsRes?.results ?? [];
  const business = businessesRes?.results?.[0] ?? null;
  return <NewQuoteForm leads={leads} business={business} />;
}
