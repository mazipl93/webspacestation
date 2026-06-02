"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getReadIds,
  hasUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS,
  NOTIFICATIONS_CHANGE_EVENT,
  type NotificationItem,
  isNotificationUnread,
} from "@/lib/notifications";

export function useNotifications() {
  const { user } = useAuth();
  const email = user?.email ?? null;
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const sync = useCallback(() => {
    setReadIds(getReadIds(email));
  }, [email]);

  useEffect(() => {
    sync();
    window.addEventListener(NOTIFICATIONS_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const hasUnread = useMemo(
    () => hasUnreadNotifications(email, readIds),
    [email, readIds]
  );

  const items = useMemo(
    () =>
      NOTIFICATIONS.map((item) => ({
        ...item,
        isUnread: isNotificationUnread(item, readIds),
      })),
    [readIds]
  );

  const markRead = useCallback(
    (id: string) => {
      if (!email) return;
      markNotificationRead(email, id);
      sync();
    },
    [email, sync]
  );

  const markAllRead = useCallback(() => {
    if (!email) return;
    markAllNotificationsRead(email);
    sync();
  }, [email, sync]);

  return {
    items,
    hasUnread,
    markRead,
    markAllRead,
    isLoggedIn: Boolean(email),
  };
}

export type NotificationListItem = NotificationItem & { isUnread: boolean };
