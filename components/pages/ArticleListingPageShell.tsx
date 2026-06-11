import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";
import { buildListingPageMetadata } from "@/lib/seo/listing-metadata";
import { parseListingPage } from "@/lib/seo/article-listing";
import type { CategorySlug } from "@/lib/categories";

export const revalidate = 300;

export type ArticleListingConfig = {
  title: string;
  description: string;
  path: `/${string}`;
};

type PageProps = {
  searchParams: Promise<{ strona?: string }>;
};

type ShellProps = PageProps & {
  listing: ArticleListingConfig;
  category?: CategorySlug;
};

export async function buildArticleListingMetadata(
  listing: ArticleListingConfig,
  searchParams: PageProps["searchParams"],
): Promise<Metadata> {
  const page = parseListingPage((await searchParams).strona);
  return buildListingPageMetadata({ ...listing, page });
}

export default async function ArticleListingPageShell({
  listing,
  category,
  searchParams,
}: ShellProps) {
  const page = parseListingPage((await searchParams).strona);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection
          category={category}
          page={page}
          basePath={listing.path}
        />
      </main>
      <Footer />
    </>
  );
}
