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

export interface SessionUser {
  email: string;
  name: string;
  /** Optional profile picture URL from user_metadata.avatar_url. */
  avatarUrl?: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  /** True only during the (rare) window before the first auth check resolves. */
  loading: boolean;
  signOut: () => Promise<void>;
}

// Maps a raw Supabase user into the trimmed shape the UI needs. Name falls back
// to user_metadata.name → email local-part → a generic label.
export function toSessionUser(
  raw:
    | { email?: string; user_metadata?: Record<string, unknown> }
    | null
    | undefined
): SessionUser | null {
  if (!raw) return null;
  const email = raw.email ?? "";
  const metaName =
    typeof raw.user_metadata?.name === "string"
      ? (raw.user_metadata.name as string)
      : "";
  const name = metaName || (email ? email.split("@")[0] : "Użytkownik");
  const avatarUrl =
    typeof raw.user_metadata?.avatar_url === "string"
      ? (raw.user_metadata.avatar_url as string)
      : undefined;
  return { email, name, avatarUrl };
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Single source of truth for public auth state. Seeded with the server-resolved
 * user (`initialUser`) so the first client paint already matches the session —
 * no logged-out → logged-in flicker on refresh/navigation. A single
 * onAuthStateChange subscription keeps every consumer in sync instantly, and
 * the whole thing degrades to signed-out when Supabase isn't configured.
 */
export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: SessionUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  // Server already resolved the session, so we're not in a loading state.
  const [loading, setLoading] = useState(false);
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

    if (!supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(toSessionUser(session?.user));
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = clientRef.current;
    try {
      if (supabase) await supabase.auth.signOut();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
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
