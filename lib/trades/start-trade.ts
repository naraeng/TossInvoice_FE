import { getAccessToken } from '@/lib/auth-storage';
import type { QuoteDocument } from '@/types/documents/document';

import {
  START_TRADE_PATH,
  buildStartTradeFormData,
} from './build-start-trade-form-data';
import { StartTradeApiError } from './start-trade-errors';
import type { StartTradeApiResponse, StartTradeResult } from './types';

function resolveStartTradeUrl(): string {
  // 브라우저: same-origin → Next POST 프록시 (multipart + Bearer)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${START_TRADE_PATH}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, '')}${START_TRADE_PATH}`;
  return START_TRADE_PATH;
}

/** PI(견적서) 발행 — 거래 시작 POST /api/v1/trades */
export async function startTrade(
  quote: QuoteDocument,
  signatureDataUrl: string,
): Promise<StartTradeResult> {
  const formData = buildStartTradeFormData(quote, signatureDataUrl);
  const token = getAccessToken();

  const res = await fetch(resolveStartTradeUrl(), {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    credentials: 'include',
  });

  let data: StartTradeApiResponse;
  try {
    data = (await res.json()) as StartTradeApiResponse;
  } catch {
    throw new StartTradeApiError('견적서 발행에 실패했습니다.', null);
  }

  if (!res.ok) {
    throw new StartTradeApiError(
      data.message || '견적서 발행에 실패했습니다.',
      data.errorCode,
    );
  }

  if (data.result?.tradeId != null) {
    return { tradeId: data.result.tradeId };
  }

  throw new StartTradeApiError(
    data.message || '견적서 발행에 실패했습니다.',
    data.errorCode,
  );
}
