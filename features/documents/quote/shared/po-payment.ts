import { DOWN_PAYMENT_RATIO } from '@/features/documents/quote/supplier/constants';
import { formatKRW } from '@/lib/documents/format';
import type { Totals } from '@/types/documents/document';

export function calcPoPaymentAmounts(totals: Totals) {
  const downPayment = Math.round(totals.subtotal * DOWN_PAYMENT_RATIO);
  const balance = totals.total - downPayment;
  return {
    downPayment,
    balance,
    downPaymentLabel: formatKRW(downPayment),
    balanceLabel: formatKRW(balance),
  };
}
