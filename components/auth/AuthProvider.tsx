"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { toSessionUser, type SessionUser } from "@/lib/auth/session-user";

export type { SessionUser };

interface AuthContextValue {
  user: SessionUser | null;
  /** True only during the (rare) window before the first auth check resolves. */
  loading: boolean;
  signOut: (next?: string) => void;
  /** Reload user from Supabase (e.g. after avatar upload). */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Single source of truth for public auth state. Seeded with the server-resolved
 * user (`initialUser`) so the first client paint already matches the session.
 * Uses auth.getUser() (not session cookie alone) so user_metadata.avatar_url stays current.
 */
export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: SessionUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const clientRef = useRef<SupabaseClient | null>(null);
  const syncUserRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    let active = true;

    const supabase = (() => {
      try {
        return createClient();
      } catch {
        return null;
      }
    })();
    clientRef.current = supabase;

    if (!supabase) {
      setLoading(false);
      return;
    }

    async function syncUser() {
      if (!supabase) return;
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (active) setUser(toSessionUser(authUser));
    }
    syncUserRef.current = syncUser;

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      if (!active) return;
      await syncUser();
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = useCallback(async () => {
    await syncUserRef.current?.();
  }, []);

  const signOut = useCallback((next = "/") => {
    const target = next.startsWith("/") && !next.startsWith("//") ? next : "/";
    window.location.assign(`/logout?next=${encodeURIComponent(target)}`);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

// Re-export for existing imports
export { toSessionUser } from "@/lib/auth/session-user";
