'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import { type Notice, type NotificationApiRow, apiRowToNotice } from '@/lib/notices';

export function useNotifications() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{
        result: NotificationApiRow[] | null;
        message: string;
      }>('/api/v1/notifications');
      const rows = res.data?.result ?? [];
      setNotices(rows.map(apiRowToNotice));
    } catch {
      // 에러 시 빈 목록 유지
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notices, loading, refetch: fetchNotifications };
}
