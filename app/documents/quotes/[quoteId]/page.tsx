import { notFound } from 'next/navigation';

import { QuoteDetailPageClient } from '@/features/documents/quote/QuoteDetailPageClient';
import { getQuoteById } from '@/lib/documents/quote-store';

type PageProps = {
  params: Promise<{ quoteId: string }>;
};

export default async function QuoteDetailPage({ params }: PageProps) {
  const { quoteId } = await params;
  const quote = getQuoteById(quoteId);

  if (!quote) {
    notFound();
  }

  return <QuoteDetailPageClient quote={quote} />;
}
