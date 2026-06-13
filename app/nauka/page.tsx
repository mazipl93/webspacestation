import type { Metadata } from "next";
import ArticleListingPageShell, {
  buildArticleListingMetadata,
  type ArticleListingConfig,
} from "@/components/pages/ArticleListingPageShell";

const LISTING: ArticleListingConfig = {
  title: "Nauka · jak działa kosmos",
  description:
    "Evergreeny o fizyce kosmosu, astronomii od podstaw i technologiach orbitalnych. Przewodniki bez newsów z 24h.",
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
