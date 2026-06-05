import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  completeAuthCallbackSession,
  parseAuthCallbackParams,
} from "@/lib/auth/auth-callback";
import { provisionPublicUser } from "@/lib/auth/provision";

// Exchanges the email-link token (token_hash or PKCE code) for a session cookie.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const params = parseAuthCallbackParams(searchParams);

  try {
    const supabase = await createClient();
    const sessionResult = await completeAuthCallbackSession(supabase, params);

    if (!sessionResult.ok) {
      console.error("[auth/callback]", sessionResult.reason);
      return NextResponse.redirect(`${origin}/logowanie?error=auth`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.redirect(`${origin}/logowanie?error=auth`);
    }

    const metaName =
      typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";
    await provisionPublicUser(
      user.email,
      metaName || user.email.split("@")[0]
    );

    return NextResponse.redirect(`${origin}${params.next}`);
  } catch (err) {
    console.error("[auth/callback]", err);
    return NextResponse.redirect(`${origin}/logowanie?error=auth`);
  }
}
