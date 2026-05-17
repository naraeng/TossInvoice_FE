export type MockClient = {
  id: string;
  name: string;
  businessNo: string;
  representative: string;
  bankAccount: string;
  verified: boolean;
};

export const MOCK_CLIENTS: MockClient[] = [
  {
    id: 'client-natae',
    name: '낮애커피',
    businessNo: '123-45-67890',
    representative: '김민수',
    bankAccount: '국민 · 123456-01-123456',
    verified: true,
  },
  {
    id: 'client-gaon',
    name: '가온분식',
    businessNo: '987-65-43210',
    representative: '이서연',
    bankAccount: '신한 · 110-234-567890',
    verified: true,
  },
  {
    id: 'client-hanbit',
    name: '한빛식자재',
    businessNo: '456-78-90123',
    representative: '박지훈',
    bankAccount: '우리 · 1002-345-678901',
    verified: false,
  },
];

export const PROTECTION_FEATURES = [
  '거래처·계좌 변경 시 자동 정지',
  '토큰 불일치 시 거래 차단',
  'OTP 이중 확인 필수',
  '은행 이체 로그 자동 기록',
] as const;

export const DOWN_PAYMENT_RATIO = 0.3;

export function calcTransactionFee(total: number) {
  return Math.max(Math.round(total * 0.002), 0);
}
