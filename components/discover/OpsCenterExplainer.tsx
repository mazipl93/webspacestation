import Link from "next/link";
import { Map, Rocket, Satellite } from "lucide-react";

const ITEMS = [
  {
    icon: Rocket,
    title: "Starty rakiet",
    text: "Kiedy i skąd wystartuje następna rakieta z odliczeniem na żywo.",
    href: "/starty",
    color: "#38bdf8",
  },
  {
    icon: Satellite,
    title: "Stacja ISS",
    text: "Gdzie nad Ziemią leci ISS w tej chwili, aktualizacja co kilka minut.",
    href: "/mapa",
    color: "#38bdf8",
  },
  {
    icon: Map,
    title: "Mapa ISS i startów",
    text: "Orbita stacji i miejsca planowanych startów na globie.",
    href: "/mapa",
    color: "#a78bfa",
  },
] as const;

export default function OpsCenterExplainer() {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
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
