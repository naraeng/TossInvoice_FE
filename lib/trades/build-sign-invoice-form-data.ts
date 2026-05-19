import { dataUrlToSignatureFile } from '@/lib/documents/signature-file';

import { SignInvoiceValidationError } from './sign-invoice-errors';

/** POST /api/v1/trades/{tradeId}/invoice/sign — `signature` 파트만 */
export function buildSignInvoiceFormData(signatureDataUrl: string): FormData {
  if (!signatureDataUrl) {
    throw new SignInvoiceValidationError('서명 이미지가 필요합니다.');
  }

  const formData = new FormData();
  formData.append('signature', dataUrlToSignatureFile(signatureDataUrl));
  return formData;
}
