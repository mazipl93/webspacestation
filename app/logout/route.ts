import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

type CookieToSet = { name: string; value: string; options: CookieOptions };

function safeRedirectPath(value: string | null, fallback: string): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}

function isSupabaseAuthCookie(name: string): boolean {
  return name.startsWith("sb-") && name.includes("auth-token");
}

function expireAuthCookie(response: NextResponse, name: string, options?: CookieOptions) {
  response.cookies.set(name, "", {
    ...options,
    path: options?.path ?? "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

async function signOutAndRedirect(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const next = safeRedirectPath(url.searchParams.get("next"), "/");
  const response = NextResponse.redirect(new URL(next, request.url), {
    status: 303,
  });

  const cookieStore = await cookies();
  const authCookieNames = new Set<string>();
  const authCookieOptions = new Map<string, CookieOptions>();

  for (const cookie of cookieStore.getAll()) {
    if (isSupabaseAuthCookie(cookie.name)) authCookieNames.add(cookie.name);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
            if (isSupabaseAuthCookie(name)) {
              authCookieNames.add(name);
              if (options) authCookieOptions.set(name, options);
            }
            try {
              cookieStore.set(name, value, options);
            } catch {
              /* ignore */
            }
          });
        },
      },
    }
  );

  await supabase.auth.signOut({ scope: "global" });

  for (const name of authCookieNames) {
    expireAuthCookie(response, name, authCookieOptions.get(name));
  }

  return response;
}

export async function POST(request: Request) {
  return signOutAndRedirect(request);
}

export const GET = POST;
