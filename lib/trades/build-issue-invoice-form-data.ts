import { dataUrlToSignatureFile } from '@/lib/documents/signature-file';
import type { QuoteDocument } from '@/types/documents/document';

import { IssueInvoiceValidationError } from './issue-invoice-errors';

/** POST /api/v1/trades/{tradeId}/invoice — `data` JSON part */
export type IssueInvoiceDataPayload = {
  shippingInfo: string;
};

export function buildInvoiceShippingInfo(
  quote: QuoteDocument,
  trackingNumber: string,
): string {
  const courier = quote.courier?.trim() || 'CJ대한통운';
  const tracking = trackingNumber.trim();
  if (!tracking) {
    throw new IssueInvoiceValidationError('운송장 번호를 입력해 주세요.');
  }

  const info = `택배사 ${courier} 송장 ${tracking}`;
  if (info.length > 255) {
    return info.slice(0, 255);
  }
  return info;
}

export function buildIssueInvoiceFormData(
  quote: QuoteDocument,
  trackingNumber: string,
  signatureDataUrl: string,
): FormData {
  const shippingInfo = buildInvoiceShippingInfo(quote, trackingNumber);

  if (!signatureDataUrl) {
    throw new IssueInvoiceValidationError('서명 이미지가 필요합니다.');
  }

  const data: IssueInvoiceDataPayload = { shippingInfo };

  const formData = new FormData();
  formData.append(
    'data',
    new File([JSON.stringify(data)], 'data.json', { type: 'application/json' }),
  );
  formData.append('signature', dataUrlToSignatureFile(signatureDataUrl));

  return formData;
}
