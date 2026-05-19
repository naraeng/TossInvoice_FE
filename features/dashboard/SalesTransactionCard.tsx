import TransactionTableCard from '@/features/dashboard/TransactionTableCard';
import type { TransactionRow } from '@/features/dashboard/TransactionTableCard';

type Props = { rows?: TransactionRow[] };

export default function SalesTransactionCard({ rows = [] }: Props) {
  return (
    <TransactionTableCard
      title="수주 거래"
      idLabel="PO 번호"
      partnerLabel="발주처"
      rows={rows}
      tradeTab="sales"
    />
  );
}
