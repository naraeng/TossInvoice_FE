'use client';

import { apiClient } from '@/lib/api';
import { clearAuthTokens } from '@/lib/auth-storage';
import { clearMemberProfile } from '@/lib/auth-user';

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/v1/auth/logout');
  } finally {
    // Always clear local tokens regardless of server response.
    clearAuthTokens();
    clearMemberProfile();
  }
}
