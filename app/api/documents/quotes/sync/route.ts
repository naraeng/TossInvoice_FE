import { NextResponse } from 'next/server';

import { saveQuote } from '@/lib/documents/quote-store';
import type { QuoteDocument } from '@/types/documents/document';

export async function POST(request: Request) {
  let body: { quote?: QuoteDocument };
  try {
    body = (await request.json()) as { quote?: QuoteDocument };
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const quote = body.quote;
  if (!quote?.id || !quote.supplier || !quote.client || !quote.items) {
    return NextResponse.json({ ok: false, error: '견적 데이터가 올바르지 않습니다.' }, { status: 400 });
  }

  saveQuote(quote);

  return NextResponse.json({
    ok: true,
    quoteId: quote.id,
  });
}
