'use client';

import { Plus, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { formatKRW } from '@/lib/documents/format';
import type { LineItem, Totals } from '@/types/documents/document';

import { SectionCard, SectionTitle } from './SectionCard';

type Props = {
  items: LineItem[];
  totals: Totals;
  onChange: (items: LineItem[]) => void;
};

function newItemId() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function QuoteItemsSection({ items, totals, onChange }: Props) {
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([
      ...items,
      { id: newItemId(), description: '', detail: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  return (
    <SectionCard>
      <SectionTitle title="품목" />
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
              <th className="pb-3 pr-2 font-semibold">품목명</th>
              <th className="pb-3 pr-2 w-28 font-semibold">규격</th>
              <th className="pb-3 pr-2 w-20 font-semibold">수량</th>
              <th className="pb-3 pr-2 w-28 font-semibold">단가</th>
              <th className="pb-3 pr-2 w-28 text-right font-semibold">합계</th>
              <th className="pb-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const lineTotal = item.quantity * item.unitPrice;
              return (
                <tr key={item.id} className="group border-b border-slate-100">
                  <td className="py-2.5 pr-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="품목명 입력"
                      className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm focus-visible:bg-white"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <Input
                      value={item.detail ?? ''}
                      onChange={(e) => updateItem(item.id, 'detail', e.target.value)}
                      placeholder="규격"
                      className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm focus-visible:bg-white"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <Input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value) || 0)}
                      className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm focus-visible:bg-white"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <Input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, 'unitPrice', Number(e.target.value) || 0)
                      }
                      className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm focus-visible:bg-white"
                    />
                  </td>
                  <td className="py-2.5 pr-2 text-right font-semibold tabular-nums text-slate-900">
                    {formatKRW(lineTotal)}
                  </td>
                  <td className="py-2.5">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                      className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 disabled:opacity-30"
                      aria-label="품목 삭제"
                    >
                      <X className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#3182F6] transition hover:text-blue-600"
      >
        <Plus className="size-4" />
        품목 추가
      </button>

      <div className="my-6 flex flex-col items-end gap-2 text-sm">
        <div className="flex w-full max-w-xs justify-between text-slate-500">
          <span>공급가액</span>
          <span className="tabular-nums">{formatKRW(totals.subtotal)}</span>
        </div>
        <div className="flex w-full max-w-xs justify-between text-slate-500">
          <span>부가세 (10%)</span>
          <span className="tabular-nums">{formatKRW(totals.tax)}</span>
        </div>
        <div className="flex flex-row items-center justify-between mt-2 w-full max-w-sm rounded-xl bg-[#E8F2FF] px-5 py-4 ring-1 ring-blue-100">
          <p className="mb-8 text-xs font-semibold text-[#3182F6]">총액 (VAT 포함)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#3182F6]">
            {formatKRW(totals.total)}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
