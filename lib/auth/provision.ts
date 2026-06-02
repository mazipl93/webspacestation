import "server-only";

import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Unusable hash — CMS login uses Supabase; Prisma.passwordHash is schema-required.
const PLACEHOLDER_PASSWORD = "__supabase_auth__";

async function placeholderHash(): Promise<string> {
  return bcrypt.hash(PLACEHOLDER_PASSWORD, 10);
}

/**
 * Ensures a Prisma User exists for a Supabase account. New rows always get role USER.
 * Never upgrades an existing role (admin promotions stay in /admin/users).
 */
export async function provisionPublicUser(
  email: string,
  name: string
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;

  const existing = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  });
  if (existing) return;

  const passwordHash = await placeholderHash();
  await prisma.user.create({
    data: {
      email: normalized,
      name: name.trim() || normalized.split("@")[0],
      role: Role.USER,
      passwordHash,
    },
  });
}
