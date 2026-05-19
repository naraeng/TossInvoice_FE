import { QUOTE_SCREEN_MAP, type ScreenConfig } from '@/features/documents/constants/screen-registry';
import type { QuoteStatus, UserRole } from '@/types/documents/document';

const FALLBACK_CONFIG: ScreenConfig = {
  title: '문서 상세',
  editable: false,
  showSignature: false,
};

export function getScreenConfig(role: UserRole, status: QuoteStatus): ScreenConfig {
  return QUOTE_SCREEN_MAP[role][status] ?? FALLBACK_CONFIG;
}
