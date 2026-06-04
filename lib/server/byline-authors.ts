import "server-only";

import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { avatarFromMetadata } from "@/lib/auth/session-user";
import { createAdminClient } from "@/lib/supabase/admin";

const BYLINE_ROLES: Role[] = [
  Role.AUTHOR,
  Role.EDITOR,
  Role.MODERATOR,
  Role.ADMIN,
];

export type BylineAuthorCandidate = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
};

/** CMS team members eligible as article byline (excludes portal USER / engine). */
export async function listBylineAuthorCandidates(): Promise<BylineAuthorCandidate[]> {
  const rows = await prisma.user.findMany({
    where: { role: { in: BYLINE_ROLES } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, avatarUrl: true },
  });

  const supabase = createAdminClient();
  const avatarByEmail = new Map<string, string>();
  const nameByEmail = new Map<string, string>();

  if (supabase) {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
    if (!error && data?.users) {
      for (const u of data.users) {
        const email = u.email?.trim().toLowerCase();
        if (!email) continue;
        const meta = u.user_metadata as Record<string, unknown> | undefined;
        const url = avatarFromMetadata(meta);
        if (url) avatarByEmail.set(email, url);
        const metaName = typeof meta?.name === "string" ? meta.name.trim() : "";
        if (metaName) nameByEmail.set(email, metaName);
      }
    }
  }

  const result: BylineAuthorCandidate[] = [];

  for (const row of rows) {
    const emailKey = row.email.trim().toLowerCase();
    const resolvedAvatar = avatarByEmail.get(emailKey) ?? row.avatarUrl ?? null;
    const resolvedName = nameByEmail.get(emailKey) ?? row.name;

    if (
      (resolvedAvatar && resolvedAvatar !== row.avatarUrl) ||
      (resolvedName !== row.name && nameByEmail.has(emailKey))
    ) {
      await prisma.user
        .update({
          where: { id: row.id },
          data: {
            ...(resolvedAvatar && resolvedAvatar !== row.avatarUrl
              ? { avatarUrl: resolvedAvatar }
              : {}),
            ...(nameByEmail.has(emailKey) ? { name: resolvedName } : {}),
          },
        })
        .catch(() => undefined);
    }

    result.push({
      id: row.id,
      name: resolvedName,
      email: row.email,
      role: row.role,
      avatarUrl: resolvedAvatar,
    });
  }

  return result;
}
