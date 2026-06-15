import {
  buildArticlesSitemapEntries,
  renderUrlsetXml,
  sitemapXmlResponse,
} from "@/lib/seo/sitemap-builders";

export const revalidate = 300;

export async function GET() {
  const entries = await buildArticlesSitemapEntries();
  return sitemapXmlResponse(renderUrlsetXml(entries));
}
