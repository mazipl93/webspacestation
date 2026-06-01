import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Exchanges the `code` from a Supabase email link (confirmation / magic link /
// password recovery) for a persisted session cookie, then forwards the user on.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  // Only allow same-site relative paths to avoid open redirects.
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      /* fall through to the error redirect */
    }
  }

  return NextResponse.redirect(`${origin}/logowanie?error=auth`);
}
