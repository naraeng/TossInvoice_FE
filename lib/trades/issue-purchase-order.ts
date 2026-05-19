import { getAccessToken } from '@/lib/auth-storage';
import type { QuoteDocument } from '@/types/documents/document';

import { buildIssuePurchaseOrderFormData } from './build-issue-purchase-order-form-data';
import { START_TRADE_PATH } from './build-start-trade-form-data';
import { IssuePurchaseOrderApiError } from './issue-purchase-order-errors';

type IssuePurchaseOrderApiResponse = {
  errorCode: string | null;
  message: string;
  result: unknown;
};

function resolveIssuePurchaseOrderUrl(tradeId: number): string {
  const path = `${START_TRADE_PATH}/${tradeId}/purchase-order`;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, '')}${path}`;
  return path;
}

/**
 * PO 작성·서명·발행 완료 — PUT /api/v1/trades/{tradeId}/purchase-order
 * multipart: `data`(JSON) + `signature`(이미지)
 */
export async function issuePurchaseOrder(
  tradeId: number,
  quote: QuoteDocument,
  signatureDataUrl: string,
): Promise<void> {
  const formData = buildIssuePurchaseOrderFormData(quote, signatureDataUrl);
  const token = getAccessToken();

  const res = await fetch(resolveIssuePurchaseOrderUrl(tradeId), {
    method: 'PUT',
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
    throw new IssuePurchaseOrderApiError('발주서 발행에 실패했습니다.', null);
  }

  let data: IssuePurchaseOrderApiResponse;
  try {
    data = JSON.parse(bodyText) as IssuePurchaseOrderApiResponse;
  } catch {
    throw new IssuePurchaseOrderApiError(
      bodyText || '발주서 발행에 실패했습니다.',
      null,
    );
  }

  if (data.errorCode && data.errorCode !== 'SUCCESS') {
    throw new IssuePurchaseOrderApiError(
      data.message || '발주서 발행에 실패했습니다.',
      data.errorCode,
    );
  }

  if (!res.ok) {
    throw new IssuePurchaseOrderApiError(
      data.message || '발주서 발행에 실패했습니다.',
      data.errorCode,
    );
  }
}
