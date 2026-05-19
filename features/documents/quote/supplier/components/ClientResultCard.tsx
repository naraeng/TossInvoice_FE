'use client';

import { Check } from 'lucide-react';

import type { ClientCompany } from '@/features/documents/quote/supplier/constants';
import { formatClientBankLine } from '@/features/documents/quote/supplier/constants';
import { cn } from '@/lib/utils';

type Props = {
  client: ClientCompany;
  selected?: boolean;
  onSelect: (client: ClientCompany) => void;
};

export function ClientResultCard({ client, selected = false, onSelect }: Props) {
  const bankLine = formatClientBankLine(client) || client.bankAccount;

  return (
    <button
      type="button"
      onClick={() => onSelect(client)}
      className={cn(
        'w-full rounded-xl border px-4 py-3.5 text-left transition',
        selected
          ? 'border-blue-200 bg-blue-50/60 ring-1 ring-blue-100'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-slate-900">{client.name}</span>
          {client.verified && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <Check className="size-3" />
              검증
            </span>
          )}
          {!client.verified && client.status && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              {client.status}
            </span>
          )}
        </div>
        {selected && (
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
            <Check className="size-3" />
            선택됨
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {client.businessNo} · {client.representative} 대표
      </p>
      {bankLine ? <p className="mt-0.5 text-xs text-slate-400">{bankLine}</p> : null}
    </button>
  );
}
