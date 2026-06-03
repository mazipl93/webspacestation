import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { ArticleStatus } from "@prisma/client";
import {
  publishedAtPatchForStatusTransition,
  resolveCreateStatus,
  validatePublishReady,
  validateScheduleTime,
  WORKFLOW_STATUSES,
} from "@/lib/articles/workflow";

describe("article workflow (status-only lifecycle)", () => {
  it("resolveCreateStatus → DRAFT when omitted", () => {
    assert.equal(resolveCreateStatus(undefined), ArticleStatus.DRAFT);
  });

  it("resolveCreateStatus respects explicit non-default status", () => {
    assert.equal(resolveCreateStatus(ArticleStatus.REVIEW), ArticleStatus.REVIEW);
    assert.equal(
      resolveCreateStatus(ArticleStatus.SCHEDULED),
      ArticleStatus.SCHEDULED
    );
  });

  it("validatePublishReady requires title, content, categoryId", () => {
    assert.equal(
      validatePublishReady({
        title: "",
        content: "body",
        categoryId: "cat",
      }).ok,
      false
    );
    assert.equal(
      validatePublishReady({
        title: "T",
        content: "",
        categoryId: "cat",
      }).ok,
      false
    );
    assert.equal(
      validatePublishReady({
        title: "T",
        content: "body",
        categoryId: "",
      }).ok,
      false
    );
    assert.equal(
      validatePublishReady({
        title: "T",
        content: "body",
        categoryId: "cat",
      }).ok,
      true
    );
  });

  it("publishedAtPatchForStatusTransition only on explicit PUBLISHED transition", () => {
    const draft = {
      status: ArticleStatus.DRAFT,
      publishedAt: null as Date | null,
    };
    assert.deepEqual(
      publishedAtPatchForStatusTransition(ArticleStatus.REVIEW, draft),
      {}
    );

    const toPublished = publishedAtPatchForStatusTransition(
      ArticleStatus.PUBLISHED,
      draft
    );
    assert.ok(toPublished.publishedAt instanceof Date);

    const fromPublished = publishedAtPatchForStatusTransition(
      ArticleStatus.DRAFT,
      { status: ArticleStatus.PUBLISHED, publishedAt: new Date() }
    );
    assert.equal(fromPublished.publishedAt, null);
  });

  it("SCHEDULED does not stamp publishedAt", () => {
    assert.deepEqual(
      publishedAtPatchForStatusTransition(ArticleStatus.SCHEDULED, {
        status: ArticleStatus.REVIEW,
        publishedAt: null,
      }),
      {}
    );
  });

  it("validateScheduleTime rejects past publishAt", () => {
    const now = new Date("2026-06-03T12:00:00.000Z");
    assert.equal(
      validateScheduleTime(new Date("2026-06-03T10:00:00.000Z"), now).ok,
      false
    );
    assert.equal(
      validateScheduleTime(new Date("2026-06-03T14:00:00.000Z"), now).ok,
      true
    );
  });

  it("WORKFLOW_STATUSES lists editorial filters", () => {
    assert.deepEqual(WORKFLOW_STATUSES, [
      ArticleStatus.DRAFT,
      ArticleStatus.REVIEW,
      ArticleStatus.PUBLISHED,
      ArticleStatus.SCHEDULED,
    ]);
  });
});

describe("RSS / AI pipeline status contracts (read-only)", () => {
  const root = join(process.cwd(), "lib", "rss");

  it("RSS ingest creates DRAFT — never PUBLISHED", () => {
    const src = readFileSync(join(root, "ingest.ts"), "utf8");
    assert.match(src, /status:\s*ArticleStatus\.DRAFT/);
    assert.doesNotMatch(src, /status:\s*ArticleStatus\.PUBLISHED/);
  });

  it("AI process-drafts sets REVIEW explicitly (pipeline step, not content heuristic)", () => {
    const src = readFileSync(join(root, "process-drafts.ts"), "utf8");
    assert.match(src, /status:\s*ArticleStatus\.REVIEW/);
    assert.doesNotMatch(src, /ArticleStatus\.PUBLISHED/);
  });

  it("updateArticle does not apply status (workflow transitions only)", () => {
    const src = readFileSync(
      join(process.cwd(), "lib", "server", "articles.ts"),
      "utf8"
    );
    assert.match(src, /buildPrismaContentUpdateInput/);
    assert.match(src, /transitionArticleStatus/);
    assert.doesNotMatch(src, /source.*status|originalUrl.*status/i);
  });
});
