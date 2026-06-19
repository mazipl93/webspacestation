import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Rocket, Satellite, Sparkles } from "lucide-react";
import SocialBrandIcon from "@/components/social/SocialBrandIcon";
import { WSS_SOCIAL_ALL } from "@/lib/social/wss-social-links";

// Cinematic full-bleed hero photograph (Earth from orbit). The base gradient
// below it doubles as a graceful fallback if the image ever fails to load.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2000&q=80";

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
              {WSS_SOCIAL_ALL.map((profile) => (
                <a
                  key={profile.id}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={profile.ariaLabel}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-glass text-text-tertiary transition-all duration-300 hover:border-hairline-strong hover:bg-glass-hover hover:text-text-primary"
                >
                  <SocialBrandIcon platform={profile.id} size={13} />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
