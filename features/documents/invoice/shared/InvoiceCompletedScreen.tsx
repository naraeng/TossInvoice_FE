'use client';

import { InvoiceCompletedHeader } from '@/features/documents/invoice/shared/InvoiceCompletedHeader';
import { InvoiceCompletedSignatures } from '@/features/documents/invoice/shared/InvoiceCompletedSignatures';
import { InvoicePaymentCompleted } from '@/features/documents/invoice/supplier/components/InvoicePaymentCompleted';
import { InvoiceShippingSection } from '@/features/documents/invoice/supplier/components/InvoiceShippingSection';
import { TransactionStatementDocument } from '@/features/documents/invoice/supplier/components/TransactionStatementDocument';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

/** 거래 완료 후 양측(수주처·발주처) 동일 보관용 invoice */
export function InvoiceCompletedScreen({ quote }: Props) {
  const trackingNumber = quote.trackingNumber ?? '';

  return (
    <div className="space-y-5">
      <InvoiceCompletedHeader quote={quote} />
      <article className="overflow-hidden border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
        <TransactionStatementDocument quote={quote} trackingNumber={trackingNumber}>
          <InvoiceShippingSection
            quote={quote}
            trackingNumber={trackingNumber}
            readOnly
            delivered
          />
          <InvoicePaymentCompleted quote={quote} />
          <InvoiceCompletedSignatures quote={quote} />
        </TransactionStatementDocument>
        <footer className="border-t border-slate-100 px-8 py-4 text-center text-[10px] text-slate-400">
          본 최종 invoice는 토스인보이스를 통해 발행·보관됩니다.
          {quote.transactionToken && (
            <>
              {' '}
              · hash: {quote.transactionToken.slice(0, 6)}…{quote.transactionToken.slice(-4)}
            </>
          )}
          <span className="float-right text-slate-300">Page 1 of 1</span>
        </footer>
      </article>
    </div>
  );
}
