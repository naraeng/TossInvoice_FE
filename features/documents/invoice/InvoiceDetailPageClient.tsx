'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { InvoiceDetailContainer } from '@/features/documents/invoice/InvoiceDetailContainer';
import { useAuthGuard } from '@/lib/auth-guard';
import { getQuoteById } from '@/lib/documents/quote-store';
import { resolveCurrentCompanyClient } from '@/lib/documents/resolve-current-company-client';
import { fetchTradeDetail } from '@/lib/trades/fetch-trade-detail';
import { mapTradeDetailToQuote } from '@/lib/trades/map-trade-to-quote';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  invoiceId: string;
};

function parseTradeId(id: string): number | null {
  const m = id.match(/^trade-(\d+)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export function InvoiceDetailPageClient({ invoiceId }: Props) {
  const { ready } = useAuthGuard();
  const [quote, setQuote] = useState<QuoteDocument | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    void (async () => {
      let supplier = false;
      try {
        const company = await resolveCurrentCompanyClient();
        supplier = company.role === 'SUPPLIER';
      } catch {
        if (!cancelled) {
          setAllowed(false);
          return;
        }
      }

      if (!supplier) {
        if (!cancelled) setAllowed(false);
        return;
      }

      // invoice 화면은 수주처(SELLER) 전용
      const tradeId = parseTradeId(invoiceId);
      let nextQuote: QuoteDocument | undefined;

      if (tradeId != null) {
        try {
          const detail = await fetchTradeDetail(tradeId);
          nextQuote = {
            ...mapTradeDetailToQuote(detail, { perspectiveRole: 'SELLER' }),
            viewerRoleHint: 'SUPPLIER' as const,
          };
        } catch {
          if (!cancelled) setNotFound(true);
          return;
        }
      } else {
        nextQuote = getQuoteById(invoiceId);
        if (!nextQuote) {
          if (!cancelled) setNotFound(true);
          return;
        }
      }

      if (!cancelled && nextQuote) {
        setQuote(nextQuote);
        setAllowed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, invoiceId]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-500">
        로그인 상태를 확인하는 중…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-slate-600">문서를 찾을 수 없습니다.</p>
        <Link href="/trade" className="mt-4 inline-block font-semibold text-blue-600">
          거래 목록으로
        </Link>
      </div>
    );
  }

  if (allowed === false) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-slate-600">수주처만 인보이스를 발행할 수 있습니다.</p>
        <Link
          href={`/documents/quotes/${invoiceId}`}
          className="mt-4 inline-block font-semibold text-blue-600"
        >
          견적/발주 화면으로
        </Link>
      </div>
    );
  }

  if (!quote || allowed === null) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-500">
        문서 정보를 불러오는 중…
      </div>
    );
  }

  return <InvoiceDetailContainer quote={quote} />;
}
