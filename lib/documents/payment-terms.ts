import type { Totals } from '@/types/documents/document';

export const DEFAULT_DOWN_PAYMENT_PERCENT = 30;

export function clampDownPaymentPercent(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_DOWN_PAYMENT_PERCENT;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function parseDownPaymentPercentFromTerms(paymentTerms?: string) {
  const match = paymentTerms?.match(/선금\s*(\d+)\s*%/);
  if (match) return clampDownPaymentPercent(Number(match[1]));
  return DEFAULT_DOWN_PAYMENT_PERCENT;
}

export function formatPaymentTerms(downPaymentPercent: number) {
  const down = clampDownPaymentPercent(downPaymentPercent);
  const balance = 100 - down;
  return `선금 ${down}% / 잔금 ${balance}%`;
}

export function resolveDownPaymentPercent(input: {
  downPaymentPercent?: number;
  paymentTerms?: string;
}) {
  if (input.downPaymentPercent != null) {
    return clampDownPaymentPercent(input.downPaymentPercent);
  }
  return parseDownPaymentPercentFromTerms(input.paymentTerms);
}

export function calcPaymentSplit(totals: Totals, downPaymentPercent: number) {
  const percent = clampDownPaymentPercent(downPaymentPercent);
  const balancePercent = 100 - percent;
  const downPayment = Math.round(totals.total * (percent / 100));
  const balance = totals.total - downPayment;

  return {
    downPaymentPercent: percent,
    balancePercent,
    downPayment,
    balance,
  };
}
