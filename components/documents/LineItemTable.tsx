'use client';

import { Input } from '@/components/ui/input';
import type { LineItem } from '@/types/documents/document';

type Props = {
  items: LineItem[];
  mode: 'edit' | 'readonly';
  onChange?: (items: LineItem[]) => void;
};

function formatCurrency(value: number) {
  return value.toLocaleString('ko-KR');
}

export function LineItemTable({ items, mode, onChange }: Props) {
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    if (!onChange) return;
    onChange(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
            <th className="pb-3 pr-3">품목</th>
            <th className="pb-3 pr-3 w-24">수량</th>
            <th className="pb-3 pr-3 w-32">단가</th>
            <th className="pb-3 w-32 text-right">금액</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const amount = item.quantity * item.unitPrice;
            return (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-3 pr-3">
                  {mode === 'edit' ? (
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="품목명"
                    />
                  ) : (
                    <span className="text-slate-800">{item.description || '-'}</span>
                  )}
                </td>
                <td className="py-3 pr-3">
                  {mode === 'edit' ? (
                    <Input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, 'quantity', Number(e.target.value) || 0)
                      }
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="py-3 pr-3">
                  {mode === 'edit' ? (
                    <Input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, 'unitPrice', Number(e.target.value) || 0)
                      }
                    />
                  ) : (
                    formatCurrency(item.unitPrice)
                  )}
                </td>
                <td className="py-3 text-right font-semibold text-slate-900">
                  {formatCurrency(amount)}원
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
