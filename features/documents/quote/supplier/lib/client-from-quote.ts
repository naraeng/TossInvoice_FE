import type { ClientCompany } from '@/features/documents/quote/supplier/constants';
import type { QuoteDocument } from '@/types/documents/document';

function parseBankAccountLine(line: string): { bank: string; account: string } {
  const [bankPart = '', accountPart = ''] = line.split('·').map((part) => part.trim());
  return {
    bank: bankPart.replace(/\s*은행$/, '').trim(),
    account: accountPart,
  };
}

export function clientCompanyFromQuote(quote: QuoteDocument): ClientCompany | null {
  const { client, clientProfile, bankVerified } = quote;
  if (!client.companyName && !client.companyId) return null;

  const businessNo = clientProfile?.businessNo || client.companyId;
  const { bank, account } = parseBankAccountLine(clientProfile?.bankAccount ?? '');

  return {
    id: businessNo || client.companyId,
    name: client.companyName,
    businessNo,
    representative: (clientProfile?.representative ?? '').replace(/\s*대표\s*$/, ''),
    bank,
    account,
    bankAccount: clientProfile?.bankAccount ?? '',
    verified: bankVerified ?? clientProfile?.verified ?? false,
    status: bankVerified ? '정상' : '',
    businessType: '',
    address: clientProfile?.address ?? '',
    phone: clientProfile?.contact?.split('·')[0]?.trim() ?? '',
    email: clientProfile?.contact?.split('·')[1]?.trim() ?? '',
    companyType: '',
  };
}
