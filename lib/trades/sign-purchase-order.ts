import { getAccessToken } from '@/lib/auth-storage';
import type { QuoteDocument } from '@/types/documents/document';

import { buildSignPurchaseOrderFormData } from './build-sign-purchase-order-form-data';
import { START_TRADE_PATH } from './build-start-trade-form-data';
import { SignPurchaseOrderApiError } from './sign-purchase-order-errors';

type SignPurchaseOrderApiResponse = {
  errorCode: string | null;
  message: string;
  result: unknown;
};

function resolveSignPurchaseOrderUrl(tradeId: number): string {
  const path = `${START_TRADE_PATH}/${tradeId}/purchase-order/sign`;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, '')}${path}`;
  return path;
}

/**
 * PO 카운터서명(수주처) — POST /api/v1/trades/{tradeId}/purchase-order/sign
 * multipart: `data`(JSON) + `signature`(이미지)
 * 성공 시 204, 거래 상태 PENDING_SELLER_SIGN → PENDING_INVOICE
 */
export async function signPurchaseOrder(
  tradeId: number,
  quote: QuoteDocument,
  signatureDataUrl: string,
): Promise<void> {
  const formData = buildSignPurchaseOrderFormData(quote, signatureDataUrl);
  const token = getAccessToken();

  const res = await fetch(resolveSignPurchaseOrderUrl(tradeId), {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    credentials: 'include',
  });

  if (res.status === 204) return;

  const bodyText = await res.text();
  if (!bodyText) {
    if (res.ok) return;
    throw new SignPurchaseOrderApiError('발주서 서명에 실패했습니다.', null);
  }

  let data: SignPurchaseOrderApiResponse;
  try {
    data = JSON.parse(bodyText) as SignPurchaseOrderApiResponse;
  } catch {
    throw new SignPurchaseOrderApiError(bodyText || '발주서 서명에 실패했습니다.', null);
  }

  if (data.errorCode && data.errorCode !== 'SUCCESS') {
    throw new SignPurchaseOrderApiError(
      data.message || '발주서 서명에 실패했습니다.',
      data.errorCode,
    );
  }

  if (!res.ok) {
    throw new SignPurchaseOrderApiError(
      data.message || '발주서 서명에 실패했습니다.',
      data.errorCode,
    );
  }
}
