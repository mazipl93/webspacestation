import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isEmailVerified } from "@/lib/auth/email-verified";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Lightweight session refresh + auth gate for /admin.
 *
 * Role enforcement (CMS / ADMIN) lives in the admin layouts, which run on the
 * Node runtime with Prisma and `redirect()`. Middleware runs on Edge and cannot
 * use Prisma, so it only ensures there IS a Supabase session before /admin.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  // Let the logout route clear cookies — never refresh the session here.
  if (pathname === "/logout") {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !user?.email) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  const needsVerifiedEmail =
    pathname.startsWith("/profil") || pathname.startsWith("/api/profile");
  if (needsVerifiedEmail && user?.email && !isEmailVerified(user)) {
    const url = request.nextUrl.clone();
    url.pathname = "/logowanie";
    url.searchParams.set("error", "email_not_confirmed");
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
