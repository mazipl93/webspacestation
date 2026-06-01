export interface SessionUser {
  email: string;
  name: string;
  /** Profile picture from Supabase user_metadata.avatar_url */
  avatarUrl?: string;
}

export function avatarFromMetadata(
  meta?: Record<string, unknown> | null
): string | undefined {
  const raw = meta?.avatar_url ?? meta?.picture;
  if (typeof raw === "string" && raw.trim().length > 0) return raw.trim();
  return undefined;
}

/** Maps Supabase user → UI session shape (name + avatar from metadata). */
export function toSessionUser(
  raw:
    | { email?: string; user_metadata?: Record<string, unknown> }
    | null
    | undefined
): SessionUser | null {
  if (!raw) return null;
  const email = raw.email ?? "";
  const metaName =
    typeof raw.user_metadata?.name === "string" ? raw.user_metadata.name : "";
  const name = metaName || (email ? email.split("@")[0] : "Użytkownik");
  return { email, name, avatarUrl: avatarFromMetadata(raw.user_metadata) };
}
