import "server-only";

import type { User } from "@supabase/supabase-js";
import { profileFieldsFromSupabase } from "@/lib/auth/display-profile";
import { prisma } from "@/lib/prisma";

/** Mirror Supabase user_metadata (name, avatar) into Prisma User for CMS / byline. */
export async function syncAppUserFromSupabase(
  prismaUserId: string,
  supaUser: User | null | undefined
): Promise<void> {
  if (!supaUser) return;

  const { name, avatarUrl } = profileFieldsFromSupabase(supaUser);
  const data: { name?: string; avatarUrl?: string | null } = {};

  if (name) data.name = name;
  if (avatarUrl) data.avatarUrl = avatarUrl;

  if (Object.keys(data).length === 0) return;

  await prisma.user.update({
    where: { id: prismaUserId },
    data,
  });
}
