import { DocumentHeader } from '@/components/documents/DocumentHeader';
import { LineItemTable } from '@/components/documents/LineItemTable';
import { SignatureBox } from '@/components/documents/SignatureBox';
import { TotalsSection } from '@/components/documents/TotalsSection';
import type { QuoteDocument, UserRole } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  editable: boolean;
  showSignature: boolean;
  signatureRole?: UserRole;
  onItemsChange?: (items: QuoteDocument['items']) => void;
};

export function QuoteDocumentBody({
  quote,
  editable,
  showSignature,
  signatureRole = 'SUPPLIER',
  onItemsChange,
}: Props) {
  return (
    <div className="space-y-6">
      <DocumentHeader quote={quote} />
      <LineItemTable
        items={quote.items}
        mode={editable ? 'edit' : 'readonly'}
        onChange={onItemsChange}
      />
      <TotalsSection totals={quote.totals} />
      {showSignature && (
        <SignatureBox role={signatureRole} signatures={quote.signatures} />
      )}
      {quote.status === 'REJECTED' && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          이 견적은 반려된 상태입니다.
        </p>
      )}
    </div>
  );
}
