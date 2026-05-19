import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function TransactionViewButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1 rounded-lg border-blue-300 px-3 text-xs font-semibold text-blue-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
    >
      거래보기
      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
    </Button>
  );
}
