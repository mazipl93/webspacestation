import type { User } from "@supabase/supabase-js";
import { avatarFromMetadata } from "@/lib/auth/session-user";

/** Prefer Supabase profile metadata, then Prisma app user, then e-mail local-part. */
export function resolveDisplayName(
  supaUser: User | null | undefined,
  prismaName?: string | null,
  email?: string | null
): string {
  const metaName =
    typeof supaUser?.user_metadata?.name === "string"
      ? supaUser.user_metadata.name.trim()
      : "";
  if (metaName) return metaName;
  const dbName = prismaName?.trim();
  if (dbName) return dbName;
  const mail = email?.trim();
  if (mail) return mail.split("@")[0] || "Użytkownik";
  return "Użytkownik";
}

export function resolveDisplayAvatarUrl(
  supaUser: User | null | undefined,
  prismaAvatarUrl?: string | null
): string | null {
  return avatarFromMetadata(supaUser?.user_metadata) ?? prismaAvatarUrl ?? null;
}

export function profileFieldsFromSupabase(supaUser: User | null | undefined): {
  name: string | null;
  avatarUrl: string | null;
} {
  const metaName =
    typeof supaUser?.user_metadata?.name === "string"
      ? supaUser.user_metadata.name.trim()
      : "";
  return {
    name: metaName || null,
    avatarUrl: avatarFromMetadata(supaUser?.user_metadata) ?? null,
  };
}
