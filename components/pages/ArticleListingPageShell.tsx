import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleFeedSection from "@/components/sections/ArticleFeedSection";
import JsonLd from "@/components/seo/JsonLd";
import { buildListingPageJsonLd } from "@/lib/seo/json-ld";
import { buildListingPageMetadata } from "@/lib/seo/listing-metadata";
import { parseListingPage } from "@/lib/seo/article-listing";
import type { CategorySlug } from "@/lib/categories";

export const revalidate = 300;

export type ArticleListingConfig = {
  title: string;
  description: string;
  path: `/${string}`;
};

type PageSearchParams = { strona?: string; dzial?: string };

type PageProps = {
  searchParams: Promise<PageSearchParams>;
};

type ShellProps = PageProps & {
  listing: ArticleListingConfig;
  category?: CategorySlug;
  /** When set, category comes from searchParams (e.g. ?dzial=misje on /aktualnosci). */
  resolveDepartment?: (params: PageSearchParams) => CategorySlug | undefined;
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
  category: categoryProp,
  resolveDepartment,
  searchParams,
}: ShellProps) {
  const params = await searchParams;
  const page = parseListingPage(params.strona);
  const category = categoryProp ?? resolveDepartment?.(params);
  const listingQuery = category && listing.path === "/aktualnosci"
    ? { dzial: category }
    : undefined;

  return (
    <>
      <JsonLd
        data={buildListingPageJsonLd(listing.title, listing.description, listing.path, [
          { name: "Strona główna", path: "/" },
          { name: listing.title, path: listing.path },
        ])}
      />
      <Navbar />
      <main className="min-h-screen">
        <ArticleFeedSection
          category={category}
          page={page}
          basePath={listing.path}
          listingQuery={listingQuery}
        />
      </main>
      <Footer />
    </>
  );
}
