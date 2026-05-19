'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { InvoiceDetailContainer } from '@/features/documents/invoice/InvoiceDetailContainer';
import { resolveCurrentCompanyClient } from '@/lib/documents/resolve-current-company-client';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function InvoiceDetailPageClient({ quote }: Props) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const company = await resolveCurrentCompanyClient();
        if (!cancelled) {
          setAllowed(company.role === 'SUPPLIER');
        }
      } catch {
        if (!cancelled) {
          setAllowed(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (allowed === null) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-500">
        문서 정보를 불러오는 중…
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-slate-600">수주처만 인보이스를 발행할 수 있습니다.</p>
        <Link
          href={`/documents/quotes/${quote.id}`}
          className="mt-4 inline-block font-semibold text-blue-600"
        >
          견적/발주 화면으로
        </Link>
      </div>
    );
  }

  return <InvoiceDetailContainer quote={quote} />;
}
