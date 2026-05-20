'use client';

import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PoIssuedSignatures } from '@/features/documents/quote/client/components/PoIssuedSignatures';
import { PurchaseOrderDocument } from '@/features/documents/quote/client/components/PurchaseOrderDocument';
import { SupplierQuotePoIssuedHeader } from '@/features/documents/quote/supplier/SupplierQuotePoIssuedHeader';
import { cn } from '@/lib/utils';
import type { QuoteDocument } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
  /** 수주처가 카운터서명 전에 확정하는 납기일(`confirmedDeliveryDate`). */
  onDeliveryDateChange?: (value: string) => void;
};

function formatDisplayDate(iso: string) {
  try {
    return format(parseISO(iso), 'yyyy.MM.dd (EEE)', { locale: ko });
  } catch {
    return iso;
  }
}

function toIsoDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function SupplierQuotePoIssuedScreen({
  quote,
  onSignatureChange,
  onDeliveryDateChange,
}: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selectedDate = quote.deliveryDate ? parseISO(quote.deliveryDate) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-5">
      <SupplierQuotePoIssuedHeader quote={quote} />
      <article className="overflow-hidden border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,0.25)]">
        <PurchaseOrderDocument quote={quote} variant="issued">
          {onDeliveryDateChange && (
            <section className="mx-8 border-t border-slate-300/80 py-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">납기일 확정</h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 ring-1 ring-blue-100">
                  수주처 확정
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                발주처 희망일을 참고해 실제 납품 가능한 날짜로 확정해 주세요. 서명 시 이 날짜로
                확정됩니다.
              </p>

              <div className="mt-4 grid gap-3 rounded-xl border-[1.5px] border-blue-200 bg-blue-50/60 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">발주처 희망일</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {quote.desiredDeliveryDate
                      ? formatDisplayDate(quote.desiredDeliveryDate)
                      : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">확정 납기일</p>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          'mt-1 inline-flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm',
                          quote.deliveryDate ? 'font-bold text-slate-900' : 'text-slate-400',
                        )}
                      >
                        <span>
                          {quote.deliveryDate ? formatDisplayDate(quote.deliveryDate) : '날짜 선택'}
                        </span>
                        <CalendarIcon className="size-4 text-slate-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            onDeliveryDateChange(toIsoDate(date));
                            setCalendarOpen(false);
                          }
                        }}
                        disabled={(date) => date < today}
                        locale={ko}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </section>
          )}

          <PoIssuedSignatures
            quote={quote}
            viewerRole="SUPPLIER"
            onSupplierSignatureChange={onSignatureChange}
          />
        </PurchaseOrderDocument>
      </article>
    </div>
  );
}
