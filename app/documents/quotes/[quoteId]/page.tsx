import Link from 'next/link';
import { notFound } from 'next/navigation';

import { QuoteDetailContainer } from '@/features/documents/quote/QuoteDetailContainer';
import { CURRENT_COMPANY_ID } from '@/lib/documents/current-company';
import { getQuoteById } from '@/lib/documents/quote-store';
import { getViewerRole } from '@/lib/documents/get-viewer-role';

type PageProps = {
  params: Promise<{ quoteId: string }>;
};

export default async function QuoteDetailPage({ params }: PageProps) {
  const { quoteId } = await params;
  const quote = getQuoteById(quoteId);

  if (!quote) {
    notFound();
  }

  let viewerRole;
  try {
    viewerRole = getViewerRole(CURRENT_COMPANY_ID, quote);
  } catch {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-slate-600">이 문서에 접근할 권한이 없습니다.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-blue-600 font-semibold">
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  return <QuoteDetailContainer quote={quote} viewerRole={viewerRole} />;
}
