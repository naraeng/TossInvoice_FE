'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { DocumentShell } from '@/components/documents/DocumentShell';
import { DocumentSidebar } from '@/features/documents/components/DocumentSidebar';
import { QuoteScreenRouter } from '@/features/documents/quote/QuoteScreenRouter';
import { SupplierQuoteDraftSidebar } from '@/features/documents/quote/supplier/SupplierQuoteDraftSidebar';
import type { MockClient } from '@/features/documents/quote/supplier/constants';
import { getScreenConfig } from '@/lib/documents/get-screen-config';
import { saveQuote } from '@/lib/documents/quote-store';
import { calcTotals } from '@/lib/documents/calc-totals';
import type { QuoteDocument, UserRole } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  viewerRole: UserRole;
};

function formatSavedLabel(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 10) return '방금';
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export function QuoteDetailContainer({ quote: initialQuote, viewerRole }: Props) {
  const router = useRouter();
  const [quote, setQuote] = useState(initialQuote);
  const [busy, setBusy] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(() => new Date());
  const [lastSavedLabel, setLastSavedLabel] = useState('방금');
  const [hasSignature, setHasSignature] = useState(false);

  const config = getScreenConfig(viewerRole, quote.status);
  const isDraftSupplier = viewerRole === 'SUPPLIER' && quote.status === 'DRAFT';

  useEffect(() => {
    const tick = setInterval(() => {
      setLastSavedLabel(formatSavedLabel(lastSavedAt));
    }, 5000);
    return () => clearInterval(tick);
  }, [lastSavedAt]);

  const persist = useCallback((next: QuoteDocument) => {
    setQuote(next);
    saveQuote(next);
    const now = new Date();
    setLastSavedAt(now);
    setLastSavedLabel(formatSavedLabel(now));
  }, []);

  const handleItemsChange = (items: QuoteDocument['items']) => {
    persist({ ...quote, items, totals: calcTotals(items) });
  };

  const handleClientChange = (client: MockClient) => {
    persist({
      ...quote,
      client: {
        companyId: client.id,
        companyName: client.name,
        role: 'CLIENT',
      },
      bankVerified: client.verified,
    });
  };

  const handleSaveDraft = () => {
    saveQuote(quote);
    const now = new Date();
    setLastSavedAt(now);
    setLastSavedLabel(formatSavedLabel(now));
  };

  const handleAction = async (action: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/documents/quotes/${quote.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, patch: quote }),
      });
      const result = await res.json();
      if (!result.ok) {
        alert(result.error ?? '처리에 실패했습니다.');
        return;
      }
      setQuote(result.quote);
      router.refresh();
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const draftActions = [
    {
      label: '서명하고 견적서 발행',
      variant: 'primary' as const,
      disabled: busy || !hasSignature,
      onClick: () => handleAction('ISSUE_QUOTE'),
    },
    {
      label: '임시저장',
      variant: 'secondary' as const,
      disabled: busy,
      onClick: handleSaveDraft,
    },
  ];

  const sidebar = isDraftSupplier ? (
    <SupplierQuoteDraftSidebar totals={quote.totals} actions={draftActions} />
  ) : (
    <DocumentSidebar
      quote={quote}
      config={config}
      viewerRole={viewerRole}
      onAction={handleAction}
      busy={busy}
    />
  );

  return (
    <DocumentShell variant={isDraftSupplier ? 'draft' : 'default'} sidebar={sidebar}>
      <QuoteScreenRouter
        quote={quote}
        viewerRole={viewerRole}
        editable={config.editable}
        showSignature={config.showSignature}
        lastSavedLabel={lastSavedLabel}
        onItemsChange={config.editable ? handleItemsChange : undefined}
        onClientChange={isDraftSupplier ? handleClientChange : undefined}
        onSignatureChange={isDraftSupplier ? setHasSignature : undefined}
      />
    </DocumentShell>
  );
}
