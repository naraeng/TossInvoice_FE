'use client';

import { Bell, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { QuoteProtectionStatus } from '@/features/documents/quote/shared/QuoteProtectionStatus';
import { QuoteTransactionStepper } from '@/features/documents/quote/shared/QuoteTransactionStepper';
import { cn } from '@/lib/utils';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  busy?: boolean;
  onResendNotification?: () => void;
};

function SidebarDivider({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-slate-100', className)} />;
}

export function SupplierQuoteIssuedSidebar({ quote, busy, onResendNotification }: Props) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-emerald-500" aria-hidden />

      <div className="p-6">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold text-slate-900">🔔 거래 상태</h2>
        </div>
        <p className="mt-2 text-base font-bold text-slate-900">발주처 검토 대기 중</p>
        <p className="mt-1 text-xs text-slate-500">
          {quote.client.companyName}가 PI를 확인하고 있어요
        </p>

        <SidebarDivider className="my-6" />

        <QuoteTransactionStepper status={quote.status} viewerRole="SUPPLIER" />

        <SidebarDivider className="my-6" />

        <p className="text-sm font-bold text-slate-800">다음 액션</p>
        <div className="mt-3 space-y-2">
          <Button
            variant="outline"
            className="h-11 w-full justify-center gap-2 rounded-xl border-[#3182F6] bg-white text-sm font-semibold text-[#3182F6] hover:bg-blue-50"
            onClick={onResendNotification}
            disabled={busy}
          >
            <Bell className="size-4" />
            발주처에 알림 다시 보내기
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full justify-center gap-2 rounded-xl border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            disabled={busy}
          >
            <Download className="size-4" />
            PDF 다운로드
          </Button>
        </div>

        <SidebarDivider className="my-6" />

        <QuoteProtectionStatus />
      </div>
    </aside>
  );
}
