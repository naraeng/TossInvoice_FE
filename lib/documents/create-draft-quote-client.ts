import { getAccessToken } from '@/lib/auth-storage';
import { saveQuote } from '@/lib/documents/quote-store';
import type { QuoteDocument, UserRole } from '@/types/documents/document';

type CreateDraftQuoteResponse = {
  ok: boolean;
  error?: string;
  quote?: QuoteDocument;
  viewerRole?: UserRole;
};

type CreateDraftQuoteOptions = {
  /** true: 거래 시작·견적 발행 — 수주처(공급자) 초안 */
  asSupplier?: boolean;
};

/**
 * 로그인 사용자(/users/me) 기준으로 견적 초안 생성.
 *
 * 서버 route handler가 quote 전체를 반환하므로, 그걸 받아 **클라이언트 측 quote-store에도 저장**한다.
 * (서버/클라이언트 모듈 인스턴스가 격리돼 있어 클라가 별도로 캐시해야 후속 페이지에서 store fallback 가능.)
 */
export async function createDraftQuoteViaApi(
  options: CreateDraftQuoteOptions = {},
): Promise<{
  quoteId: string;
  viewerRole: UserRole;
}> {
  const token = getAccessToken();
  const res = await fetch('/api/documents/quotes', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ asSupplier: options.asSupplier === true }),
  });

  const data = (await res.json()) as CreateDraftQuoteResponse;

  if (!res.ok || !data.ok || !data.quote?.id) {
    throw new Error(data.error || '견적 초안을 만들지 못했습니다.');
  }

  // 클라이언트 측 store에도 저장해야 후속 QuoteDetailPageClient의 getQuoteById fallback이 찾을 수 있다.
  saveQuote(data.quote);

  return {
    quoteId: data.quote.id,
    viewerRole: data.viewerRole ?? 'SUPPLIER',
  };
}
