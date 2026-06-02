import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

async function hasRoleAccess(
  request: NextRequest,
  checkPath: "/api/auth/cms-check" | "/api/auth/admin-check"
): Promise<boolean> {
  const url = new URL(checkPath, request.nextUrl.origin);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Session refresh + /admin gates. Role checks call Node API routes (Prisma)
 * because middleware runs on Edge and cannot use Prisma directly.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isUsersAdminRoute = pathname.startsWith("/admin/users");

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

  if (isAdminRoute) {
    if (!user?.email) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    const allowed = await hasRoleAccess(
      request,
      isUsersAdminRoute ? "/api/auth/admin-check" : "/api/auth/cms-check"
    );

    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = isUsersAdminRoute ? "/admin/dashboard" : "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
