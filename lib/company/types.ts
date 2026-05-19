export type CompanyStatus = '정상' | '주의' | '위험';

export type CompanyApiResult = {
  companyName: string;
  status: CompanyStatus | string;
  businessNumber: string;
  ceoName: string;
  businessType: string;
  bank: string;
  account: string;
  companyType: string;
  address: string;
  phone: string;
  email: string;
};

/** GET /api/v1/company/{businessNumber} 응답 */
export type CompanyApiResponse = {
  /** 성공 시 null, 실패 시 USER_001 등 */
  errorCode: string | null;
  /** 성공 시 "SUCCESS" (message만으로 성공 여부 판단하지 않음) */
  message: string;
  result: CompanyApiResult | null;
};
