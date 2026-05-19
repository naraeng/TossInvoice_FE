import type { QuoteDocument } from '@/types/documents/document';

export type QuoteSchedule = {
  productionDays?: number;
  paymentDueDays?: number;
  validityUntil?: string;
};

function toDateOnly(base: Date) {
  return base.toISOString().slice(0, 10);
}

export function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function minValidityUntilDate() {
  return toDateOnly(addDays(new Date(), 1));
}

export function normalizeProductionDays(value: number | undefined) {
  if (value == null || !Number.isFinite(value) || value < 1) return undefined;
  return Math.round(value);
}

export function normalizePaymentDueDays(value: number | undefined) {
  if (value == null || !Number.isFinite(value) || value < 1) return undefined;
  return Math.round(value);
}

/** 견적에 저장된 값만 반환 (기본값 없음) */
export function resolveQuoteSchedule(
  quote: Pick<QuoteDocument, 'productionDays' | 'paymentDueDays' | 'validityUntil'>,
): QuoteSchedule {
  return {
    productionDays: quote.productionDays,
    paymentDueDays: quote.paymentDueDays,
    validityUntil: quote.validityUntil,
  };
}

export function formatShortDate(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}.${d}`;
}

export function formatValidityLabel(isoDate: string) {
  const [y, m, d] = isoDate.split('-');
  return `~ ${y}.${m}.${d}`;
}

export function getProductionRange(productionDays: number, base = new Date()) {
  const start = addDays(base, 1);
  const end = addDays(start, productionDays - 1);
  return { start, end };
}

/** 견적 발행 API `data.validUntil` (LocalDateTime), 예: 2026-05-24T23:59:00 */
export function toValidUntilDateTime(isoDate: string) {
  return `${isoDate}T23:59:00`;
}

export function buildIssueQuoteSchedulePayload(quote: QuoteDocument) {
  const schedule = resolveQuoteSchedule(quote);
  return {
    ...(schedule.productionDays != null && { productionDays: schedule.productionDays }),
    ...(schedule.validityUntil && { validUntil: toValidUntilDateTime(schedule.validityUntil) }),
    ...(schedule.paymentDueDays != null && { paymentDueDays: schedule.paymentDueDays }),
  };
}

export function formatDeliveryScheduleSummary(schedule: QuoteSchedule) {
  const parts: string[] = [];
  if (schedule.productionDays != null) {
    parts.push(`제작 ${schedule.productionDays}일`);
  }
  if (schedule.paymentDueDays != null) {
    parts.push(`납품 후 ${schedule.paymentDueDays}일 내 결제`);
  }
  return parts.length > 0 ? parts.join(' · ') : undefined;
}
