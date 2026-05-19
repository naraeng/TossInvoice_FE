'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { DocumentShell } from '@/components/documents/DocumentShell';
import { SupplierInvoiceDraftScreen } from '@/features/documents/invoice/supplier/SupplierInvoiceDraftScreen';
import { SupplierInvoiceDraftSidebar } from '@/features/documents/invoice/supplier/SupplierInvoiceDraftSidebar';
import { enrichInvoiceDraft } from '@/lib/documents/enrich-invoice-draft';
import { saveQuote } from '@/lib/documents/quote-store';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function InvoiceDetailContainer({ quote: initialQuote }: Props) {
  const router = useRouter();
  const [quote, setQuote] = useState(() => enrichInvoiceDraft(initialQuote));
  const [trackingNumber, setTrackingNumber] = useState(() => quote.trackingNumber ?? '');
  const [busy, setBusy] = useState(false);
  const [prevInitialQuote, setPrevInitialQuote] = useState(initialQuote);

  if (initialQuote !== prevInitialQuote) {
    const draft = enrichInvoiceDraft(initialQuote);
    setPrevInitialQuote(initialQuote);
    setQuote(draft);
    setTrackingNumber(draft.trackingNumber ?? '');
  }

  useEffect(() => {
    saveQuote(enrichInvoiceDraft(initialQuote));
  }, [initialQuote]);

  const persist = useCallback((next: QuoteDocument) => {
    setQuote(next);
    saveQuote(next);
  }, []);

  const handleTrackingChange = (value: string) => {
    setTrackingNumber(value);
    persist({ ...quote, trackingNumber: value || undefined });
  };

  const handleIssueInvoice = async () => {
    if (!trackingNumber.trim()) {
      alert('운송장 번호를 입력해주세요.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/documents/quotes/${quote.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ISSUE_INVOICE',
          patch: { ...quote, trackingNumber: trackingNumber.trim() },
        }),
      });
      const result = await res.json();
      if (!result.ok) {
        alert(result.error ?? '발행에 실패했습니다.');
        return;
      }
      setQuote(result.quote);
      router.push(`/documents/quotes/${quote.id}`);
      router.refresh();
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  };

  if (quote.status === 'INVOICE_ISSUED') {
    router.replace(`/documents/quotes/${quote.id}`);
    return null;
  }

  if (quote.status !== 'PO_CONFIRMED') {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-slate-600">PO 확정 후 인보이스를 작성할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <DocumentShell
      variant="draft"
      sidebar={
        <SupplierInvoiceDraftSidebar
          quote={quote}
          busy={busy}
          canIssue={!!trackingNumber.trim()}
          onIssueInvoice={handleIssueInvoice}
          onDownloadPdf={() => alert('PDF 다운로드는 준비 중입니다.')}
          onContactClient={() => alert('발주처 문의 채널로 연결됩니다.')}
        />
      }
    >
      <SupplierInvoiceDraftScreen
        quote={quote}
        trackingNumber={trackingNumber}
        onTrackingNumberChange={handleTrackingChange}
      />
    </DocumentShell>
  );
}
