import { getAccessToken } from '@/lib/auth-storage';
import type { QuoteDocument } from '@/types/documents/document';

type SyncQuoteResponse = {
  ok: boolean;
  error?: string;
  quoteId?: string;
};

/** 서버 인메모리 quote store에 견적 문서 반영 (상세 페이지 진입용) */
export async function syncQuoteViaApi(quote: QuoteDocument): Promise<string> {
  const token = getAccessToken();

  const res = await fetch('/api/documents/quotes/sync', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ quote }),
  });

  const data = (await res.json()) as SyncQuoteResponse;

  if (!res.ok || !data.ok || !data.quoteId) {
    throw new Error(data.error || '견적서를 불러오지 못했습니다.');
  }

  return data.quoteId;
}
