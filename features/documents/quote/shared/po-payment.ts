import { maskBankAccount } from '@/features/documents/quote/supplier/constants';
import { formatKRW } from '@/lib/documents/format';
import {
  DEFAULT_DOWN_PAYMENT_PERCENT,
  resolveDownPaymentPercent,
} from '@/lib/documents/payment-terms';
import type { QuoteDocument } from '@/types/documents/document';

/**
 * PO 단계의 선금/잔금 금액 산출.
 * - 백엔드가 actualDepositAmount/actualBalanceAmount를 내려주면 실 금액 우선
 * - 미결제 단계는 quote.downPaymentPercent / paymentTerms로 계산 fallback
 * - 백엔드 결제 산출 기준과 일치시키기 위해 total(부가세 포함) 기준
 */
export function calcPoPaymentAmounts(quote: QuoteDocument) {
  const percent = resolveDownPaymentPercent(quote);
  const balancePercent = 100 - percent;
  const calcDownPayment = Math.round(quote.totals.total * (percent / 100));
  const calcBalance = quote.totals.total - calcDownPayment;
  const downPayment =
    typeof quote.actualDepositAmount === 'number' ? quote.actualDepositAmount : calcDownPayment;
  const balance =
    typeof quote.actualBalanceAmount === 'number' ? quote.actualBalanceAmount : calcBalance;
  return {
    downPayment,
    balance,
    downPaymentPercent: percent,
    balancePercent,
    downPaymentLabel: formatKRW(downPayment),
    balanceLabel: formatKRW(balance),
  };
}

export { DEFAULT_DOWN_PAYMENT_PERCENT };

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
