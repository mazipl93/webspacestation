import type { Metadata } from "next";
import ArticleListingPageShell, {
  buildArticleListingMetadata,
  type ArticleListingConfig,
} from "@/components/pages/ArticleListingPageShell";

const LISTING: ArticleListingConfig = {
  title: "Aktualności",
  description:
    "Najnowsze wiadomości ze świata kosmosu, astronomii i technologii kosmicznych. Śledź misje, starty rakiet i odkrycia naukowe.",
  path: "/aktualnosci",
};

type Props = {
  searchParams: Promise<{ strona?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildArticleListingMetadata(LISTING, searchParams);
}

export default function AktualnostiPage({ searchParams }: Props) {
  return <ArticleListingPageShell listing={LISTING} searchParams={searchParams} />;
}
