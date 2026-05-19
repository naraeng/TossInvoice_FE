'use client';

import { ExternalLink } from 'lucide-react';

import { Input } from '@/components/ui/input';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  trackingNumber: string;
  onTrackingNumberChange?: (value: string) => void;
  readOnly?: boolean;
};

function formatShipmentDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
  const date = iso.slice(0, 10).replace(/-/g, '.');
  const weekday = d.toLocaleDateString('ko-KR', { weekday: 'short' });
  return `${date} (${weekday})`;
}

export function InvoiceShippingSection({
  quote,
  trackingNumber,
  onTrackingNumberChange,
  readOnly = false,
}: Props) {
  const courier = quote.courier ?? 'CJ대한통운';

  return (
    <section className="mx-8 border-t border-slate-300/80 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-[#191919]">📦 배송·납품</p>
        <span
          className={
            readOnly
              ? 'rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100'
              : 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100'
          }
        >
          {readOnly ? '배송 중' : '배송 전'}
        </span>
      </div>

      <div className="mt-4 grid gap-3 grid-cols-4 rounded-xl border-[1.5px] border-[#804FF2] bg-[#F3EFFF4D] p-3">
        <div className="p-2 border-r border-slate-300/80 my-2">
          <p className="text-xs font-semibold">🚚 택배사</p>
          <p className="mt-2 text-sm font-bold text-slate-900">택배 · {courier}</p>
        </div>

        <div className="p-2 border-r border-slate-300/80 my-2">
          <p className="text-xs font-semibold">📋 운송장 번호</p>
          {readOnly ? (
            <p className="mt-2 text-sm font-bold text-slate-900">{trackingNumber || '—'}</p>
          ) : (
            <Input
              value={trackingNumber}
              onChange={(e) => onTrackingNumberChange?.(e.target.value)}
              placeholder="입력해주세요"
              className="mt-2 h-9 border-slate-200 bg-white text-sm font-semibold"
            />
          )}
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#3182F6] hover:underline"
            onClick={() => alert('택배사 추적 페이지로 연결됩니다.')}
          >
            실시간 추적
            <ExternalLink className="size-3" />
          </button>
        </div>

        <div className="p-2 border-r border-slate-300/80 my-2">
          <p className="text-xs font-semibold text-slate-500">📆 발송일</p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {formatShipmentDate(quote.shipmentDate)}
          </p>
          <p className="mt-1 text-xs text-emerald-500">
            {readOnly ? '발행 완료' : '발행 처리 후 반영'}
          </p>
        </div>

        <div className="p-4">
          <p className="text-xs font-semibold text-slate-500">📍 도착 예정</p>
          <p className="mt-2 text-sm font-bold text-slate-500">
            {quote.estimatedArrival
              ? formatShipmentDate(quote.estimatedArrival)
              : readOnly
                ? '추적 중'
                : '미정'}
          </p>
          <p className="mt-1 text-xs text-emerald-500">발송 후 추적 가능</p>
        </div>
      </div>
    </section>
  );
}
