'use client';

import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon, Info } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  formatShortDate,
  formatValidityLabel,
  getProductionRange,
  minValidityUntilDate,
  type QuoteSchedule,
} from '@/lib/documents/schedule';
import { cn } from '@/lib/utils';

import { SectionCard, SectionTitle } from './SectionCard';

type Props = {
  schedule: QuoteSchedule;
  onChange: (patch: Partial<QuoteSchedule>) => void;
};

type ScheduleCardProps = {
  label: string;
  accentClass: string;
  icon: string;
  children: React.ReactNode;
  preview: string;
  sub: string;
};

function ScheduleCard({ label, accentClass, icon, children, preview, sub }: ScheduleCardProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-slate-800">{label}</p>
      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className={cn('w-1 shrink-0', accentClass)} aria-hidden />
        <div className="flex flex-1 flex-col gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5">
          <div className="flex items-start gap-2.5">
            <span className="text-base leading-none" aria-hidden>
              {icon}
            </span>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
          <div className="border-t border-slate-100 pt-2">
            <p
              className={cn(
                'text-sm font-bold leading-snug',
                preview === '—' ? 'text-slate-400' : 'text-slate-900'
              )}
            >
              {preview}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function parseOptionalDays(value: string): number | undefined {
  const digits = value.replace(/\D/g, '');
  if (!digits) return undefined;
  const parsed = Number(digits);
  if (!Number.isFinite(parsed) || parsed < 1) return undefined;
  return Math.round(parsed);
}

function formatDaysInput(days?: number) {
  return days != null && days > 0 ? String(days) : '';
}

function getProductionPreview(schedule: QuoteSchedule) {
  if (!schedule.productionDays) {
    return { preview: '—', sub: '제작 소요일을 입력하세요' };
  }
  const { start, end } = getProductionRange(schedule.productionDays);
  return {
    preview: `${formatShortDate(start)} ~ ${formatShortDate(end)}`,
    sub: `${schedule.productionDays}일 (영업일 기준)`,
  };
}

function getPaymentPreview(schedule: QuoteSchedule) {
  if (!schedule.paymentDueDays) {
    return { preview: '—', sub: '납품 후 기한을 입력하세요' };
  }
  return {
    preview: `납품 후 ${schedule.paymentDueDays}일 내`,
    sub: '잔금 자동 송금',
  };
}

function getValidityPreview(schedule: QuoteSchedule) {
  if (!schedule.validityUntil) {
    return { preview: '—', sub: '유효 만료일을 선택하세요' };
  }
  return {
    preview: formatValidityLabel(schedule.validityUntil),
    sub: '만료일 기준',
  };
}

function formatValidityDisplay(iso: string) {
  return format(parseISO(iso), 'yyyy.MM.dd (EEE)', { locale: ko });
}

function toIsoDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

type ValidityDatePickerProps = {
  value?: string;
  minIso: string;
  onChange: (value: string | undefined) => void;
};

function ValidityDatePicker({ value, minIso, onChange }: ValidityDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? parseISO(value) : undefined;
  const minDate = useMemo(() => parseISO(minIso), [minIso]);

  return (
    <div className="space-y-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'h-9 w-full justify-start rounded-lg border-slate-200 bg-slate-50/80 px-3 text-left font-semibold hover:bg-white',
              !value && 'text-slate-400'
            )}
          >
            <CalendarIcon className="mr-2 size-4 shrink-0 text-amber-500" />
            {value ? formatValidityDisplay(value) : '날짜 선택'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={6}>
          <Calendar
            mode="single"
            locale={ko}
            selected={selectedDate}
            defaultMonth={selectedDate ?? minDate}
            disabled={{ before: minDate }}
            onSelect={(date) => {
              if (!date) return;
              onChange(toIsoDate(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ScheduleSection({ schedule, onChange }: Props) {
  const minValidity = minValidityUntilDate();
  const production = getProductionPreview(schedule);
  const payment = getPaymentPreview(schedule);
  const validity = getValidityPreview(schedule);

  return (
    <SectionCard>
      <SectionTitle title="일정" subtitle="생산 · 결제 · 견적 만료까지 한눈에 확인" />

      <div className="grid gap-4 sm:grid-cols-3">
        <ScheduleCard
          label="생산 일정"
          accentClass="bg-emerald-500"
          icon="🏭"
          preview={production.preview}
          sub={production.sub}
        >
          <label className="block space-y-1">
            <span className="text-xs text-slate-500">제작 소요일</span>
            <div className="flex items-center gap-1.5">
              <Input
                type="text"
                inputMode="numeric"
                value={formatDaysInput(schedule.productionDays)}
                onChange={(e) => onChange({ productionDays: parseOptionalDays(e.target.value) })}
                placeholder="0"
                className="h-9 w-16 rounded-lg border-slate-200 bg-slate-50/80 text-sm font-semibold"
                aria-label="제작 소요일"
              />
              <span className="text-sm font-medium text-slate-600">일</span>
            </div>
          </label>
        </ScheduleCard>

        <ScheduleCard
          label="결제 완료 기한"
          accentClass="bg-[#3182F6]"
          icon="⏱"
          preview={payment.preview}
          sub={payment.sub}
        >
          <label className="block space-y-1">
            <span className="text-xs text-slate-500">납품 후 기한</span>
            <div className="flex items-center gap-1.5">
              <Input
                type="text"
                inputMode="numeric"
                value={formatDaysInput(schedule.paymentDueDays)}
                onChange={(e) => onChange({ paymentDueDays: parseOptionalDays(e.target.value) })}
                placeholder="0"
                className="h-9 w-16 rounded-lg border-slate-200 bg-slate-50/80 text-sm font-semibold"
                aria-label="결제 완료 기한 일수"
              />
              <span className="text-sm font-medium text-slate-600">일 이내</span>
            </div>
          </label>
        </ScheduleCard>

        <ScheduleCard
          label="견적서 유효기간"
          accentClass="bg-amber-400"
          icon="📅"
          preview={validity.preview}
          sub={validity.sub}
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500">유효 만료일</span>
            <ValidityDatePicker
              value={schedule.validityUntil}
              minIso={minValidity}
              onChange={(validityUntil) => onChange({ validityUntil })}
            />
          </div>
        </ScheduleCard>
      </div>

      <div className="my-4 flex gap-2.5 rounded-xl border border-amber-200/90 bg-[#FFFBEB] px-4 py-3.5">
        <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
        <p className="text-xs leading-relaxed text-slate-600">
          견적서 유효기간 내에 발주처가 검토 · 서명하지 않으면 자동 만료됩니다. 만료 후 재발행이
          필요해요
        </p>
      </div>
    </SectionCard>
  );
}
