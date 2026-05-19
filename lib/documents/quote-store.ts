import { calcTotals } from '@/lib/documents/calc-totals';
import {
  DEFAULT_CLIENT_PROFILE,
  DEFAULT_SUPPLIER_PROFILE,
  enrichIssuedQuote,
} from '@/lib/documents/enrich-issued-quote';
import { enrichPoDraft } from '@/lib/documents/enrich-po-draft';
import { enrichPoIssued } from '@/lib/documents/enrich-po-issued';

import {
  CURRENT_COMPANY_ID,
  CURRENT_COMPANY_NAME,
} from '@/lib/documents/current-company';
import type { DocumentUser, LineItem, QuoteDocument, QuoteStatus } from '@/types/documents/document';

const DEFAULT_SUPPLIER: DocumentUser = {
  companyId: 'company-supplier-1',
  companyName: '(주)장규식자재',
  role: 'SUPPLIER',
};

const CLIENT_COMPANY: DocumentUser = {
  companyId: 'client-narae',
  companyName: '날애커피',
  role: 'CLIENT',
};

const DEMO_QUOTE_IDS = [
  'quote-issued',
  'quote-po-draft',
  'quote-client-demo',
  'quote-po-issued',
  'quote-po-confirmed',
] as const;

const DEMO_PI_ITEMS: LineItem[] = [
  { id: '1', description: '콜롬비아 수프리모 G1', detail: '1kg', quantity: 20, unitPrice: 18000 },
  { id: '2', description: '에티오피아 예가체프 G2', detail: '1kg', quantity: 10, unitPrice: 22000 },
];

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
    supplier: partial.supplier ?? DEFAULT_SUPPLIER,
    client: partial.client ?? CLIENT_COMPANY,
    items,
    totals: partial.totals ?? calcTotals(items),
    signatures: partial.signatures ?? [],
    supplierProfile: partial.supplierProfile,
    clientProfile: partial.clientProfile,
    note: partial.note,
    ...partial,
  };
}

type QuoteStoreGlobal = typeof globalThis & {
  __tossInvoiceQuoteStore?: Record<string, QuoteDocument>;
};

/** Next.js RSC / API / 클라이언트 번들 간 인메모리 store 공유 */
function getStore(): Record<string, QuoteDocument> {
  const g = globalThis as QuoteStoreGlobal;
  if (!g.__tossInvoiceQuoteStore) {
    g.__tossInvoiceQuoteStore = {};
  }
  return g.__tossInvoiceQuoteStore;
}

const seedQuotes: Record<string, QuoteDocument> = {
  'quote-issued': enrichIssuedQuote(
    buildQuote({
      id: 'quote-issued',
      status: 'ISSUED',
      supplier: DEFAULT_SUPPLIER,
      client: CLIENT_COMPANY,
      documentNo: 'PI-2026-0514-001',
      issuedAt: '2026-05-14',
      validityUntil: '2026-05-21',
      paymentTerms: '선금 30% / 잔금 70%',
      bankVerified: true,
      items: DEMO_PI_ITEMS,
      totals: calcTotals(DEMO_PI_ITEMS),
      supplierProfile: DEFAULT_SUPPLIER_PROFILE,
      clientProfile: DEFAULT_CLIENT_PROFILE,
      signatures: [
        {
          party: 'SUPPLIER',
          scope: 'PI',
          signedAt: '2026-05-14T10:30:00.000Z',
          signerName: '박장규',
          ipAddress: '203.241.128.45',
        },
      ],
    })
  ),
  'quote-po-draft': enrichPoDraft(
    enrichIssuedQuote(
      buildQuote({
        id: 'quote-po-draft',
        status: 'PO_DRAFT',
        supplier: DEFAULT_SUPPLIER,
        client: CLIENT_COMPANY,
        documentNo: 'PI-2026-0514-001',
        issuedAt: '2026-05-14',
        validityUntil: '2026-05-21',
        paymentTerms: '선금 30% / 잔금 70%',
        bankVerified: true,
        items: DEMO_PI_ITEMS,
        totals: calcTotals(DEMO_PI_ITEMS),
        supplierProfile: DEFAULT_SUPPLIER_PROFILE,
        clientProfile: DEFAULT_CLIENT_PROFILE,
        signatures: [
          {
            party: 'SUPPLIER',
            signedAt: '2026-05-14T10:30:00.000Z',
            signerName: '박장규',
            ipAddress: '203.241.128.45',
          },
        ],
      })
    )
  ),
  'quote-po-issued': enrichPoIssued(
    enrichPoDraft(
      enrichIssuedQuote(
        buildQuote({
          id: 'quote-po-issued',
          status: 'PO_ISSUED',
          supplier: DEFAULT_SUPPLIER,
          client: CLIENT_COMPANY,
          documentNo: 'PI-2026-0514-001',
          issuedAt: '2026-05-14',
          paymentTerms: '선금 30% / 잔금 70%',
          bankVerified: true,
          items: DEMO_PI_ITEMS,
          totals: calcTotals(DEMO_PI_ITEMS),
          supplierProfile: DEFAULT_SUPPLIER_PROFILE,
          clientProfile: DEFAULT_CLIENT_PROFILE,
          deliveryDate: '2026-05-27',
          shippingAddress: '(우) 04083 서울 마포구 연남동 45-12, 날애커피 1층',
          signatures: [
            {
              party: 'SUPPLIER',
              scope: 'PI',
              signedAt: '2026-05-14T10:30:00.000Z',
              signerName: '박장규',
              ipAddress: '203.241.128.45',
            },
          ],
        })
      )
    )
  ),
  'quote-po-confirmed': (() => {
    const issued = enrichPoIssued(
      enrichPoDraft(
        enrichIssuedQuote(
          buildQuote({
            id: 'quote-po-confirmed',
            status: 'PO_ISSUED',
            supplier: DEFAULT_SUPPLIER,
            client: CLIENT_COMPANY,
            documentNo: 'PI-2026-0514-001',
            issuedAt: '2026-05-14',
            paymentTerms: '선금 30% / 잔금 70%',
            bankVerified: true,
            items: DEMO_PI_ITEMS,
            totals: calcTotals(DEMO_PI_ITEMS),
            supplierProfile: DEFAULT_SUPPLIER_PROFILE,
            clientProfile: DEFAULT_CLIENT_PROFILE,
            deliveryDate: '2026-05-27',
            shippingAddress: '(우) 04083 서울 마포구 연남동 45-12, 날애커피 1층',
            signatures: [
              {
                party: 'SUPPLIER',
                scope: 'PI',
                signedAt: '2026-05-14T10:30:00.000Z',
                signerName: '박장규',
                ipAddress: '203.241.128.45',
              },
            ],
          })
        )
      )
    );
    return {
      ...issued,
      status: 'PO_CONFIRMED' as const,
      signatures: [
        ...issued.signatures.filter((s) => s.party !== 'SUPPLIER' || s.scope !== 'PO'),
        {
          party: 'SUPPLIER',
          scope: 'PO',
          signedAt: '2026-05-14T15:10:00.000Z',
          signerName: '박장규',
          ipAddress: '203.241.128.45',
        },
      ],
    };
  })(),
  'quote-client-demo': enrichIssuedQuote(
    buildQuote({
      id: 'quote-client-demo',
      status: 'ISSUED',
      documentNo: 'PI-2026-0511-008',
      issuedAt: '2026-05-11',
      items: DEMO_PI_ITEMS,
      totals: calcTotals(DEMO_PI_ITEMS),
      supplier: {
        companyId: 'company-supplier-2',
        companyName: '한빛식자재',
        role: 'SUPPLIER',
      },
      client: {
        companyId: 'client-narae',
        companyName: '날애커피',
        role: 'CLIENT',
      },
      supplierProfile: {
        ...DEFAULT_SUPPLIER_PROFILE,
        representative: '이서연',
      },
    })
  ),
};

