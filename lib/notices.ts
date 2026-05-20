export type NoticeIcon = 'alert' | 'check' | 'info';

export type NotificationType =
  | 'PI_RECEIVED'
  | 'PO_STARTED'
  | 'PO_RECEIVED'
  | 'PO_SIGNED'
  | 'INVOICE_RECEIVED'
  | 'TRADE_COMPLETED'
  | 'TRADE_CANCELLED'
  | 'REPORTED'
  | 'PARTNER_ACCOUNT_CHANGED';

export interface NotificationApiRow {
  notificationId: number;
  senderId: number | null;
  senderCompanyName: string | null;
  receiverId: number;
  tradeId: number | null;
  tradeTotalAmount: number | null;
  notificationType: NotificationType;
  message: string;
  createdAt: string; // "2026-05-19 10:00:00"
}

export interface NotificationPageResponse {
  notifications: NotificationApiRow[];
  nextCursorId: number | null;
  hasNext: boolean;
}

export interface Notice {
  id: number;
  icon: NoticeIcon;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  senderCompanyName: string | null;
  tradeTotalAmount: number | null;
  /** 알림 클릭 시 라우팅 대상 — 없으면 클릭 불가 알림(예: PARTNER_ACCOUNT_CHANGED) */
  tradeId: number | null;
  /** 라우팅 분기를 위해 원본 notificationType도 그대로 노출 */
  type: NotificationType;
}

const ICON_MAP: Record<NotificationType, NoticeIcon> = {
  PI_RECEIVED: 'info',
  PO_STARTED: 'info',
  PO_RECEIVED: 'info',
  PO_SIGNED: 'check',
  INVOICE_RECEIVED: 'info',
  TRADE_COMPLETED: 'check',
  TRADE_CANCELLED: 'alert',
  REPORTED: 'alert',
  PARTNER_ACCOUNT_CHANGED: 'alert',
};

const TITLE_MAP: Record<NotificationType, string> = {
  PI_RECEIVED: '새 견적서 수신',
  PO_STARTED: '발주서 작성 시작',
  PO_RECEIVED: '발주서 수신',
  PO_SIGNED: '발주서 확정',
  INVOICE_RECEIVED: '인보이스 수신',
  TRADE_COMPLETED: '거래 완료',
  TRADE_CANCELLED: '거래 취소',
  REPORTED: '신고 접수',
  PARTNER_ACCOUNT_CHANGED: '계좌 변경 감지',
};

export function toRelativeTime(createdAt: string): string {
  const now = Date.now();
  const date = new Date(createdAt.replace(' ', 'T')).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 172800) return '어제';
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}주 전`;
  return `${Math.floor(diff / 2592000)}개월 전`;
}

export function apiRowToNotice(row: NotificationApiRow): Notice {
  return {
    id: row.notificationId,
    icon: ICON_MAP[row.notificationType] ?? 'info',
    title: TITLE_MAP[row.notificationType] ?? row.notificationType,
    desc: row.message,
    time: toRelativeTime(row.createdAt),
    unread: false,
    senderCompanyName: row.senderCompanyName ?? null,
    tradeTotalAmount: row.tradeTotalAmount ?? null,
    tradeId: row.tradeId ?? null,
    type: row.notificationType,
  };
}

/**
 * 알림 카드 클릭 시 이동할 경로.
 *
 * - tradeId가 있고 거래 흐름 관련 알림이면 견적/거래 상세 페이지로 이동.
 * - 거래 페이지(`/documents/quotes/trade-{tradeId}`) 한 곳으로 단순화 — 상세 안에서
 *   상태에 따라 quote/PO/invoice 뷰가 분기되므로 type별로 다른 라우트로 보낼 필요 없음.
 * - PARTNER_ACCOUNT_CHANGED 처럼 tradeId가 없는 알림은 null 을 반환해 클릭 무동작.
 */
export function noticeHref(notice: Pick<Notice, 'tradeId' | 'type'>): string | null {
  if (notice.tradeId == null) return null;
  switch (notice.type) {
    case 'PI_RECEIVED':
    case 'PO_STARTED':
    case 'PO_RECEIVED':
    case 'PO_SIGNED':
    case 'INVOICE_RECEIVED':
    case 'TRADE_COMPLETED':
    case 'TRADE_CANCELLED':
    case 'REPORTED':
      return `/documents/quotes/trade-${notice.tradeId}`;
    default:
      return null;
  }
}
