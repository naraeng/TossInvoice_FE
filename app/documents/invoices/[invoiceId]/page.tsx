import Link from 'next/link';
import { notFound } from 'next/navigation';

import { InvoiceDetailContainer } from '@/features/documents/invoice/InvoiceDetailContainer';
import { CURRENT_COMPANY_ID } from '@/lib/documents/current-company';
import { getQuoteById } from '@/lib/documents/quote-store';
import { getViewerRole } from '@/lib/documents/get-viewer-role';

type PageProps = {
  params: Promise<{ invoiceId: string }>;
};

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { invoiceId } = await params;
  const quote = getQuoteById(invoiceId);

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
        <Link href="/dashboard" className="mt-4 inline-block font-semibold text-blue-600">
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  if (viewerRole !== 'SUPPLIER') {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-slate-600">수주처만 인보이스를 발행할 수 있습니다.</p>
        <Link href={`/documents/quotes/${invoiceId}`} className="mt-4 inline-block font-semibold text-blue-600">
          견적/발주 화면으로
        </Link>
      </div>
    );
  }

  return <InvoiceDetailContainer quote={quote} />;
}
