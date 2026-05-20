import type { CompanyApiResult } from '@/lib/company/types';

export type ClientCompany = {
  id: string;
  name: string;
  businessNo: string;
  representative: string;
  bank: string;
  account: string;
  bankAccount: string;
  verified: boolean;
  status: string;
  businessType: string;
  address: string;
  phone: string;
  email: string;
  companyType: string;
};

export function maskBankAccount(account: string) {
  const parts = account.split('-').filter(Boolean);
  if (parts.length >= 3) {
    return `${parts[0]}-***-***-${parts[parts.length - 1].slice(-2)}`;
  }
  if (account.length <= 4) return account;
  return `${account.slice(0, 3)}-***-***-${account.slice(-2)}`;
}

export function formatClientBankLine(client: Pick<ClientCompany, 'bank' | 'account' | 'companyType'>) {
  const bankLabel = client.bank.replace(/은행$/, '').trim();
  const accountLabel = client.account ? maskBankAccount(client.account) : '';
  const left = [bankLabel, accountLabel].filter(Boolean).join(' ');
  if (!left && !client.companyType) return '';
  if (!client.companyType) return left;
  return `${left} · ${client.companyType}`;
}

export function mapCompanyToClient(company: CompanyApiResult): ClientCompany {
  return {
    id: company.businessNumber,
    name: company.companyName,
    businessNo: company.businessNumber,
    representative: company.ceoName,
    bank: company.bank,
    account: company.account,
    bankAccount: `${company.bank} · ${company.account}`,
    verified: company.status === '정상',
    status: company.status,
    businessType: company.businessType,
    address: company.address,
    phone: company.phone,
    email: company.email,
    companyType: company.companyType,
  };
}

export const PROTECTION_FEATURES = [
  '거래처·계좌 변경 시 자동 정지',
  '토큰 불일치 시 거래 차단',
  'OTP 이중 확인 필수',
  '은행 이체 로그 자동 기록',
] as const;

export function calcTransactionFee(total: number) {
  return Math.max(Math.round(total * 0.002), 0);
}
