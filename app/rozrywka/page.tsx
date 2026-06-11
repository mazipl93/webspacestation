import type { Metadata } from "next";
import ArticleListingPageShell, {
  buildArticleListingMetadata,
  type ArticleListingConfig,
} from "@/components/pages/ArticleListingPageShell";

const LISTING: ArticleListingConfig = {
  title: "Rozrywka",
  description:
    "Gry, filmy i kultura sci-fi — kosmos w rozrywce: symulatory, RPG, premiery i seriale tematyczne.",
  path: "/rozrywka",
};

type Props = {
  searchParams: Promise<{ strona?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildArticleListingMetadata(LISTING, searchParams);
}

export default function RozrywkaPage({ searchParams }: Props) {
  return (
    <ArticleListingPageShell
      listing={LISTING}
      category="rozrywka"
      searchParams={searchParams}
    />
  );
}
