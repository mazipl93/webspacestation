import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSitemapIndexLocations,
  renderSitemapIndexXml,
  renderUrlsetXml,
  sitemapChildPath,
} from "./sitemap-builders";

describe("sitemap-builders", () => {
  it("builds index locations for pages and articles only", () => {
    assert.deepEqual(buildSitemapIndexLocations(), [
      "https://webspacestation.pl/sitemaps/pages.xml",
      "https://webspacestation.pl/sitemaps/articles.xml",
    ]);
  });

  it("renders sitemap index xml without tag or feed urls", () => {
    const xml = renderSitemapIndexXml(
      buildSitemapIndexLocations(),
      new Date("2026-06-15T12:00:00.000Z"),
    );
    assert.match(xml, /<sitemapindex/);
    assert.match(xml, new RegExp(sitemapChildPath("pages")));
    assert.match(xml, new RegExp(sitemapChildPath("articles")));
    assert.doesNotMatch(xml, /\/tag\//);
    assert.doesNotMatch(xml, /\/feed\//);
  });

  it("renders urlset without rss or tag urls", () => {
    const xml = renderUrlsetXml([
      {
        url: "https://webspacestation.pl/",
        lastModified: new Date("2026-06-15T12:00:00.000Z"),
        changeFrequency: "hourly",
        priority: 1,
      },
      {
        url: "https://webspacestation.pl/aktualnosci",
        lastModified: new Date("2026-06-15T12:00:00.000Z"),
        changeFrequency: "daily",
        priority: 0.9,
      },
    ]);
    assert.match(xml, /<urlset/);
    assert.match(xml, /https:\/\/webspacestation\.pl\/aktualnosci<\/loc>/);
    assert.doesNotMatch(xml, /\/rss<\/loc>/);
    assert.doesNotMatch(xml, /\/tag\//);
    assert.doesNotMatch(xml, /\/feed\//);
  });
});
