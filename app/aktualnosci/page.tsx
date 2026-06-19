import type { Metadata } from "next";
import ArticleListingPageShell, {
  buildArticleListingMetadata,
  type ArticleListingConfig,
} from "@/components/pages/ArticleListingPageShell";
import { getCategoryInfo } from "@/lib/categories";
import {
  parseListingDepartment,
  parseListingPage,
} from "@/lib/seo/article-listing";
import { buildListingPageMetadata } from "@/lib/seo/listing-metadata";

const LISTING: ArticleListingConfig = {
  title: "Aktualności kosmiczne",
  description:
    "Najnowsze wiadomości ze świata kosmosu, astronomii i technologii kosmicznych: newsy o misjach, startach rakiet i odkryciach naukowych.",
  path: "/aktualnosci",
};

type Props = {
  searchParams: Promise<{ strona?: string; dzial?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = parseListingPage(params.strona);
  const department = parseListingDepartment(params.dzial);

  if (department) {
    const meta = getCategoryInfo(department);
    return buildListingPageMetadata({
      title: `${LISTING.title} · ${meta.label}`,
      description: meta.description || LISTING.description,
      path: LISTING.path,
      page,
      query: { dzial: department },
    });
  }

  return buildArticleListingMetadata(LISTING, Promise.resolve(params));
}

export default function AktualnostiPage({ searchParams }: Props) {
  return (
    <ArticleListingPageShell
      listing={LISTING}
      searchParams={searchParams}
      resolveDepartment={(params) => parseListingDepartment(params.dzial)}
    />
  );
}
