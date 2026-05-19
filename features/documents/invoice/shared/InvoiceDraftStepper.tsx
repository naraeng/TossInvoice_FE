import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'PI 견적서', sub: '발행 완료', done: true },
  { label: 'PO 발주서', sub: '양측 서명 완료', done: true },
  { label: '최종 invoice', sub: '작성·발행 중', done: false, active: true },
];

export function InvoiceDraftStepper() {
  return (
    <ol className="relative space-y-4">
      <div className="absolute bottom-2 left-[13px] top-2 w-px bg-slate-200" aria-hidden />
      {STEPS.map((step, index) => (
        <li key={step.label} className="relative flex gap-3">
          <span
            className={cn(
              'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
              step.done
                ? 'bg-emerald-500 text-white'
                : step.active
                  ? 'bg-[#3182F6] text-white'
                  : 'bg-slate-100 text-slate-400'
            )}
          >
            {step.done ? <Check className="size-4" strokeWidth={3} /> : index + 1}
          </span>
          <div className="pt-0.5">
            <p
              className={cn(
                'text-sm font-bold',
                step.done || step.active ? 'text-slate-900' : 'text-slate-400'
              )}
            >
              {step.label}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{step.sub}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
