import { calcTotals } from '@/lib/documents/calc-totals';
import {
  CURRENT_COMPANY_ID,
  CURRENT_COMPANY_NAME,
} from '@/lib/documents/current-company';
import type { LineItem, QuoteDocument, QuoteStatus } from '@/types/documents/document';

const CLIENT_COMPANY = { companyId: 'client-natae', companyName: '낮애커피' };

function defaultItems(): LineItem[] {
  return [
    { id: '1', description: '원두 10kg', quantity: 2, unitPrice: 85000 },
    { id: '2', description: '종이컵 1000개입', quantity: 1, unitPrice: 42000 },
  ];
}

function buildQuote(partial: Partial<QuoteDocument> & Pick<QuoteDocument, 'id' | 'status'>): QuoteDocument {
  const items = partial.items ?? defaultItems();
  return {
    documentNo: partial.documentNo ?? `Q-${partial.id.slice(-6).toUpperCase()}`,
    issuedAt: partial.issuedAt ?? new Date().toISOString().slice(0, 10),
    supplier: partial.supplier ?? {
      companyId: CURRENT_COMPANY_ID,
      companyName: CURRENT_COMPANY_NAME,
      role: 'SUPPLIER',
    },
    client: partial.client ?? { ...CLIENT_COMPANY, role: 'CLIENT' },
    items,
    totals: partial.totals ?? calcTotals(items),
    signatures: partial.signatures ?? [],
    note: partial.note,
    ...partial,
  };
}

const quotes: Record<string, QuoteDocument> = {
  'quote-issued': buildQuote({
    id: 'quote-issued',
    status: 'ISSUED',
    documentNo: 'Q-20260512-001',
  }),
  'quote-po-issued': buildQuote({
    id: 'quote-po-issued',
    status: 'PO_ISSUED',
    documentNo: 'Q-20260510-014',
    signatures: [
      {
        party: 'CLIENT',
        signedAt: '2026-05-10T09:00:00.000Z',
        signerName: '가온분식',
      },
    ],
  }),
  'quote-po-confirmed': buildQuote({
    id: 'quote-po-confirmed',
    status: 'PO_CONFIRMED',
    documentNo: 'Q-20260509-003',
    signatures: [
      {
        party: 'CLIENT',
        signedAt: '2026-05-09T10:00:00.000Z',
        signerName: '가온분식',
      },
      {
        party: 'SUPPLIER',
        signedAt: '2026-05-09T11:00:00.000Z',
        signerName: CURRENT_COMPANY_NAME,
      },
    ],
  }),
  'quote-client-demo': buildQuote({
    id: 'quote-client-demo',
    status: 'ISSUED',
    documentNo: 'Q-20260511-008',
    supplier: {
      companyId: 'company-supplier-2',
      companyName: '한빛식자재',
      role: 'SUPPLIER',
    },
    client: {
      companyId: CURRENT_COMPANY_ID,
      companyName: CURRENT_COMPANY_NAME,
      role: 'CLIENT',
    },
  }),
};

export function getQuoteById(id: string): QuoteDocument | undefined {
  return quotes[id];
}

export function saveQuote(quote: QuoteDocument): void {
  quotes[quote.id] = {
    ...quote,
    totals: calcTotals(quote.items),
  };
}

export function createDraftQuote(): QuoteDocument {
  const id = `quote-${Date.now()}`;
  const items = [
    { id: '1', description: '원두 10kg', detail: '디카페인', quantity: 2, unitPrice: 85000 },
    { id: '2', description: '종이컵 1000개입', detail: '12oz', quantity: 1, unitPrice: 42000 },
  ];
  const quote = buildQuote({
    id,
    status: 'DRAFT',
    items,
    totals: calcTotals(items),
    bankVerified: true,
  });
  quotes[id] = quote;
  return quote;
}

export function updateQuoteStatus(id: string, status: QuoteStatus): QuoteDocument | undefined {
  const quote = quotes[id];
  if (!quote) return undefined;
  const next = { ...quote, status };
  quotes[id] = next;
  return next;
}

export function listDemoQuoteIds(): { id: string; label: string; status: QuoteStatus }[] {
  return Object.values(quotes).map((q) => ({
    id: q.id,
    label: `${q.documentNo} · ${q.status}`,
    status: q.status,
  }));
}
