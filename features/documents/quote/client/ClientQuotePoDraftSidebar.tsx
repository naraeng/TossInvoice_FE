'use client';

import { AlertTriangle, Check } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { PoHorizontalStepper } from '@/features/documents/quote/client/components/PoHorizontalStepper';
import { cn } from '@/lib/utils';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  hasDeliveryDate: boolean;
  hasShippingAddress: boolean;
  hasSignature: boolean;
  busy?: boolean;
  onIssuePo?: () => void;
  onSaveDraft?: () => void;
};

type ChecklistItem = {
  id: number;
  label: string;
  done: boolean;
};

export function ClientQuotePoDraftSidebar({
  quote,
  hasDeliveryDate,
  hasShippingAddress,
  hasSignature,
  busy,
  onIssuePo,
  onSaveDraft,
}: Props) {
  const piNo = quote.piDocumentNo ?? quote.documentNo;
  const canIssue = hasDeliveryDate && hasShippingAddress && hasSignature;

  const checklist: ChecklistItem[] = [
    { id: 1, label: '발주번호 자동 생성', done: !!quote.poDocumentNo },
    { id: 2, label: '발주일 자동 입력', done: !!quote.poIssuedAt },
    { id: 3, label: '거래 정보 PI에서 복사', done: true },
    { id: 4, label: '납품 확정일 입력', done: hasDeliveryDate },
    { id: 5, label: '발주처 서명', done: hasSignature },
  ];

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
      <div className="h-1 bg-violet-600" aria-hidden />

      <div className="space-y-8 p-6">
        <section>
          <div className="flex gap-3">
            <div>
              <p className="text-sm font-bold text-violet-600 mb-2">🔄 자동 변환됨</p>
              <p className="text-sm font-bold text-slate-900">견적서가 발주서로 전환되었어요</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                수주처가 서명한 견적 내용이 그대로 반영됐어요. 납품 일정과 서명만 완료하면 발행할 수
                있어요.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-violet-50 px-3.5 py-3 ring-1 ring-violet-100">
            <p className="text-[10px] font-semibold text-violet-600">원본 PI 견적서</p>
            <p className="mt-0.5 text-sm font-bold text-violet-900">{piNo}</p>
            <p className="mt-1 text-xs text-slate-500">
              발행 : {quote.poIssuedAt ? format(quote.poIssuedAt, 'yyyy.MM.dd') : '-'}
            </p>
          </div>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">📋 발주서 발행 체크리스트</p>
          <ul className="mt-4 space-y-2.5">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5">
                {item.done ? (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                ) : (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {item.id}
                  </span>
                )}
                <span
                  className={cn(
                    'text-sm',
                    item.done ? 'text-slate-600' : 'font-semibold text-slate-900'
                  )}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="text-sm font-bold text-slate-800">🎯 거래 진행</p>
          <div className="mt-4">
            <PoHorizontalStepper />
          </div>
        </section>

        <div className="flex gap-2.5 rounded-xl border border-amber-200/90 bg-[#FFFBEB] px-3.5 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-slate-600">
            발행 시 수주처에 발주서가 전송되고, 안전결제(선금) 프로세스가 시작됩니다.
          </p>
        </div>

        <section className="space-y-3">
          <Button
            type="button"
            className="h-auto w-full flex-col gap-1 rounded-xl bg-[#3182F6] py-3.5 text-sm font-bold shadow-[0_4px_14px_-4px_rgba(49,130,246,0.55)] hover:bg-[#1b64da] disabled:opacity-60"
            onClick={onIssuePo}
            disabled={busy || !canIssue || !quote.tradeId}
          >
            서명하고 발주서 발행
            <span className="text-[10px] font-normal text-blue-100">
              발행 후 수주처 검토 · PO 확정
            </span>
          </Button>
          <div className="flex justify-center gap-4 text-xs font-semibold text-slate-500">
            <button
              type="button"
              className="hover:text-slate-800 disabled:opacity-50"
              onClick={onSaveDraft}
              disabled={busy}
            >
              임시저장
            </button>
            <span className="text-slate-300">|</span>
            <button type="button" className="hover:text-slate-800" disabled={busy}>
              나중에 다시 처리
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
}
