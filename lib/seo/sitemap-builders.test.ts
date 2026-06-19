import assert from "node:assert/strict";
import { ArticleContentKind } from "@prisma/client";
import { describe, it } from "node:test";
import {
  buildSitemapIndexLocations,
  filterFreshNewsSitemapEntries,
  matchesFreshNewsSitemapCriteria,
  NEWS_SITEMAP_FRESH_HOURS,
  NEWS_SITEMAP_FRESH_MS,
  renderNewsUrlsetXml,
  renderSitemapIndexXml,
  renderUrlsetXml,
  sitemapChildPath,
} from "./sitemap-builders";

describe("sitemap-builders", () => {
  it("builds index locations for pages, articles, and news", () => {
    assert.deepEqual(buildSitemapIndexLocations(), [
      "https://webspacestation.pl/sitemaps/pages.xml",
      "https://webspacestation.pl/sitemaps/articles.xml",
      "https://webspacestation.pl/sitemaps/news.xml",
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
    assert.match(xml, new RegExp(sitemapChildPath("news")));
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

  it("renders Google News urlset with publication metadata", () => {
    const xml = renderNewsUrlsetXml([
      {
        slug: "spacex-starship-test",
        title: "SpaceX Starship — test startu",
        publishedAt: new Date("2026-06-18T10:00:00.000Z"),
      },
    ]);
    assert.match(xml, /xmlns:news="http:\/\/www\.google\.com\/schemas\/sitemap-news\/0\.9"/);
    assert.match(xml, /<news:name>Web Space Station<\/news:name>/);
    assert.match(xml, /<news:language>pl<\/news:language>/);
    assert.match(
      xml,
      /https:\/\/webspacestation\.pl\/aktualnosci\/spacex-starship-test<\/loc>/,
    );
  });
});

describe("fresh news sitemap filter", () => {
  const now = new Date("2026-06-19T12:00:00.000Z");

  it(`includes articles within ${NEWS_SITEMAP_FRESH_HOURS}h`, () => {
    const fresh = new Date(now.getTime() - NEWS_SITEMAP_FRESH_MS + 60_000);
    assert.equal(
      matchesFreshNewsSitemapCriteria(
        {
          publishedAt: fresh,
          contentKind: ArticleContentKind.NEWS,
          categorySlug: "misje",
        },
        now,
      ),
      true,
    );
  });

  it("excludes articles older than 48h", () => {
    const stale = new Date(now.getTime() - NEWS_SITEMAP_FRESH_MS - 1);
    assert.equal(
      matchesFreshNewsSitemapCriteria(
        {
          publishedAt: stale,
          contentKind: ArticleContentKind.NEWS,
          categorySlug: "misje",
        },
        now,
      ),
      false,
    );
  });

  it("excludes Nauka even when fresh", () => {
    assert.equal(
      matchesFreshNewsSitemapCriteria(
        {
          publishedAt: now,
          contentKind: ArticleContentKind.NEWS,
          categorySlug: "nauka",
        },
        now,
      ),
      false,
    );
  });

  it("excludes evergreen and guide", () => {
    assert.equal(
      matchesFreshNewsSitemapCriteria(
        {
          publishedAt: now,
          contentKind: ArticleContentKind.EVERGREEN,
          categorySlug: "misje",
        },
        now,
      ),
      false,
    );
    assert.equal(
      matchesFreshNewsSitemapCriteria(
        {
          publishedAt: now,
          contentKind: ArticleContentKind.GUIDE,
          categorySlug: "astronomia",
        },
        now,
      ),
      false,
    );
  });

  it("filterFreshNewsSitemapEntries applies all rules", () => {
    const fresh = new Date(now.getTime() - 60 * 60 * 1000);
    const stale = new Date(now.getTime() - NEWS_SITEMAP_FRESH_MS - 1);

    const filtered = filterFreshNewsSitemapEntries(
      [
        {
          slug: "a",
          title: "A",
          publishedAt: fresh,
          contentKind: ArticleContentKind.NEWS,
          categorySlug: "misje",
        },
        {
          slug: "b",
          title: "B",
          publishedAt: stale,
          contentKind: ArticleContentKind.NEWS,
          categorySlug: "misje",
        },
        {
          slug: "c",
          title: "C",
          publishedAt: fresh,
          contentKind: ArticleContentKind.EVERGREEN,
          categorySlug: "nauka",
        },
        {
          slug: "d",
          title: "D",
          publishedAt: fresh,
          contentKind: ArticleContentKind.ANALYSIS,
          categorySlug: "astronomia",
        },
      ],
      now,
    );

    assert.deepEqual(
      filtered.map((entry) => entry.slug),
      ["a", "d"],
    );
  });
});
