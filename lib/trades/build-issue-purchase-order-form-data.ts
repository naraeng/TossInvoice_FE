import { dataUrlToSignatureFile } from '@/lib/documents/signature-file';
import type { QuoteDocument } from '@/types/documents/document';

import { IssuePurchaseOrderValidationError } from './issue-purchase-order-errors';

/** PUT /api/v1/trades/{tradeId}/purchase-order — `data` JSON part */
export type IssuePurchaseOrderDataPayload = {
  desiredDeliveryDate: string;
};

export function buildIssuePurchaseOrderFormData(
  quote: QuoteDocument,
  signatureDataUrl: string,
): FormData {
  const desiredDeliveryDate = quote.deliveryDate?.trim();
  if (!desiredDeliveryDate) {
    throw new IssuePurchaseOrderValidationError('납품 확정일을 입력해 주세요.');
  }

  if (!signatureDataUrl) {
    throw new IssuePurchaseOrderValidationError('서명 이미지가 필요합니다.');
  }

  const data: IssuePurchaseOrderDataPayload = { desiredDeliveryDate };

  const formData = new FormData();
  formData.append(
    'data',
    new File([JSON.stringify(data)], 'data.json', { type: 'application/json' }),
  );
  formData.append('signature', dataUrlToSignatureFile(signatureDataUrl));

  return formData;
}
