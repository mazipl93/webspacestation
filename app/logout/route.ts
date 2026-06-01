import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST (and GET) /logout → sign out and return to the login screen.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 forces the follow-up request to be a GET on /login.
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

export const GET = POST;
