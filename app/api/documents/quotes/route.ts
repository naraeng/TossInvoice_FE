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

  let asSupplier = false;
  try {
    const body = (await request.json()) as { asSupplier?: boolean };
    asSupplier = body.asSupplier === true;
  } catch {
    // body 없음 → 기존 동작(프로필 역할 기준)
  }

  const quote = createDraftQuote(company, { asSupplier });
  const viewerRole =
    company.companyId === quote.supplier.companyId
      ? 'SUPPLIER'
      : company.companyId === quote.client.companyId
        ? 'CLIENT'
        : company.role;

  return NextResponse.json({
    ok: true,
    quote,
    viewerRole,
  });
}
