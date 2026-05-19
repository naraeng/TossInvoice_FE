import PurchaseTransactionCard from '@/features/dashboard/PurchaseTransactionCard';
import SalesTransactionCard from '@/features/dashboard/SalesTransactionCard';
import type { TransactionRow } from '@/features/dashboard/TransactionTableCard';

type Props = {
  salesRows?: TransactionRow[];
  purchaseRows?: TransactionRow[];
};

export default function DashboardTransactions({ salesRows = [], purchaseRows = [] }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <PurchaseTransactionCard rows={purchaseRows} />
      <SalesTransactionCard rows={salesRows} />
    </section>
  );
}
