'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import { type Notice, type NotificationPageResponse, apiRowToNotice } from '@/lib/notices';

const PAGE_SIZE = 6;

export function useNotifications() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursorId, setNextCursorId] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{
        result: NotificationPageResponse | null;
        message: string;
      }>(`/api/v1/notifications?size=${PAGE_SIZE}`);
      const page = res.data?.result;
      const rows = page?.notifications ?? [];
      setNotices(rows.map(apiRowToNotice));
      setNextCursorId(page?.nextCursorId ?? null);
      setHasNext(page?.hasNext ?? false);
    } catch {
      // 에러 시 빈 목록 유지
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasNext || nextCursorId === null || loadingMore) return;
    try {
      setLoadingMore(true);
      const res = await apiClient.get<{
        result: NotificationPageResponse | null;
        message: string;
      }>(`/api/v1/notifications?size=${PAGE_SIZE}&cursorId=${nextCursorId}`);
      const page = res.data?.result;
      const rows = page?.notifications ?? [];
      setNotices((prev) => [...prev, ...rows.map(apiRowToNotice)]);
      setNextCursorId(page?.nextCursorId ?? null);
      setHasNext(page?.hasNext ?? false);
    } catch {
      // 에러 시 기존 목록 유지
    } finally {
      setLoadingMore(false);
    }
  }, [hasNext, nextCursorId, loadingMore]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notices, loading, hasNext, loadingMore, refetch: fetchNotifications, loadMore };
}
