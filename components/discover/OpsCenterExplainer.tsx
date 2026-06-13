import Link from "next/link";
import { Map, Rocket, Satellite, Sparkles } from "lucide-react";

const ITEMS = [
  {
    icon: Rocket,
    title: "Starty rakiet na żywo",
    text: "Harmonogram startów z odliczaniem do rakiety w czasie rzeczywistym.",
    href: "/starty",
    color: "#38bdf8",
  },
  {
    icon: Satellite,
    title: "ISS tracker na żywo",
    text: "Gdzie nad Ziemią leci Międzynarodowa Stacja Kosmiczna — pozycja i orbita.",
    href: "/mapa",
    color: "#38bdf8",
  },
  {
    icon: Sparkles,
    title: "Terminal zorzy polarnej",
    text: "Indeks Kp, prognoza zorzy i mapa widoczności aurora na żywo.",
    href: "/zorza",
    color: "#44ff88",
  },
  {
    icon: Map,
    title: "Mapa startów i ISS",
    text: "Orbita stacji i platformy startowe nadchodzących misji na globie.",
    href: "/mapa",
    color: "#a78bfa",
  },
] as const;

export default function OpsCenterExplainer() {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {ITEMS.map(({ icon: Icon, title, text, href, color }) => (
        <Link
          key={title}
          href={href}
          className="well group flex gap-3 rounded-xl p-3.5 transition-colors hover:border-hairline-strong"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline bg-glass"
            style={{ color }}
          >
            <Icon size={17} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-bold text-text-primary">{title}</span>
            <span className="mt-1 block text-[11px] leading-relaxed text-text-tertiary">
              {text}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
