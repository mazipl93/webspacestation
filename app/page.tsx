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
import { getDefaultOgImageUrl } from "@/lib/seo/site-og";

export const metadata: Metadata = {
  title: "Web Space Station – Aktualności kosmiczne",
  alternates: { canonical: getSiteUrl() },
  openGraph: {
    url: getSiteUrl(),
    images: [{ url: getDefaultOgImageUrl(), width: 512, height: 512 }],
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
