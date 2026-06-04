"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DEPARTMENT_SUBSCRIPTIONS_CHANGE_EVENT } from "@/lib/departments/subscriptions";
import {
  getReadIds,
  hasUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_CHANGE_EVENT,
  type NotificationItem,
  isNotificationUnread,
} from "@/lib/notifications";

export function useNotifications() {
  const { user } = useAuth();
  const email = user?.email ?? null;
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [subscribedDepartments, setSubscribedDepartments] = useState<string[]>(
    []
  );

  const syncRead = useCallback(() => {
    setReadIds(getReadIds(email));
  }, [email]);

  useEffect(() => {
    syncRead();
    window.addEventListener(NOTIFICATIONS_CHANGE_EVENT, syncRead);
    window.addEventListener("storage", syncRead);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGE_EVENT, syncRead);
      window.removeEventListener("storage", syncRead);
    };
  }, [syncRead]);

  const refresh = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch("/api/notifications", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as {
        items?: NotificationItem[];
        subscribedDepartments?: string[];
      };
      setItems(Array.isArray(json.items) ? json.items : []);
      setSubscribedDepartments(
        Array.isArray(json.subscribedDepartments)
          ? json.subscribedDepartments
          : []
      );
    } catch {
      setItems([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (!email) {
      setItems([]);
      setSubscribedDepartments([]);
      setLoading(false);
      setFetchError(false);
      return;
    }
    void refresh();
  }, [email, refresh]);

  useEffect(() => {
    const reload = () => void refresh();
    window.addEventListener(DEPARTMENT_SUBSCRIPTIONS_CHANGE_EVENT, reload);
    return () =>
      window.removeEventListener(DEPARTMENT_SUBSCRIPTIONS_CHANGE_EVENT, reload);
  }, [refresh]);

  const listItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        isUnread: isNotificationUnread(item, readIds),
      })),
    [items, readIds]
  );

  const hasUnread = useMemo(
    () => hasUnreadNotifications(items, readIds),
    [items, readIds]
  );

  const markRead = useCallback(
    (id: string) => {
      if (!email) return;
      markNotificationRead(email, id);
      syncRead();
    },
    [email, syncRead]
  );

  const markAllRead = useCallback(() => {
    if (!email) return;
    markAllNotificationsRead(
      email,
      items.map((n) => n.id)
    );
    syncRead();
  }, [email, items, syncRead]);

  return {
    items: listItems,
    hasUnread,
    markRead,
    markAllRead,
    refresh,
    loading,
    fetchError,
    subscribedDepartments,
    isLoggedIn: Boolean(email),
  };
}

export type NotificationListItem = NotificationItem & { isUnread: boolean };
