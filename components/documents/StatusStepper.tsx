import type { QuoteStatus, UserRole } from '@/types/documents/document';

const SUPPLIER_STEPS: { status: QuoteStatus; label: string }[] = [
  { status: 'DRAFT', label: '견적 작성' },
  { status: 'ISSUED', label: '견적 발행' },
  { status: 'PO_ISSUED', label: 'PO 수신' },
  { status: 'PO_CONFIRMED', label: 'PO 확정' },
  { status: 'INVOICE_ISSUED', label: 'Invoice' },
];

const CLIENT_STEPS: { status: QuoteStatus; label: string }[] = [
  { status: 'ISSUED', label: '견적 확인' },
  { status: 'PO_DRAFT', label: '발주 작성' },
  { status: 'PO_ISSUED', label: '발주 발행' },
  { status: 'PO_CONFIRMED', label: 'PO 확정' },
];

// 전체 워크플로우 순서 — done 판정용. 화면에 표시되는 번호와는 무관.
const ORDER: QuoteStatus[] = [
  'DRAFT',
  'ISSUED',
  'REJECTED',
  'PO_DRAFT',
  'PO_ISSUED',
  'PO_CONFIRMED',
  'INVOICE_ISSUED',
  'INVOICE_COMPLETED',
];

function stepIndex(status: QuoteStatus) {
  return ORDER.indexOf(status);
}

export function StatusStepper({
  role,
  currentStatus,
}: {
  role: UserRole;
  currentStatus: QuoteStatus;
}) {
  const steps = role === 'SUPPLIER' ? SUPPLIER_STEPS : CLIENT_STEPS;
  const current = stepIndex(currentStatus);

  return (
    <ol className="space-y-3">
      {steps.map((step, displayIdx) => {
        const idx = stepIndex(step.status);
        // done/active 판정은 전체 워크플로우 순서(ORDER) 기준
        const done = idx <= current && currentStatus !== 'REJECTED';
        const active = step.status === currentStatus;

        return (
          <li key={step.status} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                active
                  ? 'bg-blue-600 text-white'
                  : done
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {/* 표시 번호는 steps 배열 내 순서(1-based). ORDER 인덱스가 아니라
                  사용자 시각에서 보이는 단계 번호(1, 2, 3, 4, 5)로 그린다. */}
              {done && !active ? '✓' : displayIdx + 1}
            </span>
            <span
              className={`text-sm font-medium ${
                active ? 'text-blue-700' : done ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
