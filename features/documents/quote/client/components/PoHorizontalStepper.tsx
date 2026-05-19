import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'PI', label: 'PI 견적서' },
  { key: 'PO', label: 'PO 발주서' },
  { key: 'INVOICE', label: '최종 invoice' },
] as const;

export function PoHorizontalStepper() {
  return (
    <ol className="flex items-start justify-between gap-2">
      {STEPS.map((step, index) => {
        const done = index === 0;
        const active = index === 1;
        const upcoming = index === 2;

        return (
          <li key={step.key} className="flex min-w-0 flex-1 flex-col items-center text-center">
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-xs font-bold',
                done && 'bg-emerald-500 text-white',
                active && 'bg-[#3182F6] text-white',
                upcoming && 'bg-slate-100 text-slate-400'
              )}
            >
              {done ? <Check className="size-4" strokeWidth={3} /> : index + 1}
            </span>
            <p
              className={cn(
                'mt-2 text-xs font-bold',
                (done || active) && 'text-slate-900',
                upcoming && 'text-slate-400'
              )}
            >
              {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
