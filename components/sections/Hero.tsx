import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Rocket, Satellite, Sparkles } from "lucide-react";

// Cinematic full-bleed hero photograph (Earth from orbit). The base gradient
// below it doubles as a graceful fallback if the image ever fails to load.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2000&q=80";

// ─── Social icons (inline SVG – no extra dep) ────────────────────────────────

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const SOCIAL = [
  { label: "X", icon: <XIcon />, href: "https://x.com/webspacestation" },
  { label: "YouTube", icon: <YouTubeIcon />, href: "https://youtube.com/@webspacestation" },
  { label: "Instagram", icon: <InstagramIcon />, href: "https://instagram.com/webspacestation" },
  { label: "Facebook", icon: <FacebookIcon />, href: "https://facebook.com/webspacestation" },
];

// ─── Star field – pre-computed to avoid hydration mismatch ──────────────────

const STARS = [
  { x: "8%",  y: "12%", s: 1,   o: 0.7 },
  { x: "15%", y: "6%",  s: 1.5, o: 0.5 },
  { x: "22%", y: "20%", s: 1,   o: 0.4 },
  { x: "4%",  y: "35%", s: 1,   o: 0.55 },
  { x: "30%", y: "8%",  s: 1,   o: 0.45 },
  { x: "38%", y: "25%", s: 1.5, o: 0.35 },
  { x: "45%", y: "14%", s: 1,   o: 0.5 },
  { x: "52%", y: "5%",  s: 1,   o: 0.65 },
  { x: "18%", y: "42%", s: 1,   o: 0.4 },
  { x: "60%", y: "18%", s: 1,   o: 0.45 },
  { x: "68%", y: "10%", s: 2,   o: 0.6 },
  { x: "74%", y: "30%", s: 1,   o: 0.5 },
  { x: "80%", y: "16%", s: 1,   o: 0.55 },
  { x: "87%", y: "24%", s: 1,   o: 0.4 },
  { x: "93%", y: "12%", s: 1.5, o: 0.5 },
  { x: "78%", y: "44%", s: 1,   o: 0.45 },
  { x: "84%", y: "55%", s: 2,   o: 0.55 },
  { x: "91%", y: "38%", s: 1,   o: 0.4 },
  { x: "96%", y: "50%", s: 1,   o: 0.35 },
  { x: "72%", y: "62%", s: 1.5, o: 0.4 },
  // City-light cluster (right half, mid-height)
  { x: "70%", y: "48%", s: 2,   o: 0.7 },
  { x: "73%", y: "52%", s: 1.5, o: 0.55 },
  { x: "76%", y: "46%", s: 1,   o: 0.5 },
  { x: "79%", y: "54%", s: 2,   o: 0.65 },
  { x: "82%", y: "49%", s: 1,   o: 0.45 },
  { x: "85%", y: "58%", s: 1.5, o: 0.5 },
  { x: "88%", y: "43%", s: 2,   o: 0.6 },
  { x: "90%", y: "60%", s: 1,   o: 0.4 },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section className="relative flex min-h-[56vh] items-center overflow-hidden">

      {/* ── Layer 0: Deep space base ─────────────────────────────────── */}
      <div
        className="absolute inset-0 -z-40"
        style={{
          background:
            "linear-gradient(160deg, #04080f 0%, #060c18 35%, #050a16 60%, #04080d 100%)",
        }}
      />

      {/* ── Layer 1: Cinematic full-bleed photograph (slow drift) ────── */}
      <div aria-hidden="true" className="hero-drift absolute inset-0 -z-30">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
      </div>

      {/* ── Layer 2: Cinematic depth — vignette + editorial glow ─────── */}
      <div
        aria-hidden="true"
        className="hero-glow-drift absolute inset-0 -z-20 pointer-events-none"
        style={{
          background: `
            radial-gradient(120% 90% at 78% 42%, rgba(40,110,230,0.18) 0%, transparent 45%),
            radial-gradient(100% 100% at 50% 50%, transparent 55%, rgba(2,4,8,0.75) 100%)
          `,
        }}
      />

      {/* ── Layer 3: Stars & city lights ────────────────────────────── */}
      <div className="absolute inset-0 -z-20 pointer-events-none" aria-hidden="true">
        {STARS.map((star, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width:  `${star.s}px`,
              height: `${star.s}px`,
              left:   star.x,
              top:    star.y,
              opacity: star.o,
              boxShadow:
                star.s >= 1.5
                  ? `0 0 ${star.s * 3}px rgba(255,255,255,${star.o * 0.7})`
                  : undefined,
            }}
          />
        ))}
      </div>

      {/* ── Layer 4: Left content scrim (headline contrast) ─────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 -z-10 w-[78%] pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(4,7,12,0.96) 0%, rgba(4,7,12,0.86) 34%, rgba(4,7,12,0.55) 62%, transparent 100%)",
        }}
      />

      {/* ── Layer 5: Bottom fade into content grid ───────────────────── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 -z-10 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, #050709 100%)",
        }}
      />

      {/* ── Content (defocuses as it scrolls into the feed) ───────────── */}
      <div className="hero-fade container-site w-full pt-20 pb-12">
        <div className="max-w-[620px]">

          {/* Eyebrow */}
          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-9 bg-gradient-to-r from-accent-cyan to-transparent" />
            <span className="overline text-accent-cyan">Portal informacyjny</span>
          </div>

          {/* H1 – biggest element on the page */}
          <h1
            className="mb-7 font-extrabold text-text-primary"
            style={{
              fontSize: "clamp(3rem, 7.5vw, 5.5rem)",
              lineHeight: 0.92,
              letterSpacing: "-0.035em",
              textShadow: "0 2px 50px rgba(0,0,0,0.55)",
            }}
          >
            <span className="block text-gradient">WEB SPACE</span>
            <span className="relative block text-gradient">
              STATION
              <sup
                aria-hidden="true"
                className="absolute text-accent-blue"
                style={{ fontSize: "0.26em", top: "0.08em", marginLeft: "0.16em", lineHeight: 1 }}
              >
                ✦
              </sup>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mb-8 leading-relaxed text-text-secondary"
            style={{ fontSize: "var(--text-body)", maxWidth: "440px", textShadow: "0 1px 20px rgba(0,0,0,0.5)" }}
          >
            Najważniejsze wydarzenia z kosmosu, astronomii i technologii kosmicznych —
            w jednym miejscu, na bieżąco.
          </p>

          {/* CTA row */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <Link
              href="/aktualnosci"
              className="group inline-flex items-center gap-2 rounded-xl bg-accent-blue px-5 py-3 text-[13.5px] font-semibold text-white transition-all duration-300 hover:bg-accent-blue-hover hover:shadow-[0_8px_30px_-8px_rgba(47,109,255,0.7)] active:scale-[0.97]"
            >
              Najnowsze wiadomości
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/starty"
              className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-glass px-5 py-3 text-[13.5px] font-semibold text-text-primary backdrop-blur-sm transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover active:scale-[0.97]"
            >
              Starty rakiet
              <Rocket size={14} className="text-accent-cyan" />
            </Link>
            <Link
              href="/mapa"
              className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-glass px-5 py-3 text-[13.5px] font-semibold text-text-primary backdrop-blur-sm transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover active:scale-[0.97]"
            >
              ISS tracker
              <Satellite size={14} className="text-accent-cyan" />
            </Link>
            <Link
              href="/zorza"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#44ff8844] bg-[#44ff8810] px-5 py-3 text-[13.5px] font-semibold text-[#a7f3c0] backdrop-blur-sm transition-all duration-300 hover:border-[#44ff8866] hover:bg-[#44ff8818] active:scale-[0.97]"
            >
              Terminal zorzy polarnej
              <Sparkles size={14} className="text-[#44ff88]" />
            </Link>
          </div>

          {/* Social follow */}
          <div className="flex items-center gap-4">
            <span className="overline text-text-tertiary">Śledź nas</span>
            <span className="h-3.5 w-px" style={{ background: "var(--hairline-strong)" }} />
            <div className="flex items-center gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-glass text-text-tertiary transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover hover:text-text-primary"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
