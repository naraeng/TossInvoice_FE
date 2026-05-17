import { NextResponse } from 'next/server';

import { executeQuoteAction } from '@/lib/documents/quote-actions';
import type { QuoteAction, QuoteDocument } from '@/types/documents/document';

type RouteContext = { params: Promise<{ quoteId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { quoteId } = await context.params;

  let body: { action?: QuoteAction; patch?: Partial<QuoteDocument> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: '잘못된 요청입니다.' }, { status: 400 });
  }

  if (!body.action) {
    return NextResponse.json({ ok: false, error: 'action이 필요합니다.' }, { status: 400 });
  }

  const result = executeQuoteAction(quoteId, body.action, body.patch);

  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }

  return NextResponse.json(result);
}
