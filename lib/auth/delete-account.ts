import "server-only";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppUser } from "@/lib/auth/user";
import { getDeleteAccountBlockReason } from "@/lib/auth/delete-account-eligibility";

const AVATARS_BUCKET = "avatars";

export type DeleteAccountEligibility = {
  allowed: boolean;
  reason?: string;
};

export async function getDeleteAccountEligibility(
  user: AppUser
): Promise<DeleteAccountEligibility> {
  const authoredArticleCount = await prisma.article.count({
    where: { authorId: user.id },
  });
  const reason = getDeleteAccountBlockReason(authoredArticleCount);
  if (reason) return { allowed: false, reason };
  return { allowed: true };
}

async function deleteUserAvatars(supabaseUserId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: files, error: listError } = await admin.storage
    .from(AVATARS_BUCKET)
    .list(supabaseUserId);
  if (listError || !files?.length) return;

  const paths = files.map((file) => `${supabaseUserId}/${file.name}`);
  await admin.storage.from(AVATARS_BUCKET).remove(paths);
}

export type DeleteUserAccountInput = {
  supabaseUserId: string;
  user: AppUser;
};

/**
 * Full account removal: avatar storage → Prisma user → Supabase auth.users
 * (cascades comments, likes, department subscriptions).
 */
export async function deleteUserAccount({
  supabaseUserId,
  user,
}: DeleteUserAccountInput): Promise<void> {
  const eligibility = await getDeleteAccountEligibility(user);
  if (!eligibility.allowed) {
    throw new DeleteAccountBlockedError(eligibility.reason ?? "Delete blocked");
  }

  const admin = createAdminClient();
  if (!admin) {
    throw new DeleteAccountServiceError("Service role unavailable");
  }

  await deleteUserAvatars(supabaseUserId);

  const { error } = await admin.auth.admin.deleteUser(supabaseUserId);
  if (error) {
    throw new DeleteAccountServiceError(error.message);
  }

  // After auth.users is gone (cascades comments, likes, subscriptions).
  await prisma.user.delete({ where: { id: user.id } });
}

export class DeleteAccountBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeleteAccountBlockedError";
  }
}

export class DeleteAccountServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeleteAccountServiceError";
  }
}
