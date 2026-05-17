import type { QuoteDocument } from '@/types/documents/document';

export function DocumentHeader({ quote }: { quote: QuoteDocument }) {
  return (
    <header className="border-b border-slate-100 pb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">견적서</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{quote.documentNo}</h1>
      <p className="mt-1 text-sm text-slate-500">발행일 {quote.issuedAt}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">수주처</p>
          <p className="mt-1 font-semibold text-slate-900">{quote.supplier.companyName}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">발주처</p>
          <p className="mt-1 font-semibold text-slate-900">{quote.client.companyName}</p>
        </div>
      </div>
    </header>
  );
}
