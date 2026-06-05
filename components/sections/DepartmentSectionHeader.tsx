import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SectionThemeConfig } from "@/lib/home/homepage-section-themes";

/** Tytuł + „Więcej” — na mobile w kolumnie, żeby nic nie nachodziło. */
function SectionTitleRow({
  title,
  more,
}: {
  title: ReactNode;
  more?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">{title}</div>
      {more ? <div className="shrink-0 self-start sm:self-auto">{more}</div> : null}
    </div>
  );
}

function MoreLink({ href, accent }: { href: string; accent: string }) {
  return (
    <Link
      href={href}
      className="group flex shrink-0 items-center gap-1 rounded-full border border-hairline-faint px-3.5 py-1.5 text-[12px] font-semibold text-text-secondary transition-all hover:border-hairline-strong hover:text-text-primary sm:text-[11.5px]"
      style={{ background: "var(--glass-fill)" }}
    >
      Więcej
      <ChevronRight
        size={14}
        className="transition-transform group-hover:translate-x-0.5"
        style={{ color: accent }}
      />
    </Link>
  );
}

/** Nagłówek sekcji — unikalny wygląd per dział / blok homepage. */
export default function DepartmentSectionHeader({
  config,
  className,
}: {
  config: SectionThemeConfig;
  className?: string;
}) {
  const { theme, accent, accentAlt, kicker, label, subtitle, href, live } = config;
  const alt = accentAlt ?? accent;
  const hasKicker = Boolean(kicker?.trim());
  const hasSubtitle = Boolean(subtitle?.trim());

  const more = href ? <MoreLink href={href} accent={accent} /> : null;

  if (theme === "week-topic") {
    const [first, ...rest] = label.split(" ");
    return (
      <div className={cn("relative isolate z-[2] mb-5 sm:mb-7", className)}>
        <span
          className="mb-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, ${alt} 100%)`,
            boxShadow: `0 4px 20px -4px ${accent}88`,
          }}
        >
          {kicker}
        </span>
        <SectionTitleRow
          more={more}
          title={
            <h2
              className="max-w-[640px] text-[1.75rem] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-[2.35rem]"
              style={{ textShadow: `0 0 40px ${accent}44` }}
            >
              <span style={{ color: accent }}>{first}</span>
              {rest.length > 0 ? (
                <span className="text-text-primary"> {rest.join(" ")}</span>
              ) : null}
            </h2>
          }
        />
        {hasSubtitle ? (
          <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-text-tertiary md:text-[14px]">
            {subtitle}
          </p>
        ) : null}
        <div
          aria-hidden
          className="mt-5 h-1.5 rounded-full"
          style={{ background: `linear-gradient(90deg, ${accent}, ${alt}, transparent)` }}
        />
      </div>
    );
  }

  if (theme === "latest") {
    return (
      <div className={cn("relative isolate z-[2] mb-5 sm:mb-7", className)}>
        <p
          className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold sm:text-[12.5px]"
          style={{ color: accent }}
        >
          {live ? <span className="live-dot shrink-0" style={{ background: accent }} /> : null}
          {kicker}
        </p>
        <SectionTitleRow
          more={more}
          title={
            <h2 className="text-[1.5rem] font-extrabold tracking-[-0.03em] text-text-primary sm:text-[1.875rem]">
              {label}
            </h2>
          }
        />
        <div
          aria-hidden
          className="mt-5 h-1 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accent} 0%, ${accent}88 38%, ${accent}22 72%, transparent 100%)`,
          }}
        />
      </div>
    );
  }

  if (theme === "popular") {
    return (
      <div className={cn("relative isolate z-[2] mb-5 sm:mb-7", className)}>
        <p
          className="mb-2 text-[12px] font-bold uppercase tracking-[0.2em]"
          style={{ color: alt }}
        >
          {kicker}
        </p>
        <SectionTitleRow
          more={more}
          title={
            <h2
              className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[2.5rem]"
              style={{
                background: `linear-gradient(135deg, ${accent} 0%, ${alt} 55%, #fff4e0 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {label}
            </h2>
          }
        />
        <div aria-hidden className="mt-5 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${accent}${i === 0 ? "ff" : "44"}, transparent)`,
                opacity: 1 - i * 0.18,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (theme === "technologie") {
    return (
      <div
        className={cn(
          "relative isolate z-[2] mb-5 border-l-4 pl-5 sm:mb-7 sm:pl-6",
          className,
        )}
        style={{ borderColor: accent }}
      >
        {hasKicker ? (
          <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-text-tertiary">
            {kicker}
          </p>
        ) : null}
        <SectionTitleRow
          more={more}
          title={
            <h2
              className="text-[1.5rem] font-extrabold uppercase leading-tight sm:text-[2.25rem]"
              style={{ color: accent, letterSpacing: "0.04em" }}
            >
              {label}
            </h2>
          }
        />
        {hasSubtitle ? (
          <p className="mt-3 max-w-[640px] font-mono text-[13px] leading-relaxed text-text-tertiary">
            {subtitle}
          </p>
        ) : null}
        <div
          aria-hidden
          className="mt-4 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
            backgroundSize: "8px 1px",
          }}
        />
      </div>
    );
  }

  if (theme === "astronomia") {
    return (
      <div className={cn("relative isolate z-[2] mb-5 sm:mb-7", className)}>
        <div
          aria-hidden
          className="pointer-events-none absolute -left-1 top-0 hidden gap-3 opacity-50 sm:flex"
        >
          {[8, 5, 6].map((s, i) => (
            <span
              key={i}
              className="rounded-full bg-white"
              style={{ width: s, height: s, opacity: 0.25 + i * 0.15 }}
            />
          ))}
        </div>
        {hasKicker ? (
          <p className="mb-2 text-[12px] font-semibold tracking-[0.12em]" style={{ color: alt }}>
            {kicker}
          </p>
        ) : null}
        <SectionTitleRow
          more={more}
          title={
            <h2
              className="text-[1.65rem] font-extrabold leading-tight tracking-[-0.03em] sm:text-[2.45rem]"
              style={{
                background: `linear-gradient(165deg, #fff 0%, ${accent} 48%, ${alt} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {label}
            </h2>
          }
        />
        {hasSubtitle ? (
          <p className="mt-3 max-w-[640px] text-[15px] italic leading-relaxed text-text-tertiary md:text-[14px]">
            {subtitle}
          </p>
        ) : null}
        <div
          aria-hidden
          className="mt-5 h-px w-full"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${accent}88 0%, transparent 35%), linear-gradient(90deg, ${accent}55, transparent 80%)`,
          }}
        />
      </div>
    );
  }

  if (theme === "misje") {
    return (
      <div className={cn("relative isolate z-[2] mb-5 sm:mb-7", className)}>
        {hasKicker ? (
          <div className="mb-3 flex items-center gap-3">
            <span
              className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{
                borderColor: `${accent}55`,
                color: accent,
                background: `${accent}12`,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
              {kicker}
            </span>
          </div>
        ) : null}
        <SectionTitleRow
          more={more}
          title={
            <h2 className="text-[1.65rem] font-extrabold leading-tight tracking-[-0.03em] text-text-primary sm:text-[2.3rem]">
              <span
                className="mr-1.5 inline-block align-middle text-[1.1rem] font-bold opacity-35 sm:mr-2 sm:text-[1.25rem]"
                style={{ color: accent }}
              >
                {"//"}
              </span>
              <span className="align-middle">{label}</span>
            </h2>
          }
        />
        {hasSubtitle ? (
          <p className="mt-2.5 max-w-[640px] text-[15px] leading-relaxed text-text-tertiary md:text-[14px]">
            {subtitle}
          </p>
        ) : null}
        <div
          aria-hidden
          className="mt-5 h-0.5 w-full"
          style={{
            background: `repeating-linear-gradient(90deg, ${accent} 0, ${accent} 12px, transparent 12px, transparent 20px)`,
            opacity: 0.65,
          }}
        />
      </div>
    );
  }

  if (theme === "ziemia-z-kosmosu") {
    return (
      <div className={cn("relative isolate z-[2] mb-5 sm:mb-7", className)}>
        {hasKicker ? (
          <p className="mb-2 text-[12px] font-semibold tracking-wide" style={{ color: accent }}>
            {kicker}
          </p>
        ) : null}
        <SectionTitleRow
          more={more}
          title={
            <h2
              className="text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em] sm:text-[2.15rem]"
              style={{ color: accent }}
            >
              {label}
            </h2>
          }
        />
        {hasSubtitle ? (
          <p className="mt-2.5 max-w-[640px] text-[15px] leading-relaxed text-text-tertiary md:text-[14px]">
            {subtitle}
          </p>
        ) : null}
        <div aria-hidden className="relative mt-5 h-3 overflow-hidden">
          <div
            className="absolute inset-x-0 bottom-0 h-6 rounded-[100%]"
            style={{
              background: `linear-gradient(180deg, transparent 40%, ${accent}33 100%)`,
              boxShadow: `0 -1px 0 ${accent}66`,
            }}
          />
        </div>
      </div>
    );
  }

  if (theme === "iss") {
    return (
      <div className={cn("relative isolate z-[2] mb-5 sm:mb-6", className)}>
        <div aria-hidden className="mb-3 flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="h-1 flex-1 rounded-sm"
              style={{ background: i % 2 === 0 ? accent : `${accent}44` }}
            />
          ))}
        </div>
        {hasKicker ? (
          <p
            className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            {kicker}
          </p>
        ) : null}
        <SectionTitleRow
          more={more}
          title={
            <h2 className="text-[1.85rem] font-extrabold leading-tight tracking-[-0.04em] text-text-primary sm:text-[2.75rem]">
              {label}
            </h2>
          }
        />
        {hasSubtitle ? (
          <p className="mt-2 text-[14px] leading-relaxed text-text-tertiary">{subtitle}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("relative isolate z-[2] mb-5 sm:mb-7", className)}>
      {hasKicker ? (
        <p
          className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em]"
          style={{ color: accent }}
        >
          {live ? <span className="live-dot shrink-0" style={{ background: accent }} /> : null}
          {kicker}
        </p>
      ) : null}
      <SectionTitleRow
        more={more}
        title={
          <h2
            className="text-[1.5rem] font-extrabold uppercase tracking-[0.04em] sm:text-[2rem]"
            style={{ color: accent, textShadow: `0 0 32px ${accent}44` }}
          >
            {label}
          </h2>
        }
      />
      {hasSubtitle ? (
        <p className="mt-2.5 text-[14px] leading-relaxed text-text-tertiary">{subtitle}</p>
      ) : null}
      <div aria-hidden className="mt-4 flex items-center gap-2">
        <span
          className="h-px flex-1"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">
          WSS
        </span>
        <span
          className="h-px flex-1"
          style={{ background: `linear-gradient(270deg, ${accent}, transparent)` }}
        />
      </div>
    </div>
  );
}
