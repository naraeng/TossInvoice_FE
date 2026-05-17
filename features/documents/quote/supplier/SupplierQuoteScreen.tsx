import { QuoteDocumentBody } from '@/components/documents/QuoteDocumentBody';
import type { QuoteDocument } from '@/types/documents/document';

import { SupplierQuoteDraftScreen } from './SupplierQuoteDraftScreen';
import type { MockClient } from './constants';

type Props = {
  quote: QuoteDocument;
  editable: boolean;
  showSignature: boolean;
  lastSavedLabel?: string;
  onItemsChange?: (items: QuoteDocument['items']) => void;
  onClientChange?: (client: MockClient) => void;
  onSignatureChange?: (signed: boolean) => void;
};

export function SupplierQuoteScreen({
  quote,
  editable,
  showSignature,
  lastSavedLabel,
  onItemsChange,
  onClientChange,
  onSignatureChange,
}: Props) {
  if (quote.status === 'DRAFT' && editable && onItemsChange && onClientChange) {
    return (
      <SupplierQuoteDraftScreen
        quote={quote}
        lastSavedLabel={lastSavedLabel}
        onItemsChange={onItemsChange}
        onClientChange={onClientChange}
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
      {quote.status === 'PO_ISSUED' && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          발주처가 발행한 PO를 확인하고 서명하면 거래가 확정됩니다.
        </p>
      )}
      {quote.status === 'PO_CONFIRMED' && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          양측 서명이 완료되었습니다. 인보이스를 발행할 수 있습니다.
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
