import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ poId: string }>;
};

/** MVP: PO도 quote 문서 ID와 동일 스토어 사용 */
export default async function PurchaseOrderDetailPage({ params }: PageProps) {
  const { poId } = await params;
  redirect(`/documents/quotes/${poId}`);
}
