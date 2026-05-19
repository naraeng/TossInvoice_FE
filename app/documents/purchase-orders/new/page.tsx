import { redirect } from 'next/navigation';

/** 발주서 작성은 견적 상세(발주처)에서 START_PO 후 동일 quote 문서로 진행 */
export default function NewPurchaseOrderPage() {
  redirect('/documents/quotes/quote-po-draft');
}
