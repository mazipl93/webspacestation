import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/user";
import { canAccessCms } from "@/lib/auth/permissions";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Logowanie do panelu | WSS",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Already signed in as CMS admin → straight to the panel.
  const { user } = await getAuthContext();
  if (user && canAccessCms(user.role)) redirect("/admin");

  return (
    <div className="grid min-h-dvh place-items-center bg-space-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-3 grid h-11 w-11 place-items-center rounded-[0.6rem] bg-accent-blue text-white">
            <span className="text-title-sm font-bold">W</span>
          </div>
          <h1 className="text-title font-semibold">Web Space Station</h1>
          <p className="mt-1 text-meta text-text-tertiary">
            Zaloguj się do panelu redakcji
          </p>
        </div>

        <div className="card-surface p-6">
          <Suspense
            fallback={
              <div className="py-6 text-center text-meta text-text-tertiary">
                Ładowanie…
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
