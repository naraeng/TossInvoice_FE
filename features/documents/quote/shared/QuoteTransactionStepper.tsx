import { cn } from '@/lib/utils';
import type { QuoteStatus, UserRole } from '@/types/documents/document';

import { TRANSACTION_STEPS } from './issued-constants';

const STATUS_ORDER: QuoteStatus[] = [
  'DRAFT',
  'ISSUED',
  'REJECTED',
  'PO_DRAFT',
  'PO_ISSUED',
  'PO_CONFIRMED',
  'INVOICE_ISSUED',
];

function statusIndex(status: QuoteStatus) {
  return STATUS_ORDER.indexOf(status);
}

function stepActive(stepStatuses: readonly QuoteStatus[], current: QuoteStatus, index: number) {
  const currentIdx = statusIndex(current);
  const stepMax = Math.max(...stepStatuses.map(statusIndex));
  if (currentIdx >= stepMax) return true;
  if (index === 0 && (current === 'ISSUED' || current === 'REJECTED')) return true;
  return false;
}

type Props = {
  status: QuoteStatus;
  viewerRole: UserRole;
};

export function QuoteTransactionStepper({ status, viewerRole }: Props) {
  return (
    <ol className="relative space-y-4">
      <div className="absolute left-[13px] top-2 bottom-2 w-px bg-slate-200" aria-hidden />
      {TRANSACTION_STEPS.map((step, index) => {
        const active = stepActive(step.statuses, status, index);
        const sub = viewerRole === 'SUPPLIER' ? step.supplierSub : step.clientSub;

        return (
          <li key={step.key} className="relative flex gap-3">
            <span
              className={cn(
                'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                active ? 'bg-[#3182F6] text-white' : 'bg-slate-100 text-slate-400'
              )}
            >
              {index + 1}
            </span>
            <div className="pt-0.5">
              <p
                className={cn(
                  'text-sm font-bold',
                  active ? 'text-slate-900' : 'text-slate-400'
                )}
              >
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
