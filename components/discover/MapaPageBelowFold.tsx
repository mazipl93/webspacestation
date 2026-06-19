import Link from "next/link";
import { ChevronRight, Rocket, Sparkles, type LucideIcon } from "lucide-react";
import {
  InteractiveToolsCrossLinks,
  ToolSeoContent,
} from "@/components/seo/InteractiveToolSeo";
import type { InteractiveToolSeo } from "@/lib/seo/interactive-tools";

type Props = {
  tool: InteractiveToolSeo;
  related: InteractiveToolSeo[];
};

const TOOL_ICONS: Partial<Record<InteractiveToolSeo["id"], LucideIcon>> = {
  "rocket-launches": Rocket,
  "aurora-terminal": Sparkles,
};

export default function MapaPageBelowFold({ tool, related }: Props) {
  return (
    <div className="ops-discover-below" data-accent="violet">
      <div className="ops-discover-below__divider" aria-hidden />

      <Link href="/starty" className="ops-discover-below__cta ops-discover-below__cta--featured card-surface group">
        <span className="ops-discover-below__cta-glow" aria-hidden />
        <span className="ops-discover-below__cta-icon">
          <Rocket size={20} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="ops-discover-below__cta-kicker">Centrum operacyjne</span>
          <span className="mt-1 flex items-center gap-1 text-[15px] font-semibold text-text-primary">
            Harmonogram startów rakiet
            <ChevronRight
              size={15}
              className="shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5"
            />
          </span>
          <span className="mt-1.5 block text-[12px] leading-relaxed text-text-tertiary">
            Odliczanie do startu, daty NET i pełna lista misji SpaceX, NASA, ESA
          </span>
        </span>
      </Link>

      <section className="ops-discover-below__panel" aria-labelledby="mapa-related-tools">
        <InteractiveToolsCrossLinks
          tools={related}
          currentPath={tool.path}
          className="!mt-0"
          headingId="mapa-related-tools"
          linkIcons={TOOL_ICONS}
        />
      </section>

      <section className="ops-discover-below__faq-panel">
        <ToolSeoContent tool={tool} className="!mt-0 !border-0 !pt-0" variant="cards" />
      </section>
    </div>
  );
}
