"use client";

import { useAuth, type SessionUser } from "@/components/auth/AuthProvider";

export type { SessionUser };

interface SessionState {
  user: SessionUser | null;
  /** True until the first auth check resolves — render neutral UI meanwhile. */
  loading: boolean;
}

/**
 * Thin compatibility wrapper over the shared AuthProvider context. Existing
 * consumers keep their `{ user, loading }` API while all auth state now flows
 * from one server-seeded provider (no per-component flicker, instant sync).
 */
export function useSessionUser(): SessionState {
  const { user, loading } = useAuth();
  return { user, loading };
}
