import type { SignatureRecord, UserRole } from '@/types/documents/document';

export function SignatureBox({
  role,
  signatures,
  placeholder = '서명 영역',
}: {
  role: UserRole;
  signatures: SignatureRecord[];
  placeholder?: string;
}) {
  const signed = signatures.find((s) => s.party === role);

  return (
    <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6">
      <p className="text-xs font-semibold text-slate-500">
        {role === 'SUPPLIER' ? '수주처 서명' : '발주처 서명'}
      </p>
      {signed ? (
        <p className="mt-3 text-sm font-semibold text-slate-900">
          {signed.signerName} · {signed.signedAt.slice(0, 10)}
        </p>
      ) : (
        <p className="mt-3 text-sm text-slate-400">{placeholder}</p>
      )}
    </div>
  );
}
