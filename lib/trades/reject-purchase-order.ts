import { getAccessToken } from '@/lib/auth-storage';

import { START_TRADE_PATH } from './build-start-trade-form-data';
import { RejectPurchaseOrderApiError } from './reject-purchase-order-errors';

type RejectPurchaseOrderApiResponse = {
  errorCode: string | null;
  message: string;
  result: unknown;
};

function resolveRejectPurchaseOrderUrl(tradeId: number): string {
  const path = `${START_TRADE_PATH}/${tradeId}/purchase-order/reject`;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, '')}${path}`;
  return path;
}

/**
 * PO 카운터서명 거절(수주처) — POST /api/v1/trades/{tradeId}/purchase-order/reject
 * 성공 시 204, 거래 상태 PENDING_SELLER_SIGN → CANCELLED
 */
export async function rejectPurchaseOrder(tradeId: number): Promise<void> {
  const token = getAccessToken();

  const res = await fetch(resolveRejectPurchaseOrderUrl(tradeId), {
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
    throw new RejectPurchaseOrderApiError('발주서 반려에 실패했습니다.', null);
  }

  let data: RejectPurchaseOrderApiResponse;
  try {
    data = JSON.parse(bodyText) as RejectPurchaseOrderApiResponse;
  } catch {
    throw new RejectPurchaseOrderApiError(bodyText || '발주서 반려에 실패했습니다.', null);
  }

  if (data.errorCode && data.errorCode !== 'SUCCESS') {
    throw new RejectPurchaseOrderApiError(
      data.message || '발주서 반려에 실패했습니다.',
      data.errorCode,
    );
  }

  if (!res.ok) {
    throw new RejectPurchaseOrderApiError(
      data.message || '발주서 반려에 실패했습니다.',
      data.errorCode,
    );
  }
}
