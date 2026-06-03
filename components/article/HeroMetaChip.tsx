import type { LucideIcon } from "lucide-react";

/** Readable meta on photo heroes — dark glass chip, not flat gray on image. */
export default function HeroMetaChip({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-black/60 px-2.5 py-1 text-[13px] font-semibold leading-none text-white shadow-[0_2px_16px_rgba(0,0,0,0.55)] backdrop-blur-md">
      <Icon size={14} className="shrink-0 text-white/90" aria-hidden />
      {children}
    </span>
  );
}
