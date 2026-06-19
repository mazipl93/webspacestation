import Link from "next/link";
import { Map, Rocket, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/starty", label: "Starty", icon: Rocket, color: "#38bdf8" },
  { href: "/mapa", label: "Mapa", icon: Map, color: "#a78bfa" },
  {
    href: "/zorza",
    label: "Zorza",
    icon: Sparkles,
    color: "#44ff88",
    newTab: true,
  },
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
      {links.map(({ href, label, icon: Icon, color, ...rest }) => {
        const newTab = "newTab" in rest && rest.newTab;
        const className = "ops-quick-nav__link";
        const content = (
          <>
            <span className="ops-quick-nav__icon" style={{ color }}>
              <Icon size={16} aria-hidden />
            </span>
            <span>{label}</span>
          </>
        );

        return newTab ? (
          <Link
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {content}
          </Link>
        ) : (
          <Link key={href} href={href} className={className}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
