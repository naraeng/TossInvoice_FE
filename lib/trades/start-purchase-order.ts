import { getAccessToken } from '@/lib/auth-storage';

import { START_TRADE_PATH } from './build-start-trade-form-data';
import { StartPurchaseOrderApiError } from './start-purchase-order-errors';

type StartPurchaseOrderApiResponse = {
  errorCode: string | null;
  message: string;
  result: unknown;
};

function resolveStartPurchaseOrderUrl(tradeId: number): string {
  const path = `${START_TRADE_PATH}/${tradeId}/purchase-order`;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, '')}${path}`;
  return path;
}

/**
 * PO 작성 시작 — POST /api/v1/trades/{tradeId}/purchase-order
 * 성공 시 204 No Content (멱등: PO row 이미 있으면 no-op)
 */
export async function startPurchaseOrder(tradeId: number): Promise<void> {
  const token = getAccessToken();

  const res = await fetch(resolveStartPurchaseOrderUrl(tradeId), {
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
    throw new StartPurchaseOrderApiError(
      '발주서 작성을 시작하지 못했습니다.',
      null,
    );
  }

  let data: StartPurchaseOrderApiResponse;
  try {
    data = JSON.parse(bodyText) as StartPurchaseOrderApiResponse;
  } catch {
    throw new StartPurchaseOrderApiError(
      bodyText || '발주서 작성을 시작하지 못했습니다.',
      null,
    );
  }

  if (data.errorCode && data.errorCode !== 'SUCCESS') {
    throw new StartPurchaseOrderApiError(
      data.message || '발주서 작성을 시작하지 못했습니다.',
      data.errorCode,
    );
  }

  if (!res.ok) {
    throw new StartPurchaseOrderApiError(
      data.message || '발주서 작성을 시작하지 못했습니다.',
      data.errorCode,
    );
  }
}
