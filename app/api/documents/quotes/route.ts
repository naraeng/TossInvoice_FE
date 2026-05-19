import { NextResponse } from 'next/server';

import { fetchMeForDocuments } from '@/lib/documents/fetch-me-for-documents';
import { resolveDocumentCompanyFromMe } from '@/lib/documents/resolve-current-company';
import { createDraftQuote } from '@/lib/documents/quote-store';

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');
  const me = await fetchMeForDocuments(authorization);

  if (!me) {
    return NextResponse.json({ ok: false, error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const company = resolveDocumentCompanyFromMe(me);
  const quote = createDraftQuote(company);

  return NextResponse.json({
    ok: true,
    quote,
    viewerRole: company.role,
  });
}
