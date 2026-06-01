import "server-only";

import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** Current Supabase session, or null if signed out. */
export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Current authenticated user (validated against the Supabase Auth server),
 * or null. Prefer this for access decisions — it's more trustworthy than
 * reading the session cookie alone.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
