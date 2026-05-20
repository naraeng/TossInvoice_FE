import type { UserRole } from '@/types/documents/document';

import { CURRENT_COMPANY_ID, CURRENT_COMPANY_NAME } from '@/lib/documents/current-company';

export type DocumentCompanyContext = {
  companyId: string;
  companyName: string;
  businessNumber?: string;
  userId?: number;
  /** /users/me에는 역할 필드가 없으므로 viewerRole은 호출처(거래 탭/문서 매칭)에서 다시 결정 */
  role: UserRole;
};

// 데모 시드 ID 노출 — quote-store/seedQuotes 에서 사용
export const DEMO_SUPPLIER_COMPANY_ID = 'company-supplier-1';
export const DEMO_CLIENT_COMPANY_ID = 'client-narae';

type MeLike = {
  userId?: number;
  companyName?: string;
  businessNumber?: string;
};

function digitsOnly(value?: string) {
  return (value ?? '').replace(/\D/g, '');
}

/** 거래 API seller/buyer → 문서 도메인 companyId (로그인 사용자와 동일 규칙) */
export function resolveDocumentCompanyIdFromParty(party: MeLike): string {
  if (party.userId != null) return `user-${party.userId}`;

  const digits = digitsOnly(party.businessNumber);
  return digits || 'unknown-company';
}

/**
 * /users/me 또는 로컬 프로필 → 문서 도메인 companyId.
 * 회사명 패턴(데모) 매칭은 제거됐고 role은 잠정 SUPPLIER로 두되,
 * 실제 viewer role은 quote 매칭(`getViewerRole`) 또는 탭 컨텍스트로 재결정.
 */
export function resolveDocumentCompanyFromMe(me: MeLike): DocumentCompanyContext {
  if (me.userId != null) {
    return {
      companyId: `user-${me.userId}`,
      companyName: me.companyName?.trim() || '내 회사',
      businessNumber: me.businessNumber,
      userId: me.userId,
      role: 'SUPPLIER',
    };
  }

  if (me.businessNumber || me.companyName) {
    const digits = digitsOnly(me.businessNumber);
    return {
      companyId: digits || me.companyName || 'unknown-company',
      companyName: me.companyName?.trim() || '내 회사',
      businessNumber: me.businessNumber,
      role: 'SUPPLIER',
    };
  }

  return {
    companyId: CURRENT_COMPANY_ID,
    companyName: CURRENT_COMPANY_NAME,
    role: CURRENT_COMPANY_ID.startsWith('company-supplier') ? 'SUPPLIER' : 'CLIENT',
  };
}

export function isSupplierContext(ctx: DocumentCompanyContext) {
  return ctx.role === 'SUPPLIER';
}
