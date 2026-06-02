import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { provisionPublicUser } from "@/lib/auth/provision";

/** Creates Prisma User with role USER when missing (never elevates role). */
export async function POST() {
  try {
    const supa = await getCurrentUser();
    const email = supa?.email;
    if (!email) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const metaName =
      typeof supa.user_metadata?.name === "string" ? supa.user_metadata.name : "";
    const name = metaName || email.split("@")[0];

    await provisionPublicUser(email, name);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/auth/provision]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Provisioning failed." } },
      { status: 500 }
    );
  }
}
