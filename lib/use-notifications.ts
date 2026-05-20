'use client';

// 알림 상태는 zustand 기반 단일 store로 일원화돼 있음.
// 기존 import 경로(`@/lib/use-notifications`) 호환을 위해 re-export만 유지한다.
export { useNotifications } from '@/lib/notifications-store';
