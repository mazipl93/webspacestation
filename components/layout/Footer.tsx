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

      {/* Links grid */}
      <div className={cn(SITE_CONTAINER, "pb-12 pt-4")}>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-4">
              <WssLogoWordmark height={48} />
            </div>
            <p className="max-w-[260px] text-[13px] leading-relaxed text-text-tertiary">
              Największy polski portal informacyjny o kosmosie, astronomii i technologiach
              kosmicznych.
            </p>
          </div>

          {Object.entries(FOOTER_NAV).map(([title, links]) => (
            <div key={title}>
              <h4 className="overline mb-4 text-text-tertiary">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-text-secondary transition-colors duration-300 hover:text-text-primary"
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
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

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-hairline-faint pt-7 sm:flex-row">
          <p className="text-[12px] text-text-muted">© 2026 Web Space Station</p>
          <p className="text-[12px] text-text-muted">Wszelkie prawa zastrzeżone</p>
        </div>
      </div>
    </footer>
  );
}

