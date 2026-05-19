'use client';

import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { formatKRW } from '@/lib/documents/format';
import { calcLineTotal, createEmptyLineItem } from '@/lib/documents/line-items';
import type { LineItem, Totals } from '@/types/documents/document';

import { SectionCard, SectionTitle } from './SectionCard';

type Props = {
  items: LineItem[];
  totals: Totals;
  onChange: (items: LineItem[]) => void;
};

function parseQuantity(value: string) {
  const parsed = Number(value.replace(/,/g, ''));
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function parseUnitPrice(value: string) {
  const parsed = Number(value.replace(/,/g, ''));
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function formatInputNumber(value: number) {
  return value > 0 ? String(value) : '';
}

export function QuoteItemsSection({ items, totals, onChange }: Props) {
  const displayItems = items.length > 0 ? items : [createEmptyLineItem()];

  useEffect(() => {
    if (items.length === 0) {
      onChange([createEmptyLineItem()]);
    }
  }, [items.length, onChange]);

  const updateItems = (nextItems: LineItem[]) => {
    onChange(nextItems.length > 0 ? nextItems : [createEmptyLineItem()]);
  };

  const updateItem = (id: string, patch: Partial<LineItem>) => {
    updateItems(displayItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    if (displayItems.length <= 1) {
      updateItems([createEmptyLineItem()]);
      return;
    }
    updateItems(displayItems.filter((item) => item.id !== id));
  };

  const addItem = () => {
    updateItems([...displayItems, createEmptyLineItem()]);
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
            {displayItems.map((item) => {
              const lineTotal = calcLineTotal(item);
              return (
                <tr key={item.id} className="group border-b border-slate-100">
                  <td className="py-2.5 pr-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      placeholder="품목명 입력"
                      className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm focus-visible:bg-white"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <Input
                      value={item.detail ?? ''}
                      onChange={(e) => updateItem(item.id, { detail: e.target.value })}
                      placeholder="규격"
                      className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm focus-visible:bg-white"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatInputNumber(item.quantity)}
                      onChange={(e) =>
                        updateItem(item.id, { quantity: parseQuantity(e.target.value) })
                      }
                      placeholder="0"
                      className="h-9 rounded-lg border-slate-200 bg-slate-50/50 text-sm focus-visible:bg-white"
                    />
                  </td>
                  <td className="py-2.5 pr-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatInputNumber(item.unitPrice)}
                      onChange={(e) =>
                        updateItem(item.id, { unitPrice: parseUnitPrice(e.target.value) })
                      }
                      placeholder="0"
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
                      className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
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
        <div className="mt-2 flex w-full max-w-sm items-center justify-between rounded-xl bg-[#E8F2FF] px-5 py-4 ring-1 ring-blue-100">
          <p className="text-xs font-semibold text-[#3182F6]">총액 (VAT 포함)</p>
          <p className="text-2xl font-bold tabular-nums text-[#3182F6]">{formatKRW(totals.total)}</p>
        </div>
      </div>
    </SectionCard>
  );
}
