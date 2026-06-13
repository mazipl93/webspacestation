import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContentGrid from "@/components/sections/ContentGrid";
import { loadHomepageContent } from "@/lib/home/homepage-content";
import {
  buildHeroLcpPreloadHref,
  getHeroPreconnectOrigin,
} from "@/lib/home/hero-lcp";
import { getSiteUrl } from "@/lib/site-url";
import { getPageKeywords } from "@/lib/seo/page-og-registry";
import { getPageOgImageForPath } from "@/lib/seo/site-og";
import { SITE_HOME_TITLE } from "@/lib/seo/site-title";

const HOME_DESCRIPTION =
  "Aktualności kosmiczne, ISS tracker na żywo, terminal zorzy polarnej (indeks Kp) i harmonogram startów rakiet. Web Space Station.";
const homeOg = getPageOgImageForPath("/");

export const metadata: Metadata = {
  title: { absolute: SITE_HOME_TITLE },
  description: HOME_DESCRIPTION,
  keywords: getPageKeywords("/"),
  alternates: { canonical: getSiteUrl() },
  robots: { index: true, follow: true },
  openGraph: {
    url: getSiteUrl(),
    title: SITE_HOME_TITLE,
    description: HOME_DESCRIPTION,
    type: "website",
    locale: "pl_PL",
    images: [
      {
        url: homeOg.url,
        width: homeOg.width,
        height: homeOg.height,
        alt: homeOg.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [homeOg.url],
  },
};

// DB-backed but cacheable: ISR revalidates every 5 min and on-demand via
// revalidateTag(ARTICLES_TAG) after a publish. Reads are wrapped in
// unstable_cache and are build-safe (return [] if the DB is unreachable).
// On-demand revalidatePath("/") on publish; ISR aligned with department pages (300 s).
export const revalidate = 300;

export default async function HomePage() {
  const homepage = await loadHomepageContent();
  const heroImage = homepage.derived.heroSlides[0]?.image;
  const lcpPreloadHref = buildHeroLcpPreloadHref(heroImage);
  const lcpPreconnect = getHeroPreconnectOrigin(heroImage);

  return (
    <>
      {lcpPreconnect ? (
        <link
          rel="preconnect"
          href={lcpPreconnect}
          crossOrigin="anonymous"
        />
      ) : null}
      {lcpPreloadHref ? (
        <link
          rel="preload"
          as="image"
          href={lcpPreloadHref}
          fetchPriority="high"
        />
      ) : null}
      <Navbar />
      <main className="relative z-[1]">
        <ContentGrid homepage={homepage} />
      </main>
      <Footer />
    </>
  );
}
