import { getAccessToken } from '@/lib/auth-storage';

import { buildSignInvoiceFormData } from './build-sign-invoice-form-data';
import { START_TRADE_PATH } from './build-start-trade-form-data';
import { SignInvoiceApiError } from './sign-invoice-errors';

type SignInvoiceApiResponse = {
  errorCode: string | null;
  message: string;
  result: unknown;
};

function resolveSignInvoiceUrl(tradeId: number): string {
  const path = `${START_TRADE_PATH}/${tradeId}/invoice/sign`;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (base) return `${base.replace(/\/$/, '')}${path}`;
  return path;
}

/**
 * 인보이스 최종 서명(발주처) — POST /api/v1/trades/{tradeId}/invoice/sign
 * multipart: `signature`(이미지)만
 * 성공 시 204, 거래 상태 PENDING_BUYER_CONFIRM → COMPLETED
 */
export async function signInvoice(tradeId: number, signatureDataUrl: string): Promise<void> {
  const formData = buildSignInvoiceFormData(signatureDataUrl);
  const token = getAccessToken();

  const res = await fetch(resolveSignInvoiceUrl(tradeId), {
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
    throw new SignInvoiceApiError('최종 서명에 실패했습니다.', null);
  }

  let data: SignInvoiceApiResponse;
  try {
    data = JSON.parse(bodyText) as SignInvoiceApiResponse;
  } catch {
    throw new SignInvoiceApiError(bodyText || '최종 서명에 실패했습니다.', null);
  }

  if (data.errorCode && data.errorCode !== 'SUCCESS') {
    throw new SignInvoiceApiError(data.message || '최종 서명에 실패했습니다.', data.errorCode);
  }

  if (!res.ok) {
    throw new SignInvoiceApiError(data.message || '최종 서명에 실패했습니다.', data.errorCode);
  }
}
