'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchCompanyByBusinessNumber } from '@/lib/company/fetch-company';
import { mapCompanyToClient } from '@/features/documents/quote/supplier/constants';

const BUSINESS_NUMBER_DIGITS = 10;

export function normalizeBusinessNumberDigits(value: string) {
  return value.replace(/\D/g, '');
}

export function formatBusinessNumberFromDigits(digits: string) {
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 10)}`;
}

export function isSearchableBusinessNumber(query: string) {
  return normalizeBusinessNumberDigits(query).length === BUSINESS_NUMBER_DIGITS;
}

export function useCompanySearch(query: string) {
  const digits = normalizeBusinessNumberDigits(query);
  const businessNumber = formatBusinessNumberFromDigits(digits);
  const enabled = isSearchableBusinessNumber(query);

  return useQuery({
    queryKey: ['company', businessNumber],
    queryFn: async () => {
      const company = await fetchCompanyByBusinessNumber(businessNumber);
      return mapCompanyToClient(company);
    },
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}
