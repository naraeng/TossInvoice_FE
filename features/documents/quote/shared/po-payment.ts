import {
  DOWN_PAYMENT_RATIO,
  maskBankAccount,
} from '@/features/documents/quote/supplier/constants';
import { formatKRW } from '@/lib/documents/format';
import type { QuoteDocument, Totals } from '@/types/documents/document';

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

/** supplierProfile.bankAccount — "국민은행 · 123456-78-901234" */
export function formatSupplierBankDisplay(quote: QuoteDocument) {
  const raw = quote.supplierProfile?.bankAccount?.trim() ?? '';
  if (!raw) {
    return { bankLine: '', holder: quote.supplier.companyName };
  }

  const [bankPart = '', accountPart = ''] = raw.split('·').map((part) => part.trim());
  const bankLine = [bankPart, accountPart].filter(Boolean).join(' ');

  return {
    bankLine,
    holder: quote.supplier.companyName,
  };
}

/** 잔금 송금 완료 안내 — "수주처명 농협 351-****-***-91**" */
export function formatBalanceTransferLabel(quote: QuoteDocument): string {
  const raw = quote.supplierProfile?.bankAccount?.trim() ?? '';
  const holder = quote.supplier.companyName;
  if (!raw) return holder;

  const [bankPart = '', accountPart = ''] = raw.split('·').map((part) => part.trim());
  const bank = bankPart.replace(/\s*은행$/, '').trim();
  const maskedAccount = accountPart ? maskBankAccount(accountPart) : '';
  const bankLabel = bank ? `${bank}은행` : '';
  return [holder, bankLabel, maskedAccount].filter(Boolean).join(' ');
}

export function formatPaymentTimestamp(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    return iso.slice(0, 10).replace(/-/g, '.');
  }
  const date = iso.slice(0, 10).replace(/-/g, '.');
  const time = d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${date} ${time}`;
}
