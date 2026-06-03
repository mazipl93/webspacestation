import type { NewsArticle } from "@/types";
import HeroArticle from "@/components/sections/HeroArticle";
import HeroSecondaryStory from "@/components/sections/HeroSecondaryStory";

/**
 * Lead + do 2 towarzyszących artykułów (zamiast osobnej sekcji „Ważne teraz”).
 */
export default function HeroEditorialCluster({
  lead,
  secondary,
  topPriority = false,
}: {
  lead: NewsArticle;
  secondary: NewsArticle[];
  topPriority?: boolean;
}) {
  const side = secondary.slice(0, 2);

  return (
    <section aria-label="Główne tematy" className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)] lg:items-stretch lg:gap-4">
        <HeroArticle article={lead} topPriority={topPriority} />

        {side.length > 0 ? (
          <div className="flex flex-col gap-4 lg:min-h-full lg:justify-stretch">
            {side.map((article) => (
              <HeroSecondaryStory key={article.id} article={article} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
