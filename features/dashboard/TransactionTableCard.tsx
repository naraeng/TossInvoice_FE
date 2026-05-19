import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import TransactionProgress from '@/features/dashboard/TransactionProgress';
import { cn } from '@/lib/utils';

function TruncateCell({ children, className }: { children: string; className?: string }) {
  return (
    <td className={cn('max-w-0 py-4 pl-0 pr-3', className)}>
      <span className="block truncate" title={children}>
        {children}
      </span>
    </td>
  );
}

export type TransactionRow = {
  id: string;
  partner: string;
  item: string;
  progressStep: number;
  cancelled?: boolean;
};

type TransactionTableCardProps = {
  title: string;
  idLabel: string;
  partnerLabel: string;
  rows: TransactionRow[];
  tradeTab: 'sales' | 'purchase';
};

export default function TransactionTableCard({
  title,
  idLabel,
  partnerLabel,
  rows,
  tradeTab,
}: TransactionTableCardProps) {
  const tradeHref = `/trade?tab=${tradeTab}`;

  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <Link
          href={tradeHref}
          className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          전체 보기 →
        </Link>
      </div>

      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col style={{ width: '15%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '34%' }} />
          <col style={{ width: '16%' }} />
        </colgroup>
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-400">
            <th className="pb-3 pl-0 pr-3 font-medium">{idLabel}</th>
            <th className="pb-3 pl-0 pr-3 font-medium">{partnerLabel}</th>
            <th className="pb-3 pl-0 pr-3 font-medium">품목</th>
            <th className="pb-3 pl-0 pr-3 font-medium">진행상황</th>
            <th className="pb-3 pl-0 pr-0 text-center font-medium">거래보기</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-50 align-middle last:border-0">
              <td className="max-w-0 py-4 pl-0 pr-3 font-semibold text-slate-800">
                <span className="block truncate" title={row.id}>
                  {row.id}
                </span>
              </td>
              <TruncateCell className="text-slate-600">{row.partner}</TruncateCell>
              <TruncateCell className="font-medium text-slate-800">{row.item}</TruncateCell>
              <td className="py-4 pl-0 pr-3 align-middle">
                <TransactionProgress currentStep={row.progressStep} cancelled={row.cancelled} />
              </td>
              <td className="py-4 pl-0 pr-0 text-center align-middle">
                <Link
                  href={tradeHref}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                >
                  거래보기
                  <ArrowRight className="h-3 w-3 shrink-0" />
                </Link>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                진행 중인 거래가 없습니다
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </article>
  );
}
