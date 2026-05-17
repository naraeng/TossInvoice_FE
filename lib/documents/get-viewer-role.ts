import { DocumentUser, UserRole } from '@/types/documents/document';

export function getViewerRole(
  currentCompanyId: string,
  doc: { supplier: DocumentUser; client: DocumentUser }
): UserRole {
  if (currentCompanyId === doc.supplier.companyId) return 'SUPPLIER';
  if (currentCompanyId === doc.client.companyId) return 'CLIENT';
  throw new Error('Unauthorized viewer');
}