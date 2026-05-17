'use client';

import { Check, Info, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { MOCK_CLIENTS, type MockClient } from '@/features/documents/quote/supplier/constants';
import { cn } from '@/lib/utils';

import { SectionCard, SectionTitle } from './SectionCard';

type Props = {
  selectedClientId?: string;
  onSelect: (client: MockClient) => void;
};

export function ClientSection({ selectedClientId, onSelect }: Props) {
  const [query, setQuery] = useState('');

  // const selected = MOCK_CLIENTS.find((c) => c.id === selectedClientId);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_CLIENTS;
    return MOCK_CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.businessNo.replace(/-/g, '').includes(q.replace(/-/g, ''))
    );
  }, [query]);

  return (
    <SectionCard>
      <SectionTitle title="발주처" />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="사업자번호 또는 회사명으로 검색"
          className="h-11 rounded-xl border-slate-200 bg-slate-50/80 pl-10 text-sm focus-visible:bg-white"
        />
      </div>

      <div className="mt-3 space-y-2">
        {results.map((client) => {
          const isSelected = client.id === selectedClientId;
          return (
            <button
              key={client.id}
              type="button"
              onClick={() => onSelect(client)}
              className={cn(
                'w-full rounded-xl border px-4 py-3.5 text-left transition',
                isSelected
                  ? 'border-blue-200 bg-blue-50/60 ring-1 ring-blue-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">{client.name}</span>
                {client.verified && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    검증
                  </span>
                )}
                {isSelected && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Check className="size-3" />
                    선택됨
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                사업자번호 {client.businessNo} · 대표 {client.representative}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{client.bankAccount}</p>
            </button>
          );
        })}
      </div>

      <div className="my-8 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm text-slate-700">
              토스인보이스 회원 거래처만 검색 결과에 표시돼요
            </p>
            <p className="text-xs text-slate-500">
              검색 결과가 없다면 [+ 신규 등록]에서 직접 추가할 수 있어요
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Plus className="size-3.5" />
          신규 등록
        </button>
      </div>
    </SectionCard>
  );
}
