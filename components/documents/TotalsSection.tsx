import type { Totals } from '@/types/documents/document';

export function TotalsSection({ totals }: { totals: Totals }) {
  return (
    <div className="mt-6 flex justify-end">
      <dl className="w-full max-w-xs space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <dt>공급가액</dt>
          <dd>{totals.subtotal.toLocaleString('ko-KR')}원</dd>
        </div>
        <div className="flex justify-between text-slate-600">
          <dt>부가세</dt>
          <dd>{totals.tax.toLocaleString('ko-KR')}원</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
          <dt>합계</dt>
          <dd>{totals.total.toLocaleString('ko-KR')}원</dd>
        </div>
      </dl>
    </div>
  );
}
