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
 * Single source of truth for public auth state. The user is hydrated entirely
 * on the client (Supabase auth.getUser + onAuthStateChange) so the root layout
 * stays free of server-side session reads and public pages remain cacheable.
 * `loading` stays true until that first client check resolves, which lets
 * auth-gated screens (e.g. /profil) wait instead of redirecting prematurely.
 * `initialUser` is accepted for completeness but defaults to null.
 */
export function AuthProvider({
  initialUser = null,
  children,
}: {
  initialUser?: SessionUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef<SupabaseClient | null>(null);
  const syncUserRef = useRef<(() => Promise<void>) | null>(null);

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

    // Resolve the initial auth check, then drop the loading flag exactly once.
    void syncUser().finally(() => {
      if (active) setLoading(false);
    });

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
