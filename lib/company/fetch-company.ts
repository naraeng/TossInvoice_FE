import { apiClient } from '@/lib/api';

import type { CompanyApiResponse, CompanyApiResult } from './types';

export class CompanyNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompanyNotFoundError';
  }
}

/**
 * 실제 API 성공 응답 예:
 * { errorCode: null, message: "SUCCESS", result: { companyName, status, ... } }
 * 실패 응답 예:
 * { errorCode: "USER_001", message: "...", result: null }
 */
export function parseCompanyApiResponse(data: CompanyApiResponse): CompanyApiResult {
  if (data.errorCode === 'USER_001' || data.result == null) {
    throw new CompanyNotFoundError(
      data.message || '해당 사업자번호로 등록된 회사를 찾을 수 없습니다.',
    );
  }

  return data.result;
}

export async function fetchCompanyByBusinessNumber(
  businessNumber: string,
): Promise<CompanyApiResult> {
  const encoded = encodeURIComponent(businessNumber.trim());
  try {
    const res = await apiClient.get<CompanyApiResponse>(`/api/v1/company/${encoded}`);
    return parseCompanyApiResponse(res.data);
  } catch (error: unknown) {
    if (error instanceof CompanyNotFoundError) throw error;

    if (typeof error === 'object' && error && 'response' in error) {
      const response = (
        error as { response?: { data?: CompanyApiResponse; status?: number } }
      ).response;
      const data = response?.data;

      if (data) {
        try {
          return parseCompanyApiResponse(data);
        } catch (parseError) {
          if (parseError instanceof CompanyNotFoundError) throw parseError;
        }

        if (data.errorCode && data.errorCode !== 'SUCCESS') {
          throw new Error(data.message || '회사 정보를 불러오지 못했습니다.');
        }
      }

      if (response?.status === 404) {
        throw new CompanyNotFoundError(
          data?.message || '해당 사업자번호로 등록된 회사를 찾을 수 없습니다.',
        );
      }
    }

    throw error;
  }
}
