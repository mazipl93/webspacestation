import type { EmailOtpType } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { safeRedirectPath } from "@/lib/auth/login-redirect";

export type AuthCallbackParams = {
  code: string | null;
  tokenHash: string | null;
  type: EmailOtpType | null;
  next: string;
};

const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export function parseAuthCallbackParams(
  searchParams: URLSearchParams
): AuthCallbackParams {
  const rawType = searchParams.get("type");
  const type =
    rawType && OTP_TYPES.has(rawType as EmailOtpType)
      ? (rawType as EmailOtpType)
      : null;

  return {
    code: searchParams.get("code"),
    tokenHash: searchParams.get("token_hash"),
    type,
    next: safeRedirectPath(searchParams.get("next")),
  };
}

/** Completes email-link auth (confirmation, magic link, recovery). */
export async function completeAuthCallbackSession(
  supabase: SupabaseClient,
  params: Pick<AuthCallbackParams, "code" | "tokenHash" | "type">
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (params.tokenHash && params.type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: params.tokenHash,
      type: params.type,
    });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  }

  return { ok: false, reason: "missing_code_or_token" };
}

export function mapAuthCallbackLoginError(code: string | null): string | null {
  if (code === "auth") {
    return "Link potwierdzający wygasł, został już użyty lub otwarto go w innej przeglądarce niż ta, w której zakładałeś konto. Otwórz link w tej samej przeglądarce albo zarejestruj się ponownie.";
  }
  if (code === "email_not_confirmed") {
    return "Potwierdź adres e-mail, zanim się zalogujesz. Sprawdź swoją skrzynkę.";
  }
  return null;
}
