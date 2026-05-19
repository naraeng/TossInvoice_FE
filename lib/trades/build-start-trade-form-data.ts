import {
  formatBusinessNumberFromDigits,
  normalizeBusinessNumberDigits,
} from '@/features/documents/quote/supplier/hooks/use-company-search';
import { resolveDownPaymentPercent } from '@/lib/documents/payment-terms';
import { resolveQuoteSchedule, toValidUntilDateTime } from '@/lib/documents/schedule';
import { dataUrlToSignatureFile } from '@/lib/documents/signature-file';
import type { QuoteDocument } from '@/types/documents/document';

import { StartTradeValidationError } from './start-trade-errors';
import type { StartTradeDataPayload } from './types';

export const START_TRADE_PATH = '/api/v1/trades';

function resolveBuyerBusinessNumber(quote: QuoteDocument): string {
  const raw =
    quote.clientProfile?.businessNo?.trim() || quote.client.companyId?.trim() || '';
  const digits = normalizeBusinessNumberDigits(raw);
  if (digits.length === 10) {
    return formatBusinessNumberFromDigits(digits);
  }
  return raw;
}

export function buildStartTradeDataPayload(quote: QuoteDocument): StartTradeDataPayload {
  const schedule = resolveQuoteSchedule(quote);
  const depositRate = resolveDownPaymentPercent(quote);

  const items = quote.items
    .filter(
      (item) =>
        item.description.trim().length > 0 && item.quantity > 0 && item.unitPrice >= 0,
    )
    .map((item, index) => ({
      productName: item.description.trim(),
      productNum: index + 1,
      quantity: Math.max(1, Math.round(item.quantity)),
      unitPrice: Math.round(item.unitPrice),
    }));

  return {
    buyerBusinessNumber: resolveBuyerBusinessNumber(quote),
    productionDays: schedule.productionDays ?? 0,
    validUntil:
      schedule.validityUntil != null
        ? toValidUntilDateTime(schedule.validityUntil)
        : '',
    depositRate,
    tax: Math.max(0, Math.round(quote.totals.tax)),
    items,
  };
}

export function validateStartTradePayload(payload: StartTradeDataPayload) {
  if (!payload.buyerBusinessNumber.trim()) {
    throw new StartTradeValidationError('발주처를 검색해 선택해 주세요.');
  }

  if (!payload.productionDays || payload.productionDays < 1) {
    throw new StartTradeValidationError('제작 소요일을 1일 이상 입력해 주세요.');
  }

  if (!payload.validUntil) {
    throw new StartTradeValidationError('견적 유효기간을 선택해 주세요.');
  }

  if (payload.depositRate < 0 || payload.depositRate > 100) {
    throw new StartTradeValidationError('선금 비율은 0~100% 사이여야 합니다.');
  }

  if (payload.items.length < 1) {
    throw new StartTradeValidationError('품목을 1개 이상 입력해 주세요.');
  }
}

/**
 * PI 발행 — multipart/form-data
 * - `data`: application/json
 * - `signature`: 서명 이미지 (없으면 TRADE_015)
 */
export function buildStartTradeFormData(
  quote: QuoteDocument,
  signatureDataUrl: string,
): FormData {
  const data = buildStartTradeDataPayload(quote);
  validateStartTradePayload(data);

  const formData = new FormData();
  formData.append(
    'data',
    new File([JSON.stringify(data)], 'data.json', { type: 'application/json' }),
  );
  formData.append('signature', dataUrlToSignatureFile(signatureDataUrl));

  return formData;
}
