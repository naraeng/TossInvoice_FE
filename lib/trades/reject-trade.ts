import { getAccessToken } from '@/lib/auth-storage';

import { START_TRADE_PATH } from './build-start-trade-form-data';
import { RejectTradeApiError } from './reject-trade-errors';

type RejectTradeApiResponse = {
  errorCode: string | null;
  message: string;
  result: unknown;
};

function resolveRejectTradeUrl(tradeId: number): string {
  const path = `${START_TRADE_PATH}/${tradeId}/reject`;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, '')}${path}`;
  return path;
}

/**
 * PI 거절(발주처) — POST /api/v1/trades/{tradeId}/reject
 * 성공 시 204, 거래 상태 PENDING_PO → CANCELLED
 */
export async function rejectTrade(tradeId: number): Promise<void> {
  const token = getAccessToken();

  const res = await fetch(resolveRejectTradeUrl(tradeId), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });

  if (res.status === 204) return;

  const bodyText = await res.text();
  if (!bodyText) {
    if (res.ok) return;
    throw new RejectTradeApiError('견적서 거절에 실패했습니다.', null);
  }

  let data: RejectTradeApiResponse;
  try {
    data = JSON.parse(bodyText) as RejectTradeApiResponse;
  } catch {
    throw new RejectTradeApiError(bodyText || '견적서 거절에 실패했습니다.', null);
  }

  if (data.errorCode && data.errorCode !== 'SUCCESS') {
    throw new RejectTradeApiError(data.message || '견적서 거절에 실패했습니다.', data.errorCode);
  }

  if (!res.ok) {
    throw new RejectTradeApiError(data.message || '견적서 거절에 실패했습니다.', data.errorCode);
  }
}
