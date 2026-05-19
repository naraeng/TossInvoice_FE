import { dataUrlToSignatureFile } from '@/lib/documents/signature-file';
import type { QuoteDocument } from '@/types/documents/document';

import { SignPurchaseOrderValidationError } from './sign-purchase-order-errors';

/** POST /api/v1/trades/{tradeId}/purchase-order/sign — `data` JSON part */
export type SignPurchaseOrderDataPayload = {
  confirmedDeliveryDate: string;
};

function isFutureDate(isoDate: string): boolean {
  const delivery = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(delivery.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return delivery > today;
}

export function buildSignPurchaseOrderFormData(
  quote: QuoteDocument,
  signatureDataUrl: string,
): FormData {
  const confirmedDeliveryDate = quote.deliveryDate?.trim();
  if (!confirmedDeliveryDate) {
    throw new SignPurchaseOrderValidationError('납품 확정일을 확인해 주세요.');
  }

  if (!isFutureDate(confirmedDeliveryDate)) {
    throw new SignPurchaseOrderValidationError('납품 확정일은 오늘 이후여야 합니다.');
  }

  if (!signatureDataUrl) {
    throw new SignPurchaseOrderValidationError('서명 이미지가 필요합니다.');
  }

  const data: SignPurchaseOrderDataPayload = { confirmedDeliveryDate };

  const formData = new FormData();
  formData.append(
    'data',
    new File([JSON.stringify(data)], 'data.json', { type: 'application/json' }),
  );
  formData.append('signature', dataUrlToSignatureFile(signatureDataUrl));

  return formData;
}
