import Link from "next/link";
import { Calendar, Map, Rocket } from "lucide-react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/starty", label: "Starty", icon: Rocket, color: "#38bdf8" },
  { href: "/kalendarz", label: "Terminy", icon: Calendar, color: "#2f6dff" },
  { href: "/mapa", label: "Mapa", icon: Map, color: "#a78bfa" },
] as const;

type Props = {
  className?: string;
  layout?: "row" | "grid";
  exclude?: string[];
};

export default function OpsQuickNav({ className, layout = "grid", exclude }: Props) {
  const links = exclude ? LINKS.filter((l) => !exclude.includes(l.href)) : LINKS;
  return (
    <nav
      className={cn(
        "ops-quick-nav",
        layout === "row" ? "ops-quick-nav--row" : "ops-quick-nav--grid",
        className,
      )}
      aria-label="Skróty Odkrywaj"
    >
      {links.map(({ href, label, icon: Icon, color }) => (
        <Link key={href} href={href} className="ops-quick-nav__link">
          <span className="ops-quick-nav__icon" style={{ color }}>
            <Icon size={16} aria-hidden />
          </span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
