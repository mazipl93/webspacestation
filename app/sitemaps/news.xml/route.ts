import {
  buildNewsSitemapEntries,
  renderNewsUrlsetXml,
  sitemapXmlResponse,
} from "@/lib/seo/sitemap-builders";

export const revalidate = 300;

export async function GET() {
  const entries = await buildNewsSitemapEntries();
  return sitemapXmlResponse(renderNewsUrlsetXml(entries));
}
