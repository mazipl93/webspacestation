import {
  buildPagesSitemapEntries,
  renderUrlsetXml,
  sitemapXmlResponse,
} from "@/lib/seo/sitemap-builders";

export const revalidate = 300;

export async function GET() {
  return sitemapXmlResponse(renderUrlsetXml(buildPagesSitemapEntries()));
}
