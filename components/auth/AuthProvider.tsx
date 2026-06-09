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
import { prepareLikesForLogout } from "@/lib/likes/logout-likes";
import { createClient } from "@/lib/supabase/client";
import { toSessionUser, type SessionUser } from "@/lib/auth/session-user";

export type { SessionUser };

interface AuthContextValue {
  user: SessionUser | null;
  /** True until the first server + client auth check resolves. */
  loading: boolean;
  signOut: (next?: string) => void | Promise<void>;
  /** Reload user from Supabase (e.g. after avatar upload). */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchServerUser(): Promise<SessionUser | null> {
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { user: SessionUser | null };
    return json.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Public auth state. Bootstraps from `/api/auth/session` (server cookies) so UI
 * matches middleware/RSC guards without making the root layout dynamic. Listens
 * to onAuthStateChange using the session argument — never calls getUser() inside
 * that callback (avoids races when middleware refreshes cookies on navigation).
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

    async function bootstrap() {
      const [serverUser, clientSession] = await Promise.all([
        fetchServerUser(),
        supabase
          ? supabase.auth.getSession().then(({ data }) => data.session)
          : Promise.resolve(null),
      ]);

      if (!active) return;

      const clientUser = toSessionUser(clientSession?.user ?? null);
      setUser(serverUser ?? clientUser);

      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;

        if (session?.user) {
          void fetchServerUser().then((serverUser) => {
            if (!active) return;
            setUser(serverUser ?? toSessionUser(session.user));
            setLoading(false);
          });
          return;
        }

        // Client lost session (often after middleware cookie refresh on navigation).
        // Confirm with the server before clearing UI state.
        void fetchServerUser().then((serverUser) => {
          if (!active) return;
          setUser(serverUser);
          setLoading(false);
        });
      });

      setLoading(false);

      return subscription;
    }

    let subscription: { unsubscribe: () => void } | undefined;
    void bootstrap().then((sub) => {
      subscription = sub;
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const supabase = clientRef.current;
    if (!supabase) return;
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    setUser(toSessionUser(authUser));
  }, []);

  const signOut = useCallback(async (next = "/") => {
    const target = next.startsWith("/") && !next.startsWith("//") ? next : "/";
    try {
      await prepareLikesForLogout(clientRef.current);
    } catch {
      /* logout even if like transfer fails */
    }
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
