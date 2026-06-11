import type { Metadata } from "next";
import ArticleListingPageShell, {
  buildArticleListingMetadata,
  type ArticleListingConfig,
} from "@/components/pages/ArticleListingPageShell";

const LISTING: ArticleListingConfig = {
  title: "ISS",
  description:
    "Aktualności z Międzynarodowej Stacji Kosmicznej — spacery kosmiczne, ekspedycje, eksperymenty naukowe i rotacje załogi.",
  path: "/iss",
};

type Props = {
  searchParams: Promise<{ strona?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return buildArticleListingMetadata(LISTING, searchParams);
}

export default function IssPage({ searchParams }: Props) {
  return (
    <ArticleListingPageShell
      listing={LISTING}
      category="iss"
      searchParams={searchParams}
    />
  );
}
