import Link from "next/link";
import { ChevronRight, Map, Rocket, Sparkles, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import StartyLaunchNewsSection from "@/components/discover/StartyLaunchNewsSection";
import {
  InteractiveToolsCrossLinks,
  ToolSeoContent,
} from "@/components/seo/InteractiveToolSeo";
import type { InteractiveToolSeo } from "@/lib/seo/interactive-tools";
import type { ArticleListItem } from "@/lib/server/articles";

type Props = {
  tool: InteractiveToolSeo;
  related: InteractiveToolSeo[];
  launchNews: ArticleListItem[];
};

const DISCOVER_LINKS = [
  {
    href: "/mapa",
    label: "ISS tracker na żywo",
    description: "Pozycja stacji kosmicznej, orbita i mapa platform startowych",
    icon: Map,
    accent: "#a78bfa",
  },
  {
    href: "/zorza",
    label: "Terminal zorzy polarnej",
    description: "Indeks Kp, wiatr słoneczny i prognoza zorzy na żywo",
    icon: Sparkles,
    accent: "#44ff88",
  },
] as const;

const TOOL_ICONS: Partial<Record<InteractiveToolSeo["id"], LucideIcon>> = {
  "iss-tracker": Map,
  "aurora-terminal": Sparkles,
  "rocket-launches": Rocket,
};

export default function StartyPageBelowFold({
  tool,
  related,
  launchNews,
}: Props) {
  return (
    <div className="ops-discover-below" data-accent="cyan">
      <div className="ops-discover-below__divider" aria-hidden />

      {launchNews.length > 0 ? (
        <section className="ops-discover-below__panel ops-discover-below__panel--news">
          <StartyLaunchNewsSection articles={launchNews} variant="embedded" />
        </section>
      ) : null}

      <div className="ops-discover-below__cta-grid">
        {DISCOVER_LINKS.map(({ href, label, description, icon: Icon, accent }) => (
          <Link
            key={href}
            href={href}
            className="ops-discover-below__cta card-surface group"
            style={{ "--discover-accent": accent } as CSSProperties}
          >
            <span className="ops-discover-below__cta-icon">
              <Icon size={18} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-[14px] font-semibold text-text-primary">
                {label}
                <ChevronRight
                  size={14}
                  className="shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed text-text-tertiary">
                {description}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <section
        className="ops-discover-below__panel"
        aria-labelledby="starty-related-tools"
      >
        <InteractiveToolsCrossLinks
          tools={related}
          currentPath={tool.path}
          className="!mt-0"
          headingId="starty-related-tools"
          linkIcons={TOOL_ICONS}
        />
      </section>

      <section className="ops-discover-below__faq-panel">
        <ToolSeoContent
          tool={tool}
          className="!mt-0 !border-0 !pt-0"
          variant="cards"
        />
      </section>
    </div>
  );
}
