import { QuoteDocumentBody } from '@/components/documents/QuoteDocumentBody';
import type { QuoteDocument } from '@/types/documents/document';

import { SupplierQuoteDraftScreen } from './SupplierQuoteDraftScreen';
import { SupplierQuoteIssuedScreen } from './SupplierQuoteIssuedScreen';
import { SupplierQuotePoConfirmedScreen } from './SupplierQuotePoConfirmedScreen';
import { SupplierQuotePoIssuedScreen } from './SupplierQuotePoIssuedScreen';
import type { QuoteSchedule } from '@/lib/documents/schedule';

import type { ClientCompany } from './constants';

type Props = {
  quote: QuoteDocument;
  editable: boolean;
  showSignature: boolean;
  lastSavedLabel?: string;
  onItemsChange?: (items: QuoteDocument['items']) => void;
  onClientChange?: (client: ClientCompany) => void;
  onDownPaymentPercentChange?: (percent: number) => void;
  onScheduleChange?: (patch: Partial<QuoteSchedule>) => void;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
};

export function SupplierQuoteScreen({
  quote,
  editable,
  showSignature,
  lastSavedLabel,
  onItemsChange,
  onClientChange,
  onDownPaymentPercentChange,
  onScheduleChange,
  onSignatureChange,
}: Props) {
  if (quote.status === 'ISSUED') {
    return <SupplierQuoteIssuedScreen quote={quote} />;
  }

  if (quote.status === 'PO_ISSUED') {
    return <SupplierQuotePoIssuedScreen quote={quote} onSignatureChange={onSignatureChange} />;
  }

  if (quote.status === 'PO_CONFIRMED') {
    return <SupplierQuotePoConfirmedScreen quote={quote} />;
  }

  if (quote.status === 'INVOICE_ISSUED') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
        <p className="text-lg font-bold text-emerald-900">최종 invoice 발행 완료</p>
        <p className="mt-2 text-sm text-emerald-800">
          {quote.invoiceDocumentNo ?? 'Invoice'}가 발주처에 전송되었습니다.
        </p>
      </div>
    );
  }

  if (
    quote.status === 'DRAFT' &&
    editable &&
    onItemsChange &&
    onClientChange &&
    onDownPaymentPercentChange &&
    onScheduleChange
  ) {
    return (
      <SupplierQuoteDraftScreen
        quote={quote}
        lastSavedLabel={lastSavedLabel}
        onItemsChange={onItemsChange}
        onClientChange={onClientChange}
        onDownPaymentPercentChange={onDownPaymentPercentChange}
        onScheduleChange={onScheduleChange}
        onSignatureChange={onSignatureChange}
      />
    );
  }

  return (
    <div className="space-y-4">
      {quote.status === 'DRAFT' && (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
          품목과 단가를 입력한 뒤 사이드바에서 견적서를 발행하세요.
        </p>
      )}
      <QuoteDocumentBody
        quote={quote}
        editable={editable}
        showSignature={showSignature}
        signatureRole="SUPPLIER"
        onItemsChange={onItemsChange}
      />
    </div>
  );
}
