import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { SEO_NOINDEX } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Przypomnij hasło",
  description: "Odzyskaj dostęp do konta Web Space Station.",
  robots: SEO_NOINDEX,
};

export default function ZapomnialemHaslaPage() {
  return (
    <>
      <Navbar />
      <main className="grid min-h-[calc(100vh-160px)] place-items-center px-6 pb-16 pt-[120px]">
        <div className="w-full max-w-sm">
          <div className="mb-7 flex flex-col items-center text-center">
            <h1
              className="font-extrabold text-text-primary"
              style={{ fontSize: "clamp(1.4rem, 4vw, 1.85rem)", letterSpacing: "-0.03em" }}
            >
              Przypomnij hasło
            </h1>
            <p className="mt-1.5 text-[13.5px] text-text-secondary">
              Wyślemy link do ustawienia nowego hasła.
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
              <ForgotPasswordForm />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
