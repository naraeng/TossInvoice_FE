import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export type InfoSummaryCardProps = {
  className?: string;
  companyName?: string;
  businessRegNo?: string;
  representativeName?: string;
};

export default function InfoSummaryCard({
  className,
  companyName = '(주)대농 원두',
  businessRegNo = '123-45-67890',
  representativeName = '박대농',
}: InfoSummaryCardProps) {
  const rows = [
    { label: '회사명', value: companyName },
    { label: '사업자번호', value: businessRegNo },
    { label: '대표자', value: representativeName },
  ] as const;

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-7',
        className,
      )}
    >
      <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
        <Check className="h-4 w-4 stroke-[2.5]" aria-hidden />
        등록 완료된 정보
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-xs font-semibold text-slate-500">{row.label}</p>
            <p className="mt-1.5 text-sm font-bold text-slate-900 sm:text-base">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
