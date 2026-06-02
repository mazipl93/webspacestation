import "server-only";

import { Role, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type UserRecord = Prisma.UserGetPayload<{ select: typeof userSelect }>;

const ASSIGNABLE_ROLES: Role[] = [
  Role.USER,
  Role.AUTHOR,
  Role.EDITOR,
  Role.MODERATOR,
  Role.ADMIN,
];

export function isAssignableRole(value: string): value is Role {
  return (ASSIGNABLE_ROLES as string[]).includes(value);
}

export function listUsers(): Promise<UserRecord[]> {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: userSelect,
  });
}

export function updateUserRole(
  id: string,
  role: Role
): Promise<UserRecord | null> {
  return prisma.user
    .update({
      where: { id },
      data: { role },
      select: userSelect,
    })
    .catch(() => null);
}
