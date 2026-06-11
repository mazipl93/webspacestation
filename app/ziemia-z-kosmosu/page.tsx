import type { Metadata } from "next";
import ArticleListingPageShell, {
  buildArticleListingMetadata,
  type ArticleListingConfig,
} from "@/components/pages/ArticleListingPageShell";

const LISTING: ArticleListingConfig = {
  title: "Ziemia z kosmosu",
  description:
    "Zdjęcia i obserwacje Ziemi z orbity — zmiany klimatu, zorze polarne, burze geomagnetyczne i nocne światła kontynentów.",
  path: "/ziemia-z-kosmosu",
};

type Props = {
  searchParams: Promise<{ strona?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildArticleListingMetadata(LISTING, searchParams);
}

export default function ZiemiaZKosmosuPage({ searchParams }: Props) {
  return (
    <ArticleListingPageShell
      listing={LISTING}
      category="ziemia-z-kosmosu"
      searchParams={searchParams}
    />
  );
}
