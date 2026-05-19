import TransactionTableCard from '@/features/dashboard/TransactionTableCard';
import type { TransactionRow } from '@/features/dashboard/TransactionTableCard';

type Props = { rows?: TransactionRow[] };

export default function PurchaseTransactionCard({ rows = [] }: Props) {
  return (
    <TransactionTableCard
      title="발주 거래"
      idLabel="PI 번호"
      partnerLabel="수주처"
      rows={rows}
      tradeTab="purchase"
    />
  );
}
