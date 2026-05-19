import type { SignatureRecord } from '@/types/documents/document';

type Props = {
  signature?: SignatureRecord;
  fallbackName?: string;
  className?: string;
};

export function SignatureVisual({ signature, fallbackName = '—', className }: Props) {
  if (signature?.signatureImage) {
    return (
      <img
        src={signature.signatureImage}
        alt={`${signature.signerName} 서명`}
        className={className ?? 'max-h-28 w-auto max-w-full object-contain'}
      />
    );
  }

  return (
    <p className={className ?? 'font-serif text-3xl leading-none text-[#555555]'}>
      {signature?.signerName ?? fallbackName}
    </p>
  );
}
