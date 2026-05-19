import type { UserRole } from '@/types/documents/document';

import { CURRENT_COMPANY_ID, CURRENT_COMPANY_NAME } from '@/lib/documents/current-company';

export type DocumentCompanyContext = {
  companyId: string;
  companyName: string;
  role: UserRole;
};

type MeLike = {
  userId?: number;
  companyName?: string;
  businessNumber?: string;
};

const DEMO_SUPPLIER = {
  companyId: 'company-supplier-1',
  companyName: '(주)장규식자재',
  businessNumber: '1234567890',
} as const;

const DEMO_CLIENT = {
  companyId: 'client-narae',
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

/** /users/me 또는 로컬 프로필 → 문서 도메인 companyId·역할 */
export function resolveDocumentCompanyFromMe(me: MeLike): DocumentCompanyContext {
  if (matchesDemo(me, DEMO_SUPPLIER)) {
    return { ...DEMO_SUPPLIER, role: 'SUPPLIER' };
  }
  if (matchesDemo(me, DEMO_CLIENT)) {
    return { ...DEMO_CLIENT, role: 'CLIENT' };
  }

  if (me.userId != null) {
    return {
      companyId: `user-${me.userId}`,
      companyName: me.companyName?.trim() || '내 회사',
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
