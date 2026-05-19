import { notFound } from 'next/navigation';
import { Suspense } from 'react';

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

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-500">
          문서 정보를 불러오는 중…
        </div>
      }
    >
      <QuoteDetailPageClient quote={quote} />
    </Suspense>
  );
}
