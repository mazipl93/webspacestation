/** Same-site relative path only — blocks open redirects. */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/"
): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}

/** Full navigation so middleware + Server Components see fresh Supabase cookies. */
export function redirectAfterAuth(next: string): void {
  window.location.assign(next);
}

/** Ensure a Prisma row exists (role USER for new accounts). Best-effort. */
export async function provisionSessionUser(): Promise<void> {
  try {
    await fetch("/api/auth/provision", { method: "POST" });
  } catch {
    /* non-fatal — layout/API will 403 until provision succeeds */
  }
}
