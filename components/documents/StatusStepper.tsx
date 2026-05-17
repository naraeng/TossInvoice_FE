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

const ORDER: QuoteStatus[] = [
  'DRAFT',
  'ISSUED',
  'REJECTED',
  'PO_DRAFT',
  'PO_ISSUED',
  'PO_CONFIRMED',
  'INVOICE_ISSUED',
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
      {steps.map((step) => {
        const idx = stepIndex(step.status);
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
              {done && !active ? '✓' : idx + 1}
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
