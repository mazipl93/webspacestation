"use client";

import Link from "next/link";
import { ChevronRight, Map, Rocket, Sparkles, type LucideIcon } from "lucide-react";
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
  "iss-tracker": Map,
  "rocket-launches": Rocket,
  "aurora-terminal": Sparkles,
};

export default function SledzIssPageBelowFold({ tool, related }: Props) {
  return (
    <div className="ops-discover-below" data-accent="cyan">
      <div className="ops-discover-below__divider" aria-hidden />

      <Link
        href="/mapa"
        className="ops-discover-below__cta ops-discover-below__cta--featured card-surface group"
      >
        <span className="ops-discover-below__cta-glow" aria-hidden />
        <span className="ops-discover-below__cta-icon">
          <Map size={20} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="ops-discover-below__cta-kicker">Mapa 2D</span>
          <span className="mt-1 flex items-center gap-1 text-[15px] font-semibold text-text-primary">
            ISS tracker + platformy startowe
            <ChevronRight
              size={15}
              className="shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5"
            />
          </span>
          <span className="mt-1.5 block text-[12px] leading-relaxed text-text-tertiary">
            Płaska mapa z pinami kosmodromów i harmonogramem startów obok orbity ISS
          </span>
        </span>
      </Link>

      <section className="ops-discover-below__panel" aria-labelledby="sledziss-related-tools">
        <InteractiveToolsCrossLinks
          tools={related}
          currentPath={tool.path}
          className="!mt-0"
          headingId="sledziss-related-tools"
          linkIcons={TOOL_ICONS}
        />
      </section>

      <section className="ops-discover-below__faq-panel">
        <ToolSeoContent tool={tool} className="!mt-0 !border-0 !pt-0" variant="cards" />
      </section>
    </div>
  );
}
