import type { Metadata } from "next";
import { preload } from "react-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContentGrid from "@/components/sections/ContentGrid";
import {
  buildHomepageHeroPreloadHref,
  resolveHomepageLcpImageUrl,
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
// On-demand revalidatePath("/") on publish; short ISR as safety net.
export const revalidate = 60;

export default async function HomePage() {
  const lcpImage = await resolveHomepageLcpImageUrl();
  if (lcpImage) {
    preload(buildHomepageHeroPreloadHref(lcpImage), {
      as: "image",
      fetchPriority: "high",
    });
  }

  return (
    <>
      <Navbar />
      <main className="relative z-[1]">
        <ContentGrid />
      </main>
      <Footer />
    </>
  );
}
