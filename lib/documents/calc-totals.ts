import type { LineItem, Totals } from '@/types/documents/document';

export function calcTotals(items: LineItem[]): Totals {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * 0.1);
  return { subtotal, tax, total: subtotal + tax };
}
