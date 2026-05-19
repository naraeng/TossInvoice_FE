import { notFound } from 'next/navigation';

import { InvoiceDetailPageClient } from '@/features/documents/invoice/InvoiceDetailPageClient';
import { getQuoteById } from '@/lib/documents/quote-store';

type PageProps = {
  params: Promise<{ invoiceId: string }>;
};

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { invoiceId } = await params;
  const quote = getQuoteById(invoiceId);

  if (!quote) {
    notFound();
  }

  return <InvoiceDetailPageClient quote={quote} />;
}
