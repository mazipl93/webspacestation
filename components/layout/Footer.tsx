"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { SITE_CONTAINER } from "@/lib/site-layout";
import WssLogoWordmark from "@/components/brand/WssLogoWordmark";

const FOOTER_NAV = {
  Nawigacja: [
    { label: "Aktualności", href: "/aktualnosci" },
    { label: "Misje", href: "/misje" },
    { label: "Astronomia", href: "/astronomia" },
    { label: "Technologie", href: "/technologie" },
    { label: "AI", href: "/ai" },
    { label: "Ziemia z kosmosu", href: "/ziemia-z-kosmosu" },
    { label: "ISS", href: "/iss" },
  ],
  Popularne: [
    { label: "Starty rakiet", href: "/starty" },
    { label: "Kalendarz misji", href: "/kalendarz" },
    { label: "Aktywne misje", href: "/misje" },
    { label: "Mapa kosmosu", href: "/mapa" },
    { label: "Galeria zdjęć", href: "/galeria" },
  ],
  Społeczność: [
    { label: "Discord", href: "https://discord.gg/wss" },
    { label: "YouTube", href: "https://youtube.com/@webspacestation" },
    { label: "X (Twitter)", href: "https://x.com/webspacestation" },
    { label: "Instagram", href: "https://instagram.com/webspacestation" },
    { label: "Facebook", href: "https://facebook.com/webspacestation" },
  ],
} as const;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
  }

  return (
    <footer className="mt-12 border-t border-hairline">
      {/* Newsletter strip */}
      <div
        className="py-14"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 15% 0%, rgba(47,109,255,0.1) 0%, transparent 60%)",
        }}
      >
        <div className={SITE_CONTAINER}>
          <div className="card-surface flex flex-col items-start justify-between gap-6 px-7 py-7 sm:flex-row sm:items-center">
            <div>
              <h3 className="mb-1.5 text-[20px] font-bold text-text-primary" style={{ letterSpacing: "-0.02em" }}>
                Bądź na bieżąco z kosmosem
              </h3>
              <p className="text-[13.5px] text-text-secondary">
                Najważniejsze newsy prosto na Twoją skrzynkę. Bez spamu.
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <form
                className="flex w-full gap-2 sm:w-auto"
                onSubmit={handleSubscribe}
                noValidate
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  placeholder="Twój adres e-mail"
                  aria-invalid={status === "error"}
                  aria-describedby="newsletter-status"
                  className={`flex-1 rounded-xl border bg-black/25 px-4 py-3 text-[13px] text-text-primary outline-none transition-all duration-300 placeholder:text-text-muted focus:ring-2 focus:ring-accent-blue/20 sm:w-72 ${
                    status === "error"
                      ? "border-accent-live/60 focus:border-accent-live/60"
                      : "border-hairline focus:border-accent-blue/60"
                  }`}
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-accent-blue px-5 py-3 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover hover:shadow-[0_8px_24px_-8px_rgba(47,109,255,0.7)] active:scale-[0.98]"
                >
                  {status === "success" ? (
                    <>
                      <Check size={15} />
                      Zapisano
                    </>
                  ) : (
                    "Zapisz się"
                  )}
                </button>
              </form>
              <p
                id="newsletter-status"
                role="status"
                aria-live="polite"
                className="mt-2 min-h-[18px] text-[12px]"
              >
                {status === "success" && (
                  <span className="text-[#22c55e]">
                    Dziękujemy! Potwierdź zapis w wiadomości e-mail.
                  </span>
                )}
                {status === "error" && (
                  <span className="text-accent-live">
                    Podaj poprawny adres e-mail.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa serwisu — grid kolumn (mobile: 2+1, desktop: logo + 3 kolumny) */}
      <div className={cn(SITE_CONTAINER, "pb-12 pt-6")}>
        <div className="rounded-2xl border border-hairline-faint bg-space-card/40 px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14 xl:gap-20">
            <div className="flex flex-col items-center border-b border-hairline-faint pb-8 text-center lg:max-w-[260px] lg:shrink-0 lg:items-start lg:border-0 lg:pb-0 lg:text-left">
              <WssLogoWordmark height={48} />
              <p className="mt-4 max-w-[280px] text-[13px] leading-relaxed text-text-tertiary lg:max-w-none">
                Największy polski portal informacyjny o kosmosie, astronomii i
                technologiach kosmicznych.
              </p>
            </div>

            <nav
              className="w-full flex-1"
              aria-label="Nawigacja w stopce"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 sm:gap-x-10 md:gap-x-14">
                {Object.entries(FOOTER_NAV).map(([title, links]) => (
                  <div
                    key={title}
                    className={cn(
                      title === "Społeczność" &&
                        "col-span-2 sm:col-span-1",
                    )}
                  >
                    <h4 className="overline mb-3.5 border-b border-hairline-faint pb-2 text-text-tertiary">
                      {title}
                    </h4>
                    <ul
                      className={cn(
                        title === "Społeczność"
                          ? "grid grid-cols-2 gap-x-4 gap-y-0.5 sm:grid-cols-1 sm:space-y-2"
                          : "space-y-2",
                      )}
                    >
                      {links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="inline-flex min-h-[36px] items-center text-[13px] text-text-secondary transition-colors duration-300 hover:text-text-primary"
                            {...(link.href.startsWith("http")
                              ? {
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                }
                              : {})}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-hairline-faint pt-7 sm:flex-row sm:items-center">
          <p className="text-[12px] text-text-muted">© 2026 Web Space Station</p>
          <p className="text-[12px] text-text-muted">Wszelkie prawa zastrzeżone</p>
        </div>
      </div>
    </footer>
  );
}

