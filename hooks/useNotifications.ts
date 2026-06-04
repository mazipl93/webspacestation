"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DEPARTMENT_SUBSCRIPTIONS_CHANGE_EVENT } from "@/lib/departments/subscriptions";
import {
  clearNotifications,
  getDismissedIds,
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
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [subscribedDepartments, setSubscribedDepartments] = useState<string[]>(
    []
  );

  const syncLocalState = useCallback(() => {
    setReadIds(getReadIds(email));
    setDismissedIds(getDismissedIds(email));
  }, [email]);

  useEffect(() => {
    syncLocalState();
    window.addEventListener(NOTIFICATIONS_CHANGE_EVENT, syncLocalState);
    window.addEventListener("storage", syncLocalState);
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGE_EVENT, syncLocalState);
      window.removeEventListener("storage", syncLocalState);
    };
  }, [syncLocalState]);

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

  const visibleItems = useMemo(
    () => items.filter((item) => !dismissedIds.has(item.id)),
    [items, dismissedIds]
  );

  const listItems = useMemo(
    () =>
      visibleItems.map((item) => ({
        ...item,
        isUnread: isNotificationUnread(item, readIds),
      })),
    [visibleItems, readIds]
  );

  const hasUnread = useMemo(
    () => hasUnreadNotifications(visibleItems, readIds),
    [visibleItems, readIds]
  );

  const markRead = useCallback(
    (id: string) => {
      if (!email) return;
      markNotificationRead(email, id);
      syncLocalState();
    },
    [email, syncLocalState]
  );

  const markAllRead = useCallback(() => {
    if (!email) return;
    markAllNotificationsRead(
      email,
      visibleItems.map((n) => n.id)
    );
    syncLocalState();
  }, [email, visibleItems, syncLocalState]);

  const clearAll = useCallback(() => {
    if (!email || visibleItems.length === 0) return;
    clearNotifications(
      email,
      visibleItems.map((n) => n.id)
    );
    syncLocalState();
  }, [email, visibleItems, syncLocalState]);

  return {
    items: listItems,
    hasUnread,
    markRead,
    markAllRead,
    clearAll,
    refresh,
    loading,
    fetchError,
    subscribedDepartments,
    isLoggedIn: Boolean(email),
  };
}

export type NotificationListItem = NotificationItem & { isUnread: boolean };
