import assert from "node:assert/strict";
import { describe, it } from "node:test";
import robots from "@/app/robots";
import { SEO_NOINDEX_FOLLOW } from "@/lib/seo/metadata";
import { resolvePageOgImage } from "@/lib/seo/page-og-registry";
import {
  SEO_NOINDEX_PUBLIC_PATHS,
  SEO_SITEMAP_PATHS,
} from "@/lib/seo/public-routes";
import { buildSitemapIndexLocations } from "@/lib/seo/sitemap-builders";

describe("discovery SEO smoke", () => {
  it("sitemap index lists pages, articles, and news only", () => {
    const locations = buildSitemapIndexLocations();
    assert.equal(locations.length, 3);
    assert.match(locations[2]!, /\/sitemaps\/news\.xml$/);
    for (const url of locations) {
      assert.doesNotMatch(url, /\/tag\//);
      assert.doesNotMatch(url, /\/feed/);
    }
  });

  it("SEO_SITEMAP_PATHS excludes tags, feeds, rss, and legacy kalendarz", () => {
    for (const path of SEO_SITEMAP_PATHS) {
      assert.doesNotMatch(path, /^\/tag\//);
      assert.doesNotMatch(path, /^\/feed/);
      assert.notEqual(path, "/rss");
      assert.notEqual(path, "/kalendarz");
    }
    assert.ok(SEO_SITEMAP_PATHS.includes("/starty"));
    assert.ok(SEO_SITEMAP_PATHS.includes("/aktualnosci"));
  });

  it("robots disallows tag and feed paths", () => {
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;
    const rawDisallow = rule?.disallow ?? [];
    const blocked = (Array.isArray(rawDisallow) ? rawDisallow : [rawDisallow]).filter(
      (entry): entry is string => typeof entry === "string",
    );
    assert.ok(blocked.some((entry) => entry.includes("/tag/")));
    assert.ok(blocked.some((entry) => entry.includes("/feed/")));
    assert.ok(blocked.some((entry) => entry.includes("/search")));
  });

  it("utility paths are noindex candidates", () => {
    assert.ok(SEO_NOINDEX_PUBLIC_PATHS.includes("/search"));
    assert.ok(SEO_NOINDEX_PUBLIC_PATHS.includes("/rss"));
    assert.deepEqual(SEO_NOINDEX_FOLLOW, { index: false, follow: true });
  });

  it("/starty has OG registry entry", () => {
    const og = resolvePageOgImage("/starty");
    assert.match(og.url, /^https?:\/\//);
    assert.ok(og.alt.length > 0);
  });
});
