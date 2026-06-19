import Link from "next/link";
import WssLogo from "@/components/brand/WssLogo";
import CookieSettingsButton from "@/components/consent/CookieSettingsButton";
import { cn } from "@/lib/cn";
import { SITE_CONTAINER } from "@/lib/site-layout";

const FOOTER_NAV = {
  Nawigacja: [
    { label: "Aktualności", href: "/aktualnosci" },
    { label: "Misje", href: "/misje" },
    { label: "Astronomia", href: "/astronomia" },
    { label: "Nauka", href: "/nauka" },
    { label: "Technologie kosmiczne", href: "/technologie" },
    { label: "ISS i załogi", href: "/iss" },
    { label: "Ziemia z kosmosu", href: "/ziemia-z-kosmosu" },
  ],
  Tematy: [
    { label: "NASA", href: "/nasa" },
    { label: "SpaceX", href: "/spacex" },
    { label: "ESA", href: "/esa" },
    { label: "James Webb (JWST)", href: "/jwst" },
    { label: "Program Artemis", href: "/artemis" },
    { label: "Mars", href: "/mars" },
    { label: "Księżyc", href: "/ksiezyc" },
    { label: "Stacja kosmiczna", href: "/stacja-kosmiczna" },
    { label: "Czarne dziury", href: "/czarne-dziury" },
    { label: "Egzoplanety", href: "/egzoplanety" },
    { label: "Starlink", href: "/starlink" },
    { label: "Blue Origin", href: "/blue-origin" },
  ],
  Odkrywaj: [
    { label: "ISS tracker na żywo", href: "/mapa" },
    { label: "Terminal zorzy polarnej (Kp)", href: "/zorza" },
    { label: "Starty rakiet na żywo", href: "/starty" },
    { label: "Galeria zdjęć", href: "/galeria" },
    { label: "Wideo", href: "/wideo" },
    { label: "Subskrypcje RSS", href: "/rss" },
  ],
  Społeczność: [
    { label: "Discord", href: "https://discord.gg/wss" },
    { label: "YouTube", href: "https://youtube.com/@webspacestation" },
    { label: "X (Twitter)", href: "https://x.com/webspacestation" },
    { label: "Instagram", href: "https://instagram.com/webspacestation" },
    { label: "Facebook", href: "https://facebook.com/webspacestation" },
  ],
} as const;

const FOOTER_LEGAL = [
  { label: "Kontakt", href: "/kontakt" },
  { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
  { label: "Szukaj", href: "/search" },
] as const;

export default function Footer() {
  return (
    <footer className="relative mt-14 overflow-hidden border-t border-hairline">
      {/* Kotwica wizualna — pas nad treścią stopki */}
      <div
        aria-hidden
        className="h-[3px] w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #2f6dff 18%, #22d3ee 50%, #2f6dff 82%, transparent 100%)",
        }}
      />

      <div
        className="relative"
        style={{
          background:
            "radial-gradient(ellipse 70% 120% at 0% 0%, rgba(47,109,255,0.14) 0%, transparent 55%), radial-gradient(ellipse 50% 80% at 100% 100%, rgba(34,211,238,0.06) 0%, transparent 50%), linear-gradient(180deg, #0a0f18 0%, #060910 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "rgba(47,109,255,0.35)" }}
        />

        <div className={cn(SITE_CONTAINER, "relative py-10 sm:py-12")}>
          <div className="card-surface editorial-surface overflow-hidden rounded-2xl border border-hairline">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
              {/* Punkt zaczepienia — marka */}
              <div className="relative border-b border-hairline-faint bg-[#0c111a] px-6 py-8 sm:px-8 lg:border-b-0 lg:border-r">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
                  style={{
                    background:
                      "linear-gradient(180deg, #2f6dff 0%, #22d3ee 55%, transparent 100%)",
                  }}
                />
                <WssLogo
                  asLink
                  height={120}
                  className="rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan"
                />
                <p className="mt-5 text-[13px] leading-relaxed text-text-secondary">
                  Polski portal o kosmosie, astronomii i technologiach
                  kosmicznych. Newsy, misje i odkrycia.
                </p>
              </div>

              {/* Mapa linków — zwarte kolumny */}
              <div className="px-6 py-8 sm:px-8">
                <nav aria-label="Nawigacja w stopce">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-8">
                    {Object.entries(FOOTER_NAV).map(([title, links]) => (
                      <div key={title}>
                        <h4 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
                          <span
                            className="h-3 w-[2px] shrink-0 rounded-full bg-accent-cyan/80"
                            aria-hidden
                          />
                          {title}
                        </h4>
                        <ul className="space-y-1.5">
                          {links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="inline-flex min-h-[32px] items-center text-[13px] text-text-secondary transition-colors hover:text-accent-cyan"
                                {...(link.href.startsWith("http") || link.href === "/zorza"
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
          </div>

          {/* Dolny pasek — jedna linia, bez pustego rozwodu */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="text-[12px] text-text-muted">
              © 2026 Web Space Station · Wszelkie prawa zastrzeżone
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {FOOTER_LEGAL.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[12px] text-text-tertiary transition-colors hover:text-text-primary"
                >
                  {link.label}
                </Link>
              ))}
              <CookieSettingsButton className="text-[12px] text-text-tertiary transition-colors hover:text-text-primary" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
