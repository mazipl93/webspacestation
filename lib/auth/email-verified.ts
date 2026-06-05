import type { User } from "@supabase/supabase-js";

/** Supabase ustawia `email_confirmed_at` po kliknięciu linku z maila. */
export function isEmailVerified(
  user: Pick<User, "email_confirmed_at"> | null | undefined
): boolean {
  return Boolean(user?.email_confirmed_at);
}
