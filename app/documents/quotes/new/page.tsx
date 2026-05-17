import { redirect } from 'next/navigation';

import { createDraftQuote } from '@/lib/documents/quote-store';

export default function NewQuotePage() {
  const quote = createDraftQuote();
  redirect(`/documents/quotes/${quote.id}`);
}
