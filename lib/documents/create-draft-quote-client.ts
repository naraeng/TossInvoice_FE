import { getAccessToken } from '@/lib/auth-storage';
import type { UserRole } from '@/types/documents/document';

type CreateDraftQuoteResponse = {
  ok: boolean;
  error?: string;
  quote?: { id: string };
  viewerRole?: UserRole;
};

type CreateDraftQuoteOptions = {
  /** true: 거래 시작·견적 발행 — 수주처(공급자) 초안 */
  asSupplier?: boolean;
};

/** 로그인 사용자(/users/me) 기준으로 견적 초안 생성 */
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

  return {
    quoteId: data.quote.id,
    viewerRole: data.viewerRole ?? 'SUPPLIER',
  };
}
