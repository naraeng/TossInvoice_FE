'use client';

import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { QuoteProtectionStatus } from '@/features/documents/quote/shared/QuoteProtectionStatus';
import { QuoteTransactionStepper } from '@/features/documents/quote/shared/QuoteTransactionStepper';
import { cn } from '@/lib/utils';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  busy?: boolean;
  onStartPo?: () => void;
  onReject?: () => void;
};

function SidebarDivider({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-slate-100', className)} />;
}

export function ClientQuoteIssuedSidebar({ quote, busy, onStartPo, onReject }: Props) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-emerald-500" aria-hidden />

      <div className="p-6">
        <h2 className="text-sm font-bold text-emerald-500">🔔 거래 상태</h2>
        <p className="mt-2 text-base font-bold text-slate-900">견적서 검토 필요</p>
        <p className="mt-1 text-xs text-slate-500">
          {quote.supplier.companyName}의 PI를 확인하고 발주서를 작성하세요
        </p>

        <SidebarDivider className="my-6" />

        <QuoteTransactionStepper status={quote.status} viewerRole="CLIENT" />

        <SidebarDivider className="my-6" />

        <p className="text-sm font-bold text-slate-800">다음 액션</p>
        <div className="mt-3 space-y-2">
          <Button
            type="button"
            className="h-auto w-full flex-col gap-0.5 rounded-xl bg-[#3182F6] py-3.5 text-sm font-bold shadow-[0_4px_14px_-4px_rgba(49,130,246,0.55)] hover:bg-[#1b64da] disabled:opacity-60"
            onClick={onStartPo}
            disabled={busy || !quote.tradeId}
          >
            해당 내용으로 발주서 작성하기
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-center gap-2 rounded-xl border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            disabled={busy}
          >
            <Download className="size-4" />
            PDF 다운로드
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-rose-200 bg-white text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
            onClick={onReject}
            disabled={busy || !quote.tradeId}
          >
            거래 취소·수정 요청
          </Button>
        </div>

        <SidebarDivider className="my-6" />

        <QuoteProtectionStatus />
      </div>
    </aside>
  );
}
