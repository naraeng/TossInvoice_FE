import { apiClient } from '@/lib/api';
import { getDisplayProfile } from '@/lib/auth-user';

import {
  type DocumentCompanyContext,
  resolveDocumentCompanyFromMe,
} from '@/lib/documents/resolve-current-company';

type MeApiResponse = {
  result?: {
    userId?: number;
    companyName?: string;
    businessNumber?: string;
  } | null;
};

/** 브라우저: /users/me 기준으로 현재 회사·역할 결정 */
export async function resolveCurrentCompanyClient(): Promise<DocumentCompanyContext> {
  try {
    const res = await apiClient.get<MeApiResponse>('/api/v1/users/me');
    const me = res.data.result;
    if (me) {
      return resolveDocumentCompanyFromMe(me);
    }
  } catch {
    // fall through to local profile
  }

  const profile = getDisplayProfile();
  return resolveDocumentCompanyFromMe({
    companyName: profile.companyName,
    businessNumber: profile.businessNumber,
  });
}
