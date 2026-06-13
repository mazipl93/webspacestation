"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  writeCookieConsent,
  type CookieConsentChoice,
} from "@/lib/analytics/consent";

type Props = {
  onDecide: (choice: CookieConsentChoice) => void;
};

/** RODO banner — public site only, not CMS admin. */
export default function CookieConsentBanner({ onDecide }: Props) {
  const persist = (analytics: boolean) => {
    onDecide(writeCookieConsent(analytics));
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-hairline bg-[#0a0f18]/95 p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-5"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p
            id="cookie-consent-title"
            className="text-[14px] font-bold text-text-primary"
          >
            Pliki cookies
          </p>
          <p
            id="cookie-consent-desc"
            className="text-[13px] leading-relaxed text-text-secondary"
          >
            Niezbędne cookies (logowanie, polubienia) działają zawsze. Analityka
            Google Analytics uruchamia się dopiero po Twojej zgodzie. Służy do
            statystyk odwiedzin serwisu.{" "}
            <Link
              href="/polityka-prywatnosci"
              className="text-accent-cyan hover:underline"
            >
              Polityka prywatności
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => persist(false)}
            className={cn(
              "rounded-xl border border-hairline px-4 py-2.5 text-[13px] font-semibold",
              "text-text-secondary transition-colors hover:border-hairline-strong hover:text-text-primary"
            )}
          >
            Tylko niezbędne
          </button>
          <button
            type="button"
            onClick={() => persist(true)}
            className={cn(
              "rounded-xl border border-accent-cyan/40 bg-accent-cyan/15 px-4 py-2.5",
              "text-[13px] font-semibold text-accent-cyan transition-colors hover:bg-accent-cyan/25"
            )}
          >
            Akceptuj analitykę
          </button>
        </div>
      </div>
    </div>
  );
}
