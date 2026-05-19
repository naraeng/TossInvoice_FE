import { ChevronRight } from 'lucide-react';

import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
};

export function PoDraftHeader({ quote }: Props) {
  const piNo = quote.piDocumentNo ?? quote.documentNo;

  return (
    <header className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <span>거래</span>
            <ChevronRight className="size-3.5" />
            <span>받은 견적서</span>
            <ChevronRight className="size-3.5" />
            <span className="text-slate-700">{piNo}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            발주서 작성
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
            수주처가 서명한 견적서(PI)가 발주서(PO)로 자동 변환되었어요. 납품일을 확인하고 서명해
            발행하세요.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 self-start">
          <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
            PI → PO 자동 변환됨
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
            서명 대기 중
          </span>
        </div>
      </div>
    </header>
  );
}
