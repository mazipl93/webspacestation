import { getAuthContext } from "@/lib/auth/user";
import { getCurrentUser } from "@/lib/auth/session";
import {
  deleteUserAccount,
  DeleteAccountBlockedError,
  DeleteAccountServiceError,
  getDeleteAccountEligibility,
} from "@/lib/auth/delete-account";
import { jsonError, unauthorized } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Check whether the signed-in user may self-delete their account. */
export async function GET() {
  const { authenticated, user } = await getAuthContext();
  if (!authenticated || !user) return unauthorized();

  const eligibility = await getDeleteAccountEligibility(user);
  return Response.json(eligibility);
}

/** Permanently delete the signed-in account and all associated data. */
export async function POST() {
  const { authenticated, user } = await getAuthContext();
  if (!authenticated || !user) return unauthorized();

  const supaUser = await getCurrentUser();
  if (!supaUser?.id) {
    return jsonError(401, "UNAUTHORIZED", "Sesja wygasła. Zaloguj się ponownie.");
  }

  try {
    await deleteUserAccount({
      supabaseUserId: supaUser.id,
      user,
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof DeleteAccountBlockedError) {
      return jsonError(403, "DELETE_BLOCKED", error.message);
    }
    if (error instanceof DeleteAccountServiceError) {
      console.error("[account/delete]", error.message);
      return jsonError(503, "DELETE_FAILED", "Nie udało się usunąć konta. Spróbuj później.");
    }
    console.error("[account/delete]", error);
    return jsonError(500, "DELETE_FAILED", "Nie udało się usunąć konta.");
  }
}
