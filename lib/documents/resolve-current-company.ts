import type { UserRole } from '@/types/documents/document';

import { CURRENT_COMPANY_ID, CURRENT_COMPANY_NAME } from '@/lib/documents/current-company';

export type DocumentCompanyContext = {
  companyId: string;
  companyName: string;
  businessNumber?: string;
  userId?: number;
  role: UserRole;
};

export const DEMO_SUPPLIER_COMPANY_ID = 'company-supplier-1';
export const DEMO_CLIENT_COMPANY_ID = 'client-narae';

type MeLike = {
  userId?: number;
  companyName?: string;
  businessNumber?: string;
};

const DEMO_SUPPLIER = {
  companyId: DEMO_SUPPLIER_COMPANY_ID,
  companyName: '(주)장규식자재',
  businessNumber: '1234567890',
} as const;

const DEMO_CLIENT = {
  companyId: DEMO_CLIENT_COMPANY_ID,
  companyName: '날애커피',
  businessNumber: '9876543210',
} as const;

function digitsOnly(value?: string) {
  return (value ?? '').replace(/\D/g, '');
}

function matchesDemo(
  me: MeLike,
  demo: { businessNumber: string; companyName: string }
) {
  const bn = digitsOnly(me.businessNumber);
  if (bn && bn === demo.businessNumber) return true;
  const name = (me.companyName ?? '').replace(/\s/g, '');
  const demoName = demo.companyName.replace(/\s/g, '');
  return name.length > 0 && (name.includes(demoName) || demoName.includes(name));
}

/** 거래 API seller/buyer → 문서 도메인 companyId (로그인 사용자와 동일 규칙) */
export function resolveDocumentCompanyIdFromParty(party: MeLike): string {
  if (matchesDemo(party, DEMO_SUPPLIER)) return DEMO_SUPPLIER.companyId;
  if (matchesDemo(party, DEMO_CLIENT)) return DEMO_CLIENT.companyId;

  if (party.userId != null) return `user-${party.userId}`;

  const digits = digitsOnly(party.businessNumber);
  return digits || 'unknown-company';
}

/** /users/me 또는 로컬 프로필 → 문서 도메인 companyId·역할 */
export function resolveDocumentCompanyFromMe(me: MeLike): DocumentCompanyContext {
  if (matchesDemo(me, DEMO_SUPPLIER)) {
    return { ...DEMO_SUPPLIER, userId: me.userId, role: 'SUPPLIER' };
  }
  if (matchesDemo(me, DEMO_CLIENT)) {
    return { ...DEMO_CLIENT, userId: me.userId, role: 'CLIENT' };
  }

  if (me.userId != null) {
    return {
      companyId: `user-${me.userId}`,
      companyName: me.companyName?.trim() || '내 회사',
      businessNumber: me.businessNumber,
      userId: me.userId,
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
