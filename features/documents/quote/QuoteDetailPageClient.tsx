'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { QuoteDetailContainer } from '@/features/documents/quote/QuoteDetailContainer';
import { getViewerRole } from '@/lib/documents/get-viewer-role';
import { resolveCurrentCompanyClient } from '@/lib/documents/resolve-current-company-client';
import type { QuoteDocument, UserRole } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function QuoteDetailPageClient({ quote }: Props) {
  const [viewerRole, setViewerRole] = useState<UserRole | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const company = await resolveCurrentCompanyClient();
        getViewerRole(company.companyId, quote);
        if (!cancelled) {
          setViewerRole(company.role);
          setDenied(false);
        }
      } catch {
        if (!cancelled) {
          setDenied(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [quote]);

  if (denied) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-slate-600">이 문서에 접근할 권한이 없습니다.</p>
        <Link href="/dashboard" className="mt-4 inline-block font-semibold text-blue-600">
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  if (!viewerRole) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-500">
        문서 정보를 불러오는 중…
      </div>
    );
  }

  return <QuoteDetailContainer quote={quote} viewerRole={viewerRole} />;
}
