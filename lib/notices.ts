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
  receiverId: number;
  tradeId: number | null;
  notificationType: NotificationType;
  message: string;
  createdAt: string; // "2026-05-19 10:00:00"
}

export interface Notice {
  id: number;
  icon: NoticeIcon;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
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
  };
}
