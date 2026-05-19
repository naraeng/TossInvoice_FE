import { Fragment } from 'react';

import { cn } from '@/lib/utils';

const STEP_LABELS = [
  '\ubc1c\uc8fc',
  '\uc2b9\uc778',
  '\ub0a9\ud488',
  '\uacb0\uc81c',
] as const;

type StepState = 'done' | 'current' | 'pending' | 'cancelled';

function getStepState(index: number, currentStep: number, cancelled: boolean): StepState {
  if (cancelled) return 'cancelled';
  if (index < currentStep) return 'done';
  if (index === currentStep) return 'current';
  return 'pending';
}

function dotClass(state: StepState) {
  return cn(
    'relative z-10 h-2.5 w-2.5 rounded-full ring-1',
    state === 'done' && 'bg-emerald-500 ring-emerald-100',
    state === 'current' && 'bg-amber-500 ring-amber-100',
    (state === 'pending' || state === 'cancelled') && 'bg-slate-300 ring-slate-200'
  );
}

function labelClass(state: StepState) {
  return cn(
    'whitespace-nowrap text-[10px] font-semibold leading-none',
    state === 'done' && 'text-emerald-600',
    state === 'current' && 'text-amber-600',
    (state === 'pending' || state === 'cancelled') && 'text-slate-400'
  );
}

function connectorClass(index: number, currentStep: number, cancelled: boolean) {
  if (cancelled) return 'border-slate-200';
  if (index < currentStep) return 'border-emerald-400';
  if (index === currentStep) return 'border-amber-300';
  return 'border-slate-200';
}

/**
 * currentStep 매핑:
 *   PENDING_PO           → 0  (발주 진행중)
 *   PENDING_SELLER_SIGN  → 1  (승인 진행중)
 *   PENDING_INVOICE      → 2  (납품 진행중)
 *   PENDING_BUYER_CONFIRM→ 3  (결제 진행중)
 *   COMPLETED            → 4  (모두 완료)
 *   CANCELLED            → cancelled=true (모두 회색)
 */
export default function TransactionProgress({
  currentStep = 0,
  cancelled = false,
}: {
  currentStep?: number;
  cancelled?: boolean;
}) {
  const safeStep = Math.min(Math.max(currentStep, 0), STEP_LABELS.length);

  return (
    <div className="w-[148px] max-w-full" role="list" aria-label="거래 진행상황">
      <div className="flex items-start">
        {STEP_LABELS.map((label, index) => {
          const state = getStepState(index, safeStep, cancelled);
          const isLast = index === STEP_LABELS.length - 1;

          return (
            <Fragment key={label}>
              <div className="flex w-7 shrink-0 flex-col items-center">
                <span className={dotClass(state)} role="listitem" aria-current={state === 'current'} />
                <span className={cn('mt-1.5 text-center', labelClass(state))}>{label}</span>
              </div>
              {!isLast && (
                <span
                  className={cn('mt-[4px] h-0 w-4 shrink-0 border-t-2', connectorClass(index, safeStep, cancelled))}
                  aria-hidden
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
