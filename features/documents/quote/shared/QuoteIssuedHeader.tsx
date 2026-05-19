import { Check, ChevronRight } from 'lucide-react';

import type { QuoteDocument, UserRole } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  viewerRole: UserRole;
};

export function QuoteIssuedHeader({ quote, viewerRole }: Props) {
  const isSupplier = viewerRole === 'SUPPLIER';

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <span>거래</span>
            <ChevronRight className="size-3.5" />
            <span>견적서</span>
            <ChevronRight className="size-3.5" />
            <span className="text-slate-700">{quote.documentNo}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            견적서 발행 완료
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isSupplier ? (
              <>
                발주처(<span className="font-semibold text-slate-700">{quote.client.companyName}</span>
                )에 전송되었습니다. 검토 후 발주서(PO)가 도착해요
              </>
            ) : (
              <>
                수주처(
                <span className="font-semibold text-slate-700">{quote.supplier.companyName}</span>
                )의 견적서가 도착했습니다. 내용 확인 후 발주서를 작성하세요
              </>
            )}
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          <Check className="size-3.5" strokeWidth={3} />
          {isSupplier ? '발행 완료 · 발주처 검토 중' : '수신 완료 · 검토 필요'}
        </span>
      </div>
    </header>
  );
}
