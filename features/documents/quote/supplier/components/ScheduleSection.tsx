import { Info } from 'lucide-react';
import { SectionTitle } from './SectionCard';

import { cn } from '@/lib/utils';

import { SectionCard } from './SectionCard';

function formatShortDate(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}.${d}`;
}

function formatValidityDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `~ ${y}.${m}.${d}`;
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

type ScheduleCardProps = {
  label: string;
  accentClass: string;
  icon: string;
  value: string;
  sub: string;
};

function ScheduleCard({ label, accentClass, icon: Icon, value, sub }: ScheduleCardProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-slate-800">{label}</p>
      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className={cn('w-1 shrink-0', accentClass)} aria-hidden />
        <div className="flex flex-1 items-start gap-2.5 px-3.5 py-3 sm:px-4 sm:py-3.5">
          <span>{Icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-snug text-slate-900">{value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScheduleSection() {
  const today = new Date();
  const productionStart = addDays(today, 1);
  const productionEnd = addDays(today, 8);
  const validityEnd = addDays(today, 14);

  return (
    <SectionCard>
      <SectionTitle title="일정" subtitle="생산 · 결제 · 견적 만료까지 한눈에 확인" />

      <div className="grid gap-4 sm:grid-cols-3">
        <ScheduleCard
          label="생산 일정"
          accentClass="bg-emerald-500"
          icon="🏭"
          value={`${formatShortDate(productionStart)} ~ ${formatShortDate(productionEnd)}`}
          sub="8일 (영업일 기준)"
        />
        <ScheduleCard
          label="결제 완료 기한"
          accentClass="bg-[#3182F6]"
          icon="⏱"
          value="납품 후 7일 내"
          sub="잔금 자동 송금"
        />
        <ScheduleCard
          label="견적서 유효기간"
          accentClass="bg-amber-400"
          icon="📅"
          value={formatValidityDate(validityEnd)}
          sub="발행 후 14일"
        />
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
