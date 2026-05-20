import { redirect } from 'next/navigation';

/**
 * 발주서(PO)는 PI를 받은 거래 컨텍스트 안에서만 작성할 수 있다.
 * `/documents/purchase-orders/new` 로 직접 진입한 사용자는 거래 목록으로 보내서
 * 진행 중인 거래를 선택 → 상세에서 'START_PO' 흐름으로 진입하도록 유도.
 */
export default function NewPurchaseOrderPage() {
  redirect('/trade');
}
