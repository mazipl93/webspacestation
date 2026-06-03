import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ArticleContentOrigin } from "@prisma/client";
import { isRssContentOrigin } from "@/lib/admin/rss-display";

describe("contentOrigin rules (PR3 — RSS pipeline alignment)", () => {
  it("CMS RSS panel: only contentOrigin RSS (not source/url heuristics)", () => {
    assert.equal(
      isRssContentOrigin({ contentOrigin: ArticleContentOrigin.RSS }),
      true
    );
    assert.equal(
      isRssContentOrigin({
        contentOrigin: ArticleContentOrigin.EDITORIAL,
        source: "SpaceNews",
        originalUrl: "https://spacenews.com/example",
      } as { contentOrigin: ArticleContentOrigin; source: string; originalUrl: string }),
      false
    );
    assert.equal(isRssContentOrigin({ contentOrigin: undefined }), false);
  });

  it("manual create path sets EDITORIAL (constant contract)", () => {
    assert.equal(ArticleContentOrigin.EDITORIAL, "EDITORIAL");
  });

  it("RSS ingest path sets RSS (constant contract)", () => {
    assert.equal(ArticleContentOrigin.RSS, "RSS");
  });
});
