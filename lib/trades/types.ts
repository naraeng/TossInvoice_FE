/** POST /api/v1/trades — `data` multipart JSON part */
export type StartTradeDataPayload = {
  buyerBusinessNumber: string;
  productionDays: number;
  validUntil: string;
  depositRate: number;
  tax: number;
  items: Array<{
    productName: string;
    productNum: number;
    quantity: number;
    unitPrice: number;
  }>;
};

export type StartTradeApiResponse = {
  errorCode: string | null;
  message: string;
  result: { tradeId: number } | null;
};

export type StartTradeResult = {
  tradeId: number;
};
