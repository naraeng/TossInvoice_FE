import { QuoteDocumentBody } from '@/components/documents/QuoteDocumentBody';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  editable: boolean;
  showSignature: boolean;
  onItemsChange?: (items: QuoteDocument['items']) => void;
};

export function ClientQuoteScreen({
  quote,
  editable,
  showSignature,
  onItemsChange,
}: Props) {
  return (
    <div className="space-y-4">
      {quote.status === 'ISSUED' && (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
          견적 내용을 확인한 뒤 발주하기 또는 반려를 선택하세요.
        </p>
      )}
      {quote.status === 'PO_DRAFT' && (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
          발주 수량·품목을 확인하고 발주서를 발행하세요.
        </p>
      )}
      {quote.status === 'REJECTED' && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          이 견적은 반려되었습니다. 수주처에 재견적을 요청할 수 있습니다.
        </p>
      )}
      <QuoteDocumentBody
        quote={quote}
        editable={editable}
        showSignature={showSignature}
        signatureRole="CLIENT"
        onItemsChange={onItemsChange}
      />
    </div>
  );
}
