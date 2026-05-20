import { calcTotals } from '@/lib/documents/calc-totals';
import { createDefaultDraftItems } from '@/lib/documents/line-items';
import {
  DEFAULT_DOWN_PAYMENT_PERCENT,
  formatPaymentTerms,
} from '@/lib/documents/payment-terms';
import { enrichIssuedQuote } from '@/lib/documents/enrich-issued-quote';
import { enrichPoDraft } from '@/lib/documents/enrich-po-draft';
import { enrichPoIssued } from '@/lib/documents/enrich-po-issued';

import type { DocumentCompanyContext } from '@/lib/documents/resolve-current-company';
import { isSupplierContext } from '@/lib/documents/resolve-current-company';
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

/** 수주처가 발주처를 검색·선택하기 전 초안용 */
const EMPTY_CLIENT: DocumentUser = {
  companyId: '',
  companyName: '',
  role: 'CLIENT',
};

/**
 * 데모용 seed quote ID 목록 — 시연/해커톤 발표를 위한 인메모리 fixture.
 * 백엔드 trade 상세 연동이 완료되면 모듈 단위 seed 자체를 제거하고
 * 본 store(quote-store)는 추후 deprecate 예정.
 */
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

/**
 * 데모 seed 전용 프로필. 실데이터는 백엔드 detail에서 채우므로
 * 일반 흐름에서 fallback 으로 사용되지 않도록 quote-store 내부에만 보존.
 */
const SEED_SUPPLIER_PROFILE = {
  businessNo: '123-45-67890',
  representative: '박장규',
  address: '서울시 강남구 테헤란로 123, 4층',
  contact: '02-1234-5678 · pi@jangfood.co.kr',
  bankAccount: '국민은행 · 123456-78-901234',
  verified: true,
} as const;

const SEED_CLIENT_PROFILE = {
  businessNo: '987-65-43210',
  representative: '김민수',
  address: '서울시 마포구 연남동 45-12',
  contact: '010-9876-5432 · order@nalae.coffee',
  verified: true,
} as const;

function defaultItems(): LineItem[] {
  return createDefaultDraftItems();
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

/**
 * 모듈 레벨 in-memory 캐시.
 * 과거에는 globalThis로 RSC ↔ API ↔ 클라이언트 번들 사이를 공유했으나,
 * 새로고침/멀티 인스턴스 시 viewerRoleHint 가드를 우회한 데이터 누설 위험이 있어
 * 클라이언트 사이드 단기 캐시로 격하 (실데이터는 백엔드 `/trades/{id}`가 source of truth).
 */
const store: Record<string, QuoteDocument> = {};

function getStore(): Record<string, QuoteDocument> {
  return store;
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
      supplierProfile: SEED_SUPPLIER_PROFILE,
      clientProfile: SEED_CLIENT_PROFILE,
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
        supplierProfile: SEED_SUPPLIER_PROFILE,
        clientProfile: SEED_CLIENT_PROFILE,
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
          supplierProfile: SEED_SUPPLIER_PROFILE,
          clientProfile: SEED_CLIENT_PROFILE,
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
            supplierProfile: SEED_SUPPLIER_PROFILE,
            clientProfile: SEED_CLIENT_PROFILE,
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
        ...SEED_SUPPLIER_PROFILE,
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

export type CreateDraftQuoteOptions = {
  /** 거래 시작 등 — 로그인 역할과 무관하게 수주처(공급자) 초안 */
  asSupplier?: boolean;
};

export function createDraftQuote(
  current: DocumentCompanyContext,
  options?: CreateDraftQuoteOptions,
): QuoteDocument {
  const id = `quote-${Date.now()}`;
  const items = createDefaultDraftItems();
  const asSupplier = options?.asSupplier ?? isSupplierContext(current);

  const supplier: DocumentUser = asSupplier
    ? {
        companyId: current.companyId,
        companyName: current.companyName,
        role: 'SUPPLIER',
      }
    : DEFAULT_SUPPLIER;

  const client: DocumentUser = asSupplier
    ? current.companyId === CLIENT_COMPANY.companyId
      ? EMPTY_CLIENT
      : CLIENT_COMPANY
    : {
        companyId: current.companyId,
        companyName: current.companyName,
        role: 'CLIENT',
      };

  // 더미 profile fallback 제거 — 호출처에서 /users/me 응답으로 채움.
  const supplierProfile = asSupplier
    ? {
        businessNo: current.businessNumber ?? '',
        representative: '',
        address: '',
        contact: '',
        verified: false,
      }
    : undefined;

  const quote = buildQuote({
    id,
    status: 'DRAFT',
    supplier,
    client,
    items,
    totals: calcTotals(items),
    downPaymentPercent: DEFAULT_DOWN_PAYMENT_PERCENT,
    paymentTerms: formatPaymentTerms(DEFAULT_DOWN_PAYMENT_PERCENT),
    bankVerified: true,
    supplierProfile,
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
