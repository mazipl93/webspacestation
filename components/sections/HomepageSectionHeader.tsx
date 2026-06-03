import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function HomepageSectionHeader({
  label,
  href,
  accent = "#22d3ee",
  glow,
}: {
  label: string;
  href?: string;
  accent?: string;
  glow?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
      <div className="flex items-center gap-2.5">
        <span
          className="h-4 w-[3px] shrink-0 rounded-full"
          style={{
            background: accent,
            boxShadow: glow ?? `0 0 10px ${accent}88`,
          }}
        />
        <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-text-secondary sm:text-[12px]">
          {label}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-text-tertiary transition-colors hover:text-accent-cyan sm:text-[12px]"
        >
          Zobacz więcej
          <ChevronRight size={15} className="sm:h-3.5 sm:w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
