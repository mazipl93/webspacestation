import type { Metadata } from "next";
import ArticleListingPageShell, {
  buildArticleListingMetadata,
  type ArticleListingConfig,
} from "@/components/pages/ArticleListingPageShell";

const LISTING: ArticleListingConfig = {
  title: "Nauka",
  description: "Jak działa kosmos — fizyka, astronomia i technologie orbitalne.",
  path: "/nauka",
};

type Props = {
  searchParams: Promise<{ strona?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildArticleListingMetadata(LISTING, searchParams);
}

export default function NaukaPage({ searchParams }: Props) {
  return (
    <ArticleListingPageShell
      listing={LISTING}
      category="nauka"
      searchParams={searchParams}
    />
  );
}
