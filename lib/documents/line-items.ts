import type { LineItem } from '@/types/documents/document';

export function newLineItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createEmptyLineItem(): LineItem {
  return {
    id: newLineItemId(),
    description: '',
    detail: '',
    quantity: 0,
    unitPrice: 0,
  };
}

/** 신규 견적 초안: 빈 품목 1행 */
export function createDefaultDraftItems(): LineItem[] {
  return [createEmptyLineItem()];
}

export function calcLineTotal(item: Pick<LineItem, 'quantity' | 'unitPrice'>) {
  return item.quantity * item.unitPrice;
}