function ensureSeeded() {
  const store = getStore();
  if (Object.keys(store).length === 0) {
    Object.assign(store, seedQuotes);
    return;
  }
  // 데모 ID가 store에 없을 때만 추가 (진행 중인 PO_DRAFT 등 상태는 덮어쓰지 않음)
  for (const id of DEMO_QUOTE_IDS) {
    if (seedQuotes[id] && !store[id]) {
      store[id] = seedQuotes[id];
    }
  }
}

function isCompleteQuote(patch: Partial<QuoteDocument>, quoteId: string): patch is QuoteDocument {
  return (
    patch.id === quoteId &&
    !!patch.status &&
    !!patch.supplier &&
    !!patch.client &&
    Array.isArray(patch.items) &&
    patch.items.length > 0
  );
}

export function getQuoteById(id: string): QuoteDocument | undefined {
  ensureSeeded();
  return getStore()[id];
}

export function saveQuote(quote: QuoteDocument): void {
  ensureSeeded();
  getStore()[quote.id] = {
    ...quote,
    totals: calcTotals(quote.items),
  };
}

/** API 요청 patch로 서버 store에 견적이 없을 때 동기화 */
export function upsertQuoteFromPatch(quoteId: string, patch: Partial<QuoteDocument>): boolean {
  if (!isCompleteQuote(patch, quoteId)) return false;
  saveQuote(patch);
  return true;
}

export function createDraftQuote(): QuoteDocument {
  const id = `quote-${Date.now()}`;
  const items = [
    { id: '1', description: '원두 10kg', detail: '디카페인', quantity: 2, unitPrice: 85000 },
    { id: '2', description: '종이컵 1000개입', detail: '12oz', quantity: 1, unitPrice: 42000 },
  ];
  const supplier =
    CURRENT_COMPANY_ID.startsWith('company-supplier')
      ? {
          companyId: CURRENT_COMPANY_ID,
          companyName: CURRENT_COMPANY_NAME,
          role: 'SUPPLIER' as const,
        }
      : DEFAULT_SUPPLIER;

  const quote = buildQuote({
    id,
    status: 'DRAFT',
    supplier,
    items,
    totals: calcTotals(items),
    bankVerified: true,
    clientProfile: DEFAULT_CLIENT_PROFILE,
  });
  saveQuote(quote);
  return quote;
}

export function updateQuoteStatus(id: string, status: QuoteStatus): QuoteDocument | undefined {
  ensureSeeded();
  const store = getStore();
  const quote = store[id];
  if (!quote) return undefined;
  const next = { ...quote, status };
  store[id] = next;
  return next;
}

export function listDemoQuoteIds(): { id: string; label: string; status: QuoteStatus }[] {
  ensureSeeded();
  return Object.values(getStore()).map((q) => ({
    id: q.id,
    label: `${q.documentNo} · ${q.status}`,
    status: q.status,
  }));
}
