import { getCategoryInfo } from "@/lib/categories";
import type { InteractiveToolSeo } from "@/lib/seo/interactive-tools";
import {
  getPageOgImageUrl,
  pathToOgPageId,
} from "@/lib/seo/page-og-registry";
import { getSiteUrl } from "@/lib/site-url";
import type { NewsArticle } from "@/types";

const ORG_NAME = "Web Space Station";
const ORG_LOGO_PATH = "/favicon-96.png";

const ORG_SAME_AS = [
  "https://discord.gg/wss",
  "https://youtube.com/@webspacestation",
  "https://x.com/webspacestation",
  "https://instagram.com/webspacestation",
  "https://facebook.com/webspacestation",
] as const;

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

  const liveTools = [
    { path: "/mapa", name: "ISS tracker na żywo" },
    { path: "/zorza", name: "Terminal zorzy polarnej" },
    { path: "/starty", name: "Starty rakiet na żywo" },
  ];

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: ORG_NAME,
      description:
        "Najważniejsze wydarzenia z kosmosu, astronomii i technologii kosmicznych. ISS tracker, terminal zorzy polarnej i harmonogram startów rakiet na żywo.",
      inLanguage: "pl-PL",
      publisher: { "@id": `${siteUrl}/#organization` },
      hasPart: liveTools.map((tool) => {
        const ogPageId = pathToOgPageId(tool.path);
        return {
          "@type": "WebApplication",
          name: tool.name,
          url: `${siteUrl}${tool.path}`,
          applicationCategory: "ScienceApplication",
          ...(ogPageId ? { image: getPageOgImageUrl(ogPageId) } : {}),
        };
      }),
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
      sameAs: [...ORG_SAME_AS],
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

type BreadcrumbItem = {
  name: string;
  path: string;
};

/** BreadcrumbList dla stron Odkrywaj / narzędzi. */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** WebApplication — ISS tracker, terminal zorzy, harmonogram startów. */
export function buildWebApplicationJsonLd(tool: InteractiveToolSeo) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${tool.path}`;
  const ogPageId = pathToOgPageId(tool.path);
  const ogImage = ogPageId ? getPageOgImageUrl(ogPageId) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${url}#app`,
    name: tool.headline,
    url,
    description: tool.description,
    applicationCategory: "ScienceApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: "pl-PL",
    isAccessibleForFree: true,
    keywords: tool.keywords.join(", "),
    featureList: tool.featureList,
    ...(ogImage ? { image: ogImage } : {}),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "PLN",
    },
    provider: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: ORG_NAME,
      url: siteUrl,
    },
  };
}

/** FAQPage — rich results dla częstych zapytań (Kp, ISS, starty). */
export function buildFaqPageJsonLd(
  faq: InteractiveToolSeo["faq"],
  aboutUrl: string,
) {
  if (faq.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    about: absoluteUrl(aboutUrl),
  };
}

/** Łączy WebApplication + Breadcrumb + FAQ dla narzędzia live. */
export function buildInteractiveToolJsonLd(
  tool: InteractiveToolSeo,
  breadcrumb: BreadcrumbItem[],
) {
  const blocks: Record<string, unknown>[] = [
    buildWebApplicationJsonLd(tool),
    buildBreadcrumbJsonLd(breadcrumb),
  ];
  const faq = buildFaqPageJsonLd(tool.faq, tool.path);
  if (faq) blocks.push(faq);
  return blocks;
}

/** CollectionPage — listingi działów, hubów, /aktualnosci. */
export function buildCollectionPageJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: `/${string}` | "/";
}) {
  const url = absoluteUrl(path);
  const ogPageId = pathToOgPageId(path);
  const ogImage = ogPageId ? getPageOgImageUrl(ogPageId) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    name,
    description,
    url,
    inLanguage: "pl-PL",
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    ...(ogImage ? { image: ogImage } : {}),
  };
}

/** Breadcrumb + CollectionPage dla stron listingowych. */
export function buildListingPageJsonLd(
  name: string,
  description: string,
  path: `/${string}` | "/",
  breadcrumb: BreadcrumbItem[],
) {
  return [
    buildCollectionPageJsonLd({ name, description, path }),
    buildBreadcrumbJsonLd(breadcrumb),
  ];
}
