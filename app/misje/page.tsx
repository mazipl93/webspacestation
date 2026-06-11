import type { Metadata } from "next";
import ArticleListingPageShell, {
  buildArticleListingMetadata,
  type ArticleListingConfig,
} from "@/components/pages/ArticleListingPageShell";

const LISTING: ArticleListingConfig = {
  title: "Misje",
  description:
    "Artykuły o misjach kosmicznych — eksploracja planet, loty załogowe, starty rakiet i programy kosmiczne NASA, SpaceX i ESA.",
  path: "/misje",
};

type Props = {
  searchParams: Promise<{ strona?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildArticleListingMetadata(LISTING, searchParams);
}

export default function MisjePage({ searchParams }: Props) {
  return (
    <ArticleListingPageShell
      listing={LISTING}
      category="misje"
      searchParams={searchParams}
    />
  );
}
