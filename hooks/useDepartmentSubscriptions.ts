"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  DEPARTMENT_SUBSCRIPTIONS_CHANGE_EVENT,
  normalizeSubscribableDepartment,
  type SubscribableDepartmentSlug,
} from "@/lib/departments/subscriptions";

export function useDepartmentSubscriptions() {
  const { user } = useAuth();
  const email = user?.email ?? null;
  const [slugs, setSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!email) {
      setSlugs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/department-subscriptions", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { slugs?: string[] };
      setSlugs(Array.isArray(json.slugs) ? json.slugs : []);
    } catch {
      setSlugs([]);
      setError("Nie udało się wczytać ulubionych działów.");
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onChange = () => void load();
    window.addEventListener(DEPARTMENT_SUBSCRIPTIONS_CHANGE_EVENT, onChange);
    return () =>
      window.removeEventListener(DEPARTMENT_SUBSCRIPTIONS_CHANGE_EVENT, onChange);
  }, [load]);

  const isSubscribed = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs]
  );

  const toggle = useCallback(
    async (slug: string) => {
      const normalized = normalizeSubscribableDepartment(slug);
      if (!email || !normalized) return false;
      setToggling(normalized);
      setError(null);
      try {
        const res = await fetch("/api/department-subscriptions", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categorySlug: normalized }),
        });
        const json = (await res.json()) as {
          slugs?: string[];
          error?: string;
        };
        if (!res.ok) {
          setError(json.error ?? "Nie udało się zapisać.");
          return false;
        }
        setSlugs(Array.isArray(json.slugs) ? json.slugs : []);
        window.dispatchEvent(new Event(DEPARTMENT_SUBSCRIPTIONS_CHANGE_EVENT));
        return true;
      } catch {
        setError("Nie udało się zapisać.");
        return false;
      } finally {
        setToggling(null);
      }
    },
    [email]
  );

  return {
    slugs,
    loading,
    toggling,
    error,
    isSubscribed,
    toggle,
    refresh: load,
    isLoggedIn: Boolean(email),
  };
}

export type { SubscribableDepartmentSlug };
