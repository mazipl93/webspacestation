import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth/session";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Logowanie",
  description: "Zaloguj się do swojego konta Web Space Station.",
};

type Props = {
  searchParams: Promise<{ redirectTo?: string }>;
};

function safeRedirect(target: string | undefined): string {
  // Only allow same-site relative paths to avoid open-redirects.
  if (target && target.startsWith("/") && !target.startsWith("//")) return target;
  return "/";
}

export default async function LogowaniePage({ searchParams }: Props) {
  const { redirectTo } = await searchParams;
  const destination = safeRedirect(redirectTo);

  // Already signed in → skip the form.
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }
  if (user) redirect(destination);

  return (
    <>
      <Navbar />
      <main className="grid min-h-[calc(100vh-160px)] place-items-center px-6 pb-16 pt-[120px]">
        <div className="w-full max-w-sm">
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-blue to-[#1a4fd0] text-white shadow-[0_4px_16px_-4px_rgba(47,109,255,0.7)]">
              <span className="text-[18px] font-extrabold">W</span>
            </div>
            <h1
              className="font-extrabold text-text-primary"
              style={{ fontSize: "clamp(1.4rem, 4vw, 1.85rem)", letterSpacing: "-0.03em" }}
            >
              Zaloguj się
            </h1>
            <p className="mt-1.5 text-[13.5px] text-text-secondary">
              Komentuj, zapisuj artykuły i odbieraj powiadomienia.
            </p>
          </div>

          <div className="card-surface p-6 sm:p-7">
            <Suspense
              fallback={
                <div className="py-6 text-center text-[13px] text-text-tertiary">
                  Ładowanie…
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
