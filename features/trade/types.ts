export type TradeRole = 'SELLER' | 'BUYER';
export type TradePhase = 'ACTIVE' | 'COMPLETED';

export type TradeCompanyMini = {
  userId: number;
  companyName: string;
  businessNumber: string;
  ceoName?: string;
};

export type TradeApiRow = {
  tradeId: number;
  status: string;
  role: TradeRole;
  seller: TradeCompanyMini;
  buyer: TradeCompanyMini;
  totalAmount: number;
  invoiceDocNumber?: string | null;
  itemsSummary?: string | null;
  completedAt?: string | null;
  createdAt: string;
};

export type TradePageResponse = {
  trades: TradeApiRow[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  totalPartners: number;
  activePartners: number;
  newPartnersThisMonth: number;
};
