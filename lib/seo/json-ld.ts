import { getCategoryInfo } from "@/lib/categories";
import { getSiteUrl } from "@/lib/site-url";
import type { NewsArticle } from "@/types";

const ORG_NAME = "Web Space Station";
const ORG_LOGO_PATH = "/favicon-96.png";

function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function absoluteImage(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  return absoluteUrl(url);
}

/** WebSite + Organization — root layout / homepage. */
export function buildSiteJsonLd() {
  const siteUrl = getSiteUrl();
  const logoUrl = absoluteUrl(ORG_LOGO_PATH);

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: ORG_NAME,
      description:
        "Najważniejsze wydarzenia z kosmosu, astronomii i technologii kosmicznych.",
      inLanguage: "pl-PL",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: ORG_NAME,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
  ];
}

/** NewsArticle on public article pages. */
export function buildArticleJsonLd(article: NewsArticle) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/aktualnosci/${article.slug}`;
  const cat = getCategoryInfo(article.category);
  const authorName =
    article.publicByline?.name?.trim() ||
    article.authorByline?.trim() ||
    ORG_NAME;

  const image = absoluteImage(article.image);

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: article.title,
    description: article.excerpt,
    url,
    inLanguage: "pl-PL",
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: ORG_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(ORG_LOGO_PATH),
      },
    },
    articleSection: cat.label,
    ...(image ? { image: [image] } : {}),
    ...(article.originalUrl
      ? { isBasedOn: article.originalUrl }
      : {}),
  };
}
