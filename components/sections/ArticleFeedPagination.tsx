import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listingPageHref, type ListingPageQuery } from "@/lib/seo/article-listing";
import { cn } from "@/lib/cn";

type Props = {
  basePath: string;
  page: number;
  totalPages: number;
  listingQuery?: ListingPageQuery;
};

function pageRange(current: number, total: number): number[] {
  if (total <= 1) return [];
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  const pages: number[] = [];
  for (let p = start; p <= end; p += 1) pages.push(p);
  return pages;
}

export default function ArticleFeedPagination({
  basePath,
  page,
  totalPages,
  listingQuery,
}: Props) {
  if (totalPages <= 1) return null;

  const pages = pageRange(page, totalPages);
  const prevHref = page > 1 ? listingPageHref(basePath, page - 1, listingQuery) : null;
  const nextHref =
    page < totalPages ? listingPageHref(basePath, page + 1, listingQuery) : null;

  return (
    <nav
      aria-label="Paginacja artykułów"
      className="mt-10 flex flex-col items-center gap-4 border-t border-hairline pt-8"
    >
      <p className="text-[12px] text-text-muted">
        Strona {page} z {totalPages}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="inline-flex items-center gap-1 rounded-lg border border-hairline px-3 py-2 text-[12.5px] font-medium text-text-secondary transition-colors hover:border-accent-blue/40 hover:text-text-primary"
          >
            <ChevronLeft size={14} />
            Poprzednia
          </Link>
        ) : (
          <span
            aria-hidden
            className="inline-flex items-center gap-1 rounded-lg border border-transparent px-3 py-2 text-[12.5px] text-text-muted opacity-40"
          >
            <ChevronLeft size={14} />
            Poprzednia
          </span>
        )}

        <div className="flex items-center gap-1">
          {pages[0] != null && pages[0] > 1 ? (
            <>
              <PageLink
                basePath={basePath}
                page={1}
                current={page}
                listingQuery={listingQuery}
              />
              {pages[0] > 2 ? (
                <span className="px-1 text-text-muted">…</span>
              ) : null}
            </>
          ) : null}
          {pages.map((p) => (
            <PageLink
              key={p}
              basePath={basePath}
              page={p}
              current={page}
              listingQuery={listingQuery}
            />
          ))}
          {pages.at(-1) != null && pages.at(-1)! < totalPages ? (
            <>
              {pages.at(-1)! < totalPages - 1 ? (
                <span className="px-1 text-text-muted">…</span>
              ) : null}
              <PageLink
                basePath={basePath}
                page={totalPages}
                current={page}
                listingQuery={listingQuery}
              />
            </>
          ) : null}
        </div>

        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex items-center gap-1 rounded-lg border border-hairline px-3 py-2 text-[12.5px] font-medium text-text-secondary transition-colors hover:border-accent-blue/40 hover:text-text-primary"
          >
            Następna
            <ChevronRight size={14} />
          </Link>
        ) : (
          <span
            aria-hidden
            className="inline-flex items-center gap-1 rounded-lg border border-transparent px-3 py-2 text-[12.5px] text-text-muted opacity-40"
          >
            Następna
            <ChevronRight size={14} />
          </span>
        )}
      </div>
    </nav>
  );
}

function PageLink({
  basePath,
  page,
  current,
  listingQuery,
}: {
  basePath: string;
  page: number;
  current: number;
  listingQuery?: ListingPageQuery;
}) {
  const active = page === current;
  return (
    <Link
      href={listingPageHref(basePath, page, listingQuery)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-[12.5px] font-semibold transition-colors",
        active
          ? "bg-accent-blue text-white shadow-[0_4px_16px_-6px_rgba(47,109,255,0.65)]"
          : "border border-hairline text-text-secondary hover:border-accent-blue/40 hover:text-text-primary",
      )}
    >
      {page}
    </Link>
  );
}
