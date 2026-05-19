import type { CompanyProfile } from '@/types/documents/company';
import type { DocumentUser, UserRole } from '@/types/documents/document';

function digitsOnly(value?: string | null): string {
  return (value ?? '').replace(/\D/g, '');
}

function normalizeName(value?: string | null): string {
  return (value ?? '').replace(/\s/g, '');
}

function userIdFromCompanyId(companyId: string): number | null {
  const m = companyId.match(/^user-(\d+)$/);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isFinite(id) ? id : null;
}

type ViewerDoc = {
  supplier: DocumentUser;
  client: DocumentUser;
  supplierProfile?: CompanyProfile;
  clientProfile?: CompanyProfile;
  viewerRoleHint?: UserRole;
};

type ViewerContext = {
  userId?: number;
  businessNumber?: string;
  companyName?: string;
};

function matchesByUserId(userId: number, doc: ViewerDoc): UserRole | null {
  const supplierUserId = userIdFromCompanyId(doc.supplier.companyId);
  if (supplierUserId === userId) return 'SUPPLIER';

  const clientUserId = userIdFromCompanyId(doc.client.companyId);
  if (clientUserId === userId) return 'CLIENT';

  return null;
}

function matchesByBusinessNumber(
  currentDigits: string,
  doc: ViewerDoc,
): UserRole | null {
  if (!currentDigits || currentDigits.length < 8) return null;

  const supplierDigits = digitsOnly(doc.supplierProfile?.businessNo);
  const clientDigits = digitsOnly(doc.clientProfile?.businessNo);

  if (supplierDigits && supplierDigits.length >= 8 && currentDigits === supplierDigits) {
    return 'SUPPLIER';
  }
  if (clientDigits && clientDigits.length >= 8 && currentDigits === clientDigits) {
    return 'CLIENT';
  }
  return null;
}

function matchesByCompanyName(currentName: string, doc: ViewerDoc): UserRole | null {
  if (!currentName) return null;

  const supplierName = normalizeName(doc.supplier.companyName);
  const clientName = normalizeName(doc.client.companyName);

  if (
    supplierName &&
    (currentName.includes(supplierName) || supplierName.includes(currentName))
  ) {
    return 'SUPPLIER';
  }
  if (clientName && (currentName.includes(clientName) || clientName.includes(currentName))) {
    return 'CLIENT';
  }
  return null;
}

export function getViewerRole(
  currentCompanyId: string,
  doc: ViewerDoc,
  context?: ViewerContext,
): UserRole {
  if (doc.viewerRoleHint) return doc.viewerRoleHint;

  if (currentCompanyId === doc.supplier.companyId) return 'SUPPLIER';
  if (currentCompanyId === doc.client.companyId) return 'CLIENT';

  if (context?.userId != null) {
    const byUserId = matchesByUserId(context.userId, doc);
    if (byUserId) return byUserId;
  }

  const byBn = matchesByBusinessNumber(digitsOnly(context?.businessNumber), doc);
  if (byBn) return byBn;

  const byName = matchesByCompanyName(normalizeName(context?.companyName), doc);
  if (byName) return byName;

  throw new Error('Unauthorized viewer');
}

export function parseViewerRoleParam(value: string | null): UserRole | null {
  if (value === 'SUPPLIER' || value === 'CLIENT') return value;
  return null;
}
