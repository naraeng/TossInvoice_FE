import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/documents/document';

type Props = {
  viewerRole: UserRole;
  poJustIssued?: boolean;
  /** PO 양측 서명 완료 후 invoice 단계 */
  poConfirmed?: boolean;
};

export function PoIssuedStepper({ viewerRole, poJustIssued, poConfirmed }: Props) {
  const steps = poConfirmed
    ? [
        {
          label: 'PI 견적서',
          sub: viewerRole === 'CLIENT' ? '수신 완료' : '발행 완료',
          done: true,
        },
        {
          label: 'PO 발주서',
          sub: viewerRole === 'CLIENT' ? '발행·수주처 서명 완료' : '양측 서명 완료',
          done: true,
        },
        {
          label: '최종 invoice',
          sub:
            viewerRole === 'SUPPLIER'
              ? '인보이스 작성 대기'
              : '본인 서명 대기 (수주처)',
          done: false,
        },
      ]
    : [
        {
          label: 'PI 견적서',
          sub: viewerRole === 'CLIENT' ? '수신 완료' : '발행 완료',
          done: true,
        },
        {
          label: 'PO 발주서',
          sub: viewerRole === 'CLIENT' ? '발행 완료' : '발주처 발행',
          done: true,
          badge: poJustIssued && viewerRole === 'CLIENT',
        },
        {
          label: '최종 invoice',
          sub:
            viewerRole === 'SUPPLIER'
              ? '본인 서명 대기 (수주처)'
              : '수주처 서명 후 발행',
          done: false,
        },
      ];

  return (
    <ol className="relative space-y-4">
      <div className="absolute bottom-2 left-[13px] top-2 w-px bg-slate-200" aria-hidden />
      {steps.map((step, index) => (
        <li key={step.label} className="relative flex gap-3">
          <span
            className={cn(
              'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
              step.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
            )}
          >
            {step.done ? <Check className="size-4" strokeWidth={3} /> : index + 1}
          </span>
          <div className="flex min-w-0 flex-1 items-start justify-between gap-2 pt-0.5">
            <div>
              <p
                className={cn(
                  'text-sm font-bold',
                  step.done ? 'text-slate-900' : 'text-slate-400'
                )}
              >
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{step.sub}</p>
            </div>
            {step.badge && (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                방금
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
