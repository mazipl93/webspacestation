import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import {
  buildInteractiveToolJsonLd,
} from "@/lib/seo/json-ld";
import type { InteractiveToolSeo } from "@/lib/seo/interactive-tools";

type Props = {
  tool: InteractiveToolSeo;
  breadcrumbLabel?: string;
};

export function ToolPageJsonLd({ tool, breadcrumbLabel }: Props) {
  const data = buildInteractiveToolJsonLd(tool, [
    { name: "Strona główna", path: "/" },
    { name: "Odkrywaj", path: "/starty" },
    { name: breadcrumbLabel ?? tool.headline, path: tool.path },
  ]);

  return <JsonLd data={data} />;
}

type CrossLinksProps = {
  tools: InteractiveToolSeo[];
  currentPath: string;
  className?: string;
  headingId?: string;
  linkIcons?: Partial<Record<InteractiveToolSeo["id"], LucideIcon>>;
};

/** Wewnętrzne linki między ISS trackerem, zorzą i startami. */
export function InteractiveToolsCrossLinks({
  tools,
  currentPath,
  className,
  headingId = "interactive-tools-links",
  linkIcons,
}: CrossLinksProps) {
  const links = tools.filter((t) => t.path !== currentPath);
  if (links.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className={className}>
      <h2
        id={headingId}
        className="mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-text-primary"
      >
        Powiązane narzędzia
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((tool) => {
          const Icon = linkIcons?.[tool.id];
          return (
            <Link
              key={tool.path}
              href={tool.path}
              className="ops-discover-tool-link card-surface group flex items-start gap-3 rounded-xl border border-hairline p-4 transition-colors hover:border-hairline-strong"
            >
              {Icon ? (
                <span className="ops-discover-below__tool-icon" aria-hidden>
                  <Icon size={18} />
                </span>
              ) : null}
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-[14px] font-semibold text-text-primary">
                  {tool.headline}
                  <ChevronRight
                    size={14}
                    className="shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
                <span className="mt-1 block text-[12px] leading-relaxed text-text-tertiary">
                  {tool.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

type SeoContentProps = {
  tool: InteractiveToolSeo;
  className?: string;
  variant?: "plain" | "cards";
};

/** Widoczny blok treści + FAQ pod narzędziem (indeksowalny, naturalny język). */
export function ToolSeoContent({
  tool,
  className,
  variant = "plain",
}: SeoContentProps) {
  const faqListClass =
    variant === "cards"
      ? "mt-4 grid gap-3 sm:grid-cols-1"
      : "mt-3 space-y-4";
  const faqItemClass =
    variant === "cards"
      ? "rounded-xl border border-hairline-faint bg-[rgba(0,0,0,0.22)] px-4 py-3.5"
      : undefined;

  return (
    <section aria-labelledby={`${tool.id}-seo`} className={className}>
      <h2
        id={`${tool.id}-seo`}
        className="text-[15px] font-bold text-text-primary sm:text-[16px]"
      >
        {tool.headline} · jak korzystać
      </h2>
      <p className="mt-3 max-w-[68ch] text-[13px] leading-relaxed text-text-secondary">
        {tool.longDescription}
      </p>

      {tool.faq.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-text-muted">
            Najczęstsze pytania
          </h3>
          <dl className={faqListClass}>
            {tool.faq.map((item) => (
              <div key={item.question} className={faqItemClass}>
                <dt className="text-[13px] font-semibold text-text-primary">
                  {item.question}
                </dt>
                <dd className="mt-1.5 max-w-[68ch] text-[12px] leading-relaxed text-text-tertiary">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
