import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { OpsLaunch } from "@/lib/ops/types";
import {
  buildLaunchArticleMap,
  pickArticleForLaunch,
  pickLaunchForArticle,
  scoreLaunchArticleMatch,
  type BridgeArticle,
} from "@/lib/ops/match-launch-articles";
import { launchTagFor } from "@/lib/ops/launch-tag";

const starlinkLaunch: OpsLaunch = {
  id: "ll-starlink-10-54",
  provider: "SpaceX",
  mission: "Starlink Group 10-54",
  rocketName: "Falcon 9 Block 5",
  net: "2026-06-12T12:27:00Z",
  site: "SLC-40",
  image: "",
  hue: 200,
  statusLabel: "Go",
  phase: "countdown",
};

const nrolLaunch: OpsLaunch = {
  id: "ll-nrol-179",
  provider: "SpaceX",
  mission: "NROL-179",
  rocketName: "Falcon 9 Block 5",
  net: "2026-06-18T08:00:00Z",
  site: "Vandenberg",
  image: "",
  hue: 200,
  statusLabel: "Go",
  phase: "countdown",
};

const h3Launch: OpsLaunch = {
  id: "ll-h3-30",
  provider: "MHI (Japonia)",
  mission: "H3-30 Test Flight",
  rocketName: "H3-30",
  net: "2026-06-12T00:53:59Z",
  site: "Tanegashima",
  image: "",
  hue: 120,
  statusLabel: "Go",
  phase: "countdown",
};

const starlinkArticle: BridgeArticle = {
  id: "a1",
  slug: "spacex-starlink-10-54-start",
  title: "SpaceX: Starlink Group 10-54 startuje z Cape Canaveral",
  tags: ["spacex", "starlink"],
  categorySlug: "misje",
  publishedAt: "2026-06-10T10:00:00Z",
};

const h3Article: BridgeArticle = {
  id: "a2",
  slug: "japonia-h3-30-test",
  title: "Japonia testuje rakietę H3-30 po serii opóźnień",
  tags: ["h3", "jaxa"],
  categorySlug: "misje",
  publishedAt: "2026-06-09T08:00:00Z",
};

const genericSpacexArticle: BridgeArticle = {
  id: "a3",
  slug: "google-spacex-ai-kontrakt",
  title: "Google zapłaci SpaceX niemal miliard dolarów miesięcznie za infrastrukturę AI",
  tags: ["spacex", "google"],
  categorySlug: "technologie",
  publishedAt: "2026-06-08T08:00:00Z",
};

const nrolArticle: BridgeArticle = {
  id: "a4",
  slug: "nrol-179-start-vandenberg",
  title: "Tajny satelita NROL-179 poleci na Falconie 9 z Vandenberg",
  tags: ["nrol", "spacex"],
  categorySlug: "misje",
  publishedAt: "2026-06-17T08:00:00Z",
};

describe("scoreLaunchArticleMatch", () => {
  it("matches Starlink when batch number is in title", () => {
    assert.ok(scoreLaunchArticleMatch(starlinkLaunch, starlinkArticle) >= 8);
  });

  it("matches H3 when rocket code is in title", () => {
    assert.ok(scoreLaunchArticleMatch(h3Launch, h3Article) >= 8);
  });

  it("matches NROL when mission code is in title", () => {
    assert.ok(scoreLaunchArticleMatch(nrolLaunch, nrolArticle) >= 8);
  });

  it("rejects generic SpaceX business news for NROL launch", () => {
    assert.equal(scoreLaunchArticleMatch(nrolLaunch, genericSpacexArticle), 0);
  });

  it("rejects generic SpaceX news for Starlink launch", () => {
    assert.equal(scoreLaunchArticleMatch(starlinkLaunch, genericSpacexArticle), 0);
  });
});

describe("pickArticleForLaunch", () => {
  it("picks mission-specific article, not generic SpaceX", () => {
    const match = pickArticleForLaunch(nrolLaunch, [
      genericSpacexArticle,
      nrolArticle,
      starlinkArticle,
    ]);
    assert.equal(match?.id, "a4");
  });

  it("prefers exact launch tag over fuzzy title match", () => {
    const taggedGeneric: BridgeArticle = {
      id: "a5",
      slug: "tagged-nrol",
      title: "Krótka zapowiedź",
      tags: [launchTagFor(nrolLaunch.id)],
      categorySlug: "misje",
      publishedAt: "2026-06-01T08:00:00Z",
    };
    const match = pickArticleForLaunch(nrolLaunch, [nrolArticle, taggedGeneric]);
    assert.equal(match?.id, "a5");
  });
});

describe("buildLaunchArticleMap", () => {
  it("assigns distinct mission-specific articles", () => {
    const map = buildLaunchArticleMap(
      [starlinkLaunch, h3Launch, nrolLaunch],
      [starlinkArticle, h3Article, nrolArticle, genericSpacexArticle],
    );
    assert.equal(map.get(starlinkLaunch.id)?.id, "a1");
    assert.equal(map.get(h3Launch.id)?.id, "a2");
    assert.equal(map.get(nrolLaunch.id)?.id, "a4");
  });
});

describe("pickLaunchForArticle", () => {
  it("finds launch only when article names the mission", () => {
    const launch = pickLaunchForArticle(nrolArticle, [starlinkLaunch, nrolLaunch]);
    assert.equal(launch?.id, "ll-nrol-179");
  });

  it("returns null for generic SpaceX article", () => {
    assert.equal(
      pickLaunchForArticle(genericSpacexArticle, [starlinkLaunch, nrolLaunch]),
      null,
    );
  });
});
