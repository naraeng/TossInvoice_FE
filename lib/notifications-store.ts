'use client';

import { useEffect, useMemo } from 'react';
import { create } from 'zustand';

import { apiClient } from '@/lib/api';
import {
  type Notice,
  type NotificationPageResponse,
  apiRowToNotice,
} from '@/lib/notices';

const PAGE_SIZE = 6;
// 알림 읽음 처리를 위해 마지막으로 본 notificationId를 localStorage에 보관.
// 백엔드에 read_at 필드가 없어 클라이언트에서 'unread' 상태를 추적한다.
const LAST_SEEN_KEY = 'ti-notif-last-seen-id';

function readLastSeenId(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(LAST_SEEN_KEY);
    if (!raw) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function writeLastSeenId(id: number) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_SEEN_KEY, String(id));
  } catch {
    // ignore storage failure
  }
}

type NotificationsState = {
  notices: Notice[];
  loading: boolean;
  loadingMore: boolean;
  nextCursorId: number | null;
  hasNext: boolean;
  lastSeenId: number;
  /** 첫 fetch가 시작되었는지 — 여러 컴포넌트가 동시에 마운트되어도 한 번만 호출한다 */
  initialized: boolean;
  /** 진행 중인 첫 fetch promise를 공유해 동일 라이프사이클에 중복 호출 방지 */
  inFlight: Promise<void> | null;

  fetchNotifications: () => Promise<void>;
  ensureInitialFetch: () => void;
  markAllSeen: () => void;
  loadMore: () => Promise<void>;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notices: [],
  loading: true,
  loadingMore: false,
  nextCursorId: null,
  hasNext: false,
  lastSeenId: 0,
  initialized: false,
  inFlight: null,

  fetchNotifications: async () => {
    // 동시에 여러 컴포넌트가 호출해도 한 번만 실제로 다녀온다
    const existing = get().inFlight;
    if (existing) return existing;

    const promise = (async () => {
      set({ loading: true });
      try {
        const res = await apiClient.get<{
          result: NotificationPageResponse | null;
          message: string;
        }>(`/api/v1/notifications?size=${PAGE_SIZE}`);
        const page = res.data?.result;
        const rows = page?.notifications ?? [];
        set({
          notices: rows.map(apiRowToNotice),
          nextCursorId: page?.nextCursorId ?? null,
          hasNext: page?.hasNext ?? false,
          lastSeenId: readLastSeenId(),
        });
      } catch {
        // 에러 시 빈 목록 유지
      } finally {
        set({ loading: false, inFlight: null });
      }
    })();

    set({ inFlight: promise, initialized: true });
    return promise;
  },

  ensureInitialFetch: () => {
    if (get().initialized) return;
    void get().fetchNotifications();
  },

  markAllSeen: () => {
    const current = get().notices;
    if (current.length === 0) return;
    const latestId = current.reduce((max, n) => (n.id > max ? n.id : max), 0);
    if (latestId <= 0) return;
    writeLastSeenId(latestId);
    set({ lastSeenId: latestId });
  },

  loadMore: async () => {
    const { hasNext, nextCursorId, loadingMore } = get();
    if (!hasNext || nextCursorId === null || loadingMore) return;
    set({ loadingMore: true });
    try {
      const res = await apiClient.get<{
        result: NotificationPageResponse | null;
        message: string;
      }>(`/api/v1/notifications?size=${PAGE_SIZE}&cursorId=${nextCursorId}`);
      const page = res.data?.result;
      const rows = page?.notifications ?? [];
      set((prev) => ({
        notices: [...prev.notices, ...rows.map(apiRowToNotice)],
        nextCursorId: page?.nextCursorId ?? null,
        hasNext: page?.hasNext ?? false,
      }));
    } catch {
      // 에러 시 기존 목록 유지
    } finally {
      set({ loadingMore: false });
    }
  },
}));

/**
 * 기존 `useNotifications()` 인터페이스를 유지하면서 내부 상태만 zustand store로 단일화.
 *
 * - MemberHeader, NoticeList 등 여러 곳에서 호출돼도 API는 첫 마운트 시 1회만 수행됨.
 * - 호출부 시그니처는 그대로(`notices`, `loading`, `markAllSeen`, ...) 유지.
 */
export function useNotifications() {
  const notices = useNotificationsStore((s) => s.notices);
  const loading = useNotificationsStore((s) => s.loading);
  const loadingMore = useNotificationsStore((s) => s.loadingMore);
  const hasNext = useNotificationsStore((s) => s.hasNext);
  const lastSeenId = useNotificationsStore((s) => s.lastSeenId);
  const ensureInitialFetch = useNotificationsStore((s) => s.ensureInitialFetch);
  const fetchNotifications = useNotificationsStore((s) => s.fetchNotifications);
  const markAllSeen = useNotificationsStore((s) => s.markAllSeen);
  const loadMore = useNotificationsStore((s) => s.loadMore);

  useEffect(() => {
    ensureInitialFetch();
  }, [ensureInitialFetch]);

  const unreadCount = useMemo(
    () => notices.filter((n) => n.id > lastSeenId).length,
    [notices, lastSeenId],
  );

  return {
    notices,
    loading,
    hasNext,
    loadingMore,
    refetch: fetchNotifications,
    loadMore,
    unreadCount,
    markAllSeen,
  };
}
