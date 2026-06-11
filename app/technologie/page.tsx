import type { Metadata } from "next";
import ArticleListingPageShell, {
  buildArticleListingMetadata,
  type ArticleListingConfig,
} from "@/components/pages/ArticleListingPageShell";

const LISTING: ArticleListingConfig = {
  title: "Technologie",
  description:
    "Rakiety, satelity, napędy i inżynieria kosmiczna — w tym AI w kontekście badań i eksploracji.",
  path: "/technologie",
};

type Props = {
  searchParams: Promise<{ strona?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildArticleListingMetadata(LISTING, searchParams);
}

export default function TechnologiePage({ searchParams }: Props) {
  return (
    <ArticleListingPageShell
      listing={LISTING}
      category="technologie"
      searchParams={searchParams}
    />
  );
}
