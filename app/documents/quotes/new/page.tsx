import { redirect } from 'next/navigation';

import { CURRENT_COMPANY_NAME } from '@/lib/documents/current-company';
import { createDraftQuote } from '@/lib/documents/quote-store';
import { resolveDocumentCompanyFromMe } from '@/lib/documents/resolve-current-company';

/** 거래 시작: 서버 store에 초안 생성 후 견적 작성 화면으로 이동 (외부 API 호출 없음) */
export default function NewQuotePage() {
  const company = resolveDocumentCompanyFromMe({
    companyName: CURRENT_COMPANY_NAME,
  });
  const quote = createDraftQuote(company);
  redirect(`/documents/quotes/${quote.id}`);
}
