import type { Metadata } from "next";
import ArticleListingPageShell, {
  buildArticleListingMetadata,
  type ArticleListingConfig,
} from "@/components/pages/ArticleListingPageShell";

const LISTING: ArticleListingConfig = {
  title: "Astronomia",
  description:
    "Odkrycia astronomiczne, teleskopy kosmiczne, egzoplanety, czarne dziury i tajemnice wszechświata.",
  path: "/astronomia",
};

type Props = {
  searchParams: Promise<{ strona?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildArticleListingMetadata(LISTING, searchParams);
}

export default function AstronomiaPage({ searchParams }: Props) {
  return (
    <ArticleListingPageShell
      listing={LISTING}
      category="astronomia"
      searchParams={searchParams}
    />
  );
}
