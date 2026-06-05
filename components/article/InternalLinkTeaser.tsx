import Link from "next/link";
import { getCategoryInfo } from "@/lib/categories";
import {
  INTERNAL_LINK_TEASER_OPENERS,
  internalLinkHint,
  type InternalLinkCandidate,
} from "@/lib/article/weave-internal-links";
import type { NewsCategory } from "@/types";

type Props = {
  article: InternalLinkCandidate;
  sourceCategory: NewsCategory;
  templateIndex: number;
};

/** Jedna wpleciona wzmianka + link — bez ramki „Czytaj również”. */
export default function InternalLinkTeaser({
  article,
  sourceCategory,
  templateIndex,
}: Props) {
  const candidateMeta = getCategoryInfo(article.category);
  const sameDepartment = article.category === sourceCategory;
  const opener =
    INTERNAL_LINK_TEASER_OPENERS[templateIndex % INTERNAL_LINK_TEASER_OPENERS.length]({
      categoryLabel: candidateMeta.label,
      title: article.title,
      sameDepartment,
    });
  const hint = internalLinkHint(article.excerpt);

  return (
    <p
      className="mb-6 border-l-2 border-accent-blue/35 pl-4 text-[13.5px] leading-relaxed text-text-tertiary"
      style={{ fontSize: "var(--text-body-sm, 0.9rem)" }}
    >
      {opener}{" "}
      <Link
        href={`/aktualnosci/${article.slug}`}
        className="font-semibold text-accent-cyan underline decoration-accent-cyan/35 underline-offset-2 transition-colors hover:text-accent-blue hover:decoration-accent-blue/50"
      >
        {article.title}
      </Link>
      {hint ? (
        <>
          {" "}
          <span className="text-text-muted">— {hint}</span>
        </>
      ) : null}
      .
    </p>
  );
}
