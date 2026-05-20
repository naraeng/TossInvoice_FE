/**
 * 백엔드/OCR에서 들어오는 companyType enum/문자열을 사용자 표시용 한글로 변환.
 *
 * 인정 값:
 * - 'CORPORATE' | '법인' → '법인'
 * - 'INDIVIDUAL' | 'PERSONAL' | '개인' | '개인사업자' → '개인'
 * - 그 외 비어 있거나 알 수 없는 값 → '미확인'
 *
 * 이미 가공된 한글 라벨('법인'/'개인')이 들어와도 그대로 통과시키도록 설계.
 */
export function formatCompanyType(value: unknown): string {
  if (typeof value !== 'string') return '미확인';
  const trimmed = value.trim();
  if (!trimmed) return '미확인';
  const upper = trimmed.toUpperCase();
  if (upper === 'CORPORATE' || trimmed === '법인') return '법인';
  if (
    upper === 'INDIVIDUAL' ||
    upper === 'PERSONAL' ||
    trimmed === '개인' ||
    trimmed === '개인사업자'
  ) {
    return '개인';
  }
  // 알 수 없는 enum이 들어오면 사용자에게 영문이 노출되지 않도록 '미확인'으로 폴백
  return '미확인';
}
