import {
  buildSitemapIndexLocations,
  renderSitemapIndexXml,
  sitemapXmlResponse,
} from "@/lib/seo/sitemap-builders";

export const revalidate = 300;

export async function GET() {
  return sitemapXmlResponse(renderSitemapIndexXml(buildSitemapIndexLocations()));
}
