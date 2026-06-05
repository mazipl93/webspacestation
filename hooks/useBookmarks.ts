"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

// Same-tab sync channel (the native "storage" event only fires across tabs).
const CHANGE_EVENT = "wss:bookmarks-changed";

// Bookmarks are scoped per signed-in account so saves never leak between users
// and disappear cleanly on logout.
function keyFor(email: string | null): string | null {
  return email ? `wss:bookmarks:${email}` : null;
}

function read(storageKey: string | null): string[] {
  if (!storageKey || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function write(storageKey: string, slugs: string[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(slugs));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* storage unavailable (private mode / quota) — no-op */
  }
}

/**
 * Saved-articles state backed by localStorage, scoped to the signed-in user.
 * Bookmarking requires login: when signed out, the list is empty and `toggle`
 * is a no-op returning false so callers can route to the login screen instead
 * of silently failing. All mounted instances stay in sync via a custom event +
 * the native storage event.
 */
export function useBookmarks() {
  const { user } = useAuth();
  const email = user?.email ?? null;
  const storageKey = keyFor(email);
  const isAuthed = !!email;

  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSlugs(read(storageKey));
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [storageKey]);

  // Returns true when the toggle was applied, false when blocked (signed out).
  const toggle = useCallback(
    (slug: string): boolean => {
      if (!storageKey) return false;
      const current = read(storageKey);
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      write(storageKey, next);
      setSlugs(next);
      return true;
    },
    [storageKey]
  );

  const isBookmarked = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, toggle, isBookmarked, isAuthed };
}

/** Remove saved articles for an account (e.g. after permanent account deletion). */
export function clearBookmarksForEmail(email: string) {
  const storageKey = keyFor(email);
  if (!storageKey || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* no-op */
  }
}
