'use client';

import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { ShippingAddressField } from './ShippingAddressField';

type Props = {
  deliveryDate?: string;
  shippingAddress?: string;
  onDeliveryDateChange: (value: string) => void;
  onShippingAddressChange: (value: string) => void;
};

function formatDisplayDate(iso: string) {
  return format(parseISO(iso), 'yyyy.MM.dd (EEE)', { locale: ko });
}

function toIsoDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function PoDeliverySection({
  deliveryDate,
  shippingAddress,
  onDeliveryDateChange,
  onShippingAddressChange,
}: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selectedDate = deliveryDate ? parseISO(deliveryDate) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <section className="mx-8 border-t border-slate-300/80 py-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-bold text-slate-900">납품 일정</h2>
        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 ring-1 ring-rose-100">
          발주처 입력 필요
        </span>
      </div>

      <div className="mt-4 grid gap-4 rounded-xl border-[1.5px] border-[#804FF2] bg-[#F3EFFF] p-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-800">발주처 확정일 *</p>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex w-full items-start gap-2.5 rounded-xl border bg-white px-4 py-3.5 text-left transition-colors',
                  deliveryDate
                    ? 'border-slate-200 hover:border-[#3182F6]/40'
                    : 'border-2 border-dashed border-slate-200 bg-slate-50/80 py-8 hover:border-[#3182F6]/40 hover:bg-blue-50/50'
                )}
              >
                {deliveryDate ? (
                  <>
                    <CalendarIcon className="mt-0.5 size-4 shrink-0 text-[#3182F6]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-900">
                        {formatDisplayDate(deliveryDate)}
                      </span>
                      <span className="mt-1 block text-xs font-semibold text-slate-500">
                        탭하여 날짜 변경
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                    <Plus className="size-4" />
                    납품 희망일 추가하기
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={ko}
                selected={selectedDate}
                defaultMonth={selectedDate ?? today}
                disabled={{ before: today }}
                onSelect={(date) => {
                  if (!date) return;
                  onDeliveryDateChange(toIsoDate(date));
                  setCalendarOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          {deliveryDate && (
            <button
              type="button"
              onClick={() => onDeliveryDateChange('')}
              className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              날짜 지우기
            </button>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-800">배송 주소 *</p>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <ShippingAddressField value={shippingAddress} onChange={onShippingAddressChange} />
          </div>
        </div>
      </div>
    </section>
  );
}
