import { notFound } from "next/navigation";

import { fetchJson, type Business, type Lead, type Page, type Quote } from "../../lib";
import QuoteEditor from "./QuoteEditor";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quote, businesses] = await Promise.all([
    fetchJson<Quote>(`/quotes/${id}/`),
    fetchJson<Page<Business>>("/businesses/"),
  ]);
  if (!quote) notFound();
  const business = businesses?.results?.[0] ?? null;
  // Pull the lead so we can show customer info on the invoice.
  const lead = await fetchJson<Lead>(`/leads/${quote.lead}/`);
  return <QuoteEditor quote={quote} business={business} lead={lead} />;
}
