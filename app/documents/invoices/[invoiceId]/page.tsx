import { InvoiceDetailPageClient } from '@/features/documents/invoice/InvoiceDetailPageClient';

type PageProps = {
  params: Promise<{ invoiceId: string }>;
};

/** 서버 globalThis 조회 제거 — 클라이언트에서 trade detail 기반 로드 */
export default async function InvoiceDetailPage({ params }: PageProps) {
  const { invoiceId } = await params;
  return <InvoiceDetailPageClient invoiceId={invoiceId} />;
}
