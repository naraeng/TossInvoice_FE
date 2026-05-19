'use client';

import { Info, Loader2, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { ClientResultCard } from '@/features/documents/quote/supplier/components/ClientResultCard';
import type { ClientCompany } from '@/features/documents/quote/supplier/constants';
import {
  isSearchableBusinessNumber,
  useCompanySearch,
} from '@/features/documents/quote/supplier/hooks/use-company-search';
import { CompanyNotFoundError } from '@/lib/company/fetch-company';
import { cn } from '@/lib/utils';

import { SectionCard, SectionTitle } from './SectionCard';

type Props = {
  selectedClientId?: string;
  onSelect: (client: ClientCompany) => void;
};

export function ClientSection({ selectedClientId, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const { data: searchedClient, isFetching, isError, error, isFetched } = useCompanySearch(query);

  const trimmedQuery = query.trim();
  const canSearch = isSearchableBusinessNumber(trimmedQuery);
  const isNotFound = isError && error instanceof CompanyNotFoundError;
  const searchErrorMessage =
    isError && !isNotFound
      ? error instanceof Error
        ? error.message
        : '회사 정보를 불러오지 못했습니다.'
      : null;

  const displayClients = useMemo(() => {
    if (canSearch && isFetched && searchedClient) return [searchedClient];
    return [];
  }, [canSearch, isFetched, searchedClient]);

  const showResultsHeader = displayClients.length > 0;

  return (
    <SectionCard>
      <SectionTitle title="발주처" />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="123-45-67890"
            className="h-11 rounded-xl border-slate-200 bg-slate-50/80 pl-10 pr-10 text-sm focus-visible:bg-white"
          />
          {isFetching && (
            <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-400" />
          )}
        </div>
        <p className="shrink-0 text-xs text-slate-400 sm:text-right">
          사업자번호 또는 회사명으로 검색
        </p>
      </div>

      {trimmedQuery && !canSearch && (
        <p className="mt-2 text-xs text-slate-500">사업자번호 10자리를 입력하면 검색됩니다.</p>
      )}

      {canSearch && isFetching && (
        <p className="mt-2 text-xs text-slate-500">거래처 정보를 불러오는 중…</p>
      )}

      {canSearch && isFetched && isNotFound && (
        <p className="mt-2 text-xs text-amber-700">
          {error.message || '해당 사업자번호로 등록된 회사를 찾을 수 없습니다.'}
        </p>
      )}

      {canSearch && searchErrorMessage && (
        <p className="mt-2 text-xs text-red-600">{searchErrorMessage}</p>
      )}

      {showResultsHeader && (
        <p className="mt-4 text-sm font-medium text-slate-700">
          📋 검색 결과 ({displayClients.length}건)
        </p>
      )}

      <div className={cn('space-y-2', showResultsHeader && 'mt-2')}>
        {displayClients.map((item) => (
          <ClientResultCard
            key={item.id}
            client={item}
            selected={item.id === selectedClientId}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
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
          className="inline-flex shrink-0 items-center justify-center gap-1 self-end rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-center"
        >
          <Plus className="size-3.5" />
          신규 등록
        </button>
      </div>
    </SectionCard>
  );
}
