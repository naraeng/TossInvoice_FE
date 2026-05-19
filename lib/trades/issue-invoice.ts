import { getAccessToken } from '@/lib/auth-storage';
import type { QuoteDocument } from '@/types/documents/document';

import { buildIssueInvoiceFormData } from './build-issue-invoice-form-data';
import { START_TRADE_PATH } from './build-start-trade-form-data';
import { IssueInvoiceApiError } from './issue-invoice-errors';

type IssueInvoiceApiResponse = {
  errorCode: string | null;
  message: string;
  result: unknown;
};

function resolveIssueInvoiceUrl(tradeId: number): string {
  const path = `${START_TRADE_PATH}/${tradeId}/invoice`;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, '')}${path}`;
  return path;
}

/**
 * 최종 인보이스 작성·서명·발행(수주처) — POST /api/v1/trades/{tradeId}/invoice
 * multipart: `data`(JSON) + `signature`(이미지)
 * 성공 시 204, 거래 상태 PENDING_INVOICE → PENDING_BUYER_CONFIRM
 */
export async function issueInvoice(
  tradeId: number,
  quote: QuoteDocument,
  trackingNumber: string,
  signatureDataUrl: string,
): Promise<void> {
  const formData = buildIssueInvoiceFormData(quote, trackingNumber, signatureDataUrl);
  const token = getAccessToken();

  const res = await fetch(resolveIssueInvoiceUrl(tradeId), {
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
    throw new IssueInvoiceApiError('인보이스 발행에 실패했습니다.', null);
  }

  let data: IssueInvoiceApiResponse;
  try {
    data = JSON.parse(bodyText) as IssueInvoiceApiResponse;
  } catch {
    throw new IssueInvoiceApiError(bodyText || '인보이스 발행에 실패했습니다.', null);
  }

  if (data.errorCode && data.errorCode !== 'SUCCESS') {
    throw new IssueInvoiceApiError(
      data.message || '인보이스 발행에 실패했습니다.',
      data.errorCode,
    );
  }

  if (!res.ok) {
    throw new IssueInvoiceApiError(
      data.message || '인보이스 발행에 실패했습니다.',
      data.errorCode,
    );
  }
}
