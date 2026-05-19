import { Check } from 'lucide-react';

const STEPS = [
  { label: 'PI', sub: '완료', done: true },
  { label: 'PO', sub: '완료', done: true },
  { label: '최종 invoice', sub: '완료', done: true },
  { label: '거래 완료', sub: '정산 종료', done: true, active: true },
];

export function InvoiceCompletedStepper() {
  return (
    <ol className="flex flex-col gap-0">
      {STEPS.map((step, index) => (
        <li key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step.active
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            {index < STEPS.length - 1 && (
              <span className="my-0.5 h-6 w-0.5 bg-emerald-200" aria-hidden />
            )}
          </div>
          <div className="pb-5 pt-0.5">
            <p className="text-sm font-bold text-slate-900">{step.label}</p>
            <p className="text-[11px] text-emerald-600">{step.sub}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
