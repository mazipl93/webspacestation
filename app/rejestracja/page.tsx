import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth/session";
import RegisterForm from "./RegisterForm";

import { SEO_NOINDEX } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Rejestracja",
  description: "Załóż darmowe konto Web Space Station.",
  robots: SEO_NOINDEX,
};

type Props = {
  searchParams: Promise<{ redirectTo?: string }>;
};

function safeRedirect(target: string | undefined): string {
  if (target && target.startsWith("/") && !target.startsWith("//")) return target;
  return "/";
}

export default async function RejestracjaPage({ searchParams }: Props) {
  const { redirectTo } = await searchParams;
  const destination = safeRedirect(redirectTo);

  // Already signed in → no need to register.
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
              Załóż konto
            </h1>
            <p className="mt-1.5 text-[13.5px] text-text-secondary">
              Dołącz do społeczności Web Space Station — to darmowe.
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
              <RegisterForm />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
