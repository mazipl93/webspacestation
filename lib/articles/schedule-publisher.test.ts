import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { ArticleStatus } from "@prisma/client";
import {
  evaluateScheduledPublish,
  filterDueScheduledArticles,
  summarizeSchedulePublishRun,
} from "@/lib/articles/schedule-publisher";
import {
  isScheduledPublishDue,
  validateScheduleTime,
} from "@/lib/articles/workflow";

const NOW = new Date("2026-06-03T12:00:00.000Z");

function row(
  id: string,
  overrides: Partial<{
    title: string;
    content: string | null;
    excerpt: string | null;
    categoryId: string;
    publishAt: Date | null;
    status: ArticleStatus;
  }> = {}
) {
  return {
    id,
    slug: id,
    title: "Title",
    content: "Body",
    categoryId: "cat",
    status: ArticleStatus.SCHEDULED,
    publishAt: new Date("2026-06-03T11:00:00.000Z"),
    publishedAt: null,
    ...overrides,
  };
}

describe("validateScheduleTime (PR10)", () => {
  it("requires future publishAt", () => {
    assert.equal(
      validateScheduleTime(new Date("2026-06-03T11:00:00.000Z"), NOW).ok,
      false
    );
    assert.equal(
      validateScheduleTime(new Date("2026-06-03T13:00:00.000Z"), NOW).ok,
      true
    );
  });
});

describe("isScheduledPublishDue (PR10)", () => {
  it("matches SCHEDULED with publishAt <= now", () => {
    assert.equal(
      isScheduledPublishDue(
        {
          status: ArticleStatus.SCHEDULED,
          publishAt: new Date("2026-06-03T11:00:00.000Z"),
        },
        NOW
      ),
      true
    );
    assert.equal(
      isScheduledPublishDue(
        {
          status: ArticleStatus.SCHEDULED,
          publishAt: new Date("2026-06-03T13:00:00.000Z"),
        },
        NOW
      ),
      false
    );
  });
});

describe("schedule publisher (PR10)", () => {
  it("filterDueScheduledArticles returns only due rows", () => {
    const due = filterDueScheduledArticles(
      [
        row("due"),
        row("future", {
          publishAt: new Date("2026-06-03T13:00:00.000Z"),
        }),
        row("review", { status: ArticleStatus.REVIEW }),
      ],
      NOW
    );
    assert.equal(due.length, 1);
    assert.equal(due[0]?.id, "due");
  });

  it("evaluateScheduledPublish skips invalid content without throwing", () => {
    const result = evaluateScheduledPublish(
      row("bad", { title: "", content: "x", categoryId: "cat" })
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.reason, /Tytuł/);
    }
  });

  it("evaluateScheduledPublish approves valid due article", () => {
    const result = evaluateScheduledPublish(row("ok"));
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.slug, "ok");
  });

  it("evaluateScheduledPublish approves legacy RSS with excerpt only (SAFE MODE)", () => {
    const result = evaluateScheduledPublish(
      row("legacy", { content: null, excerpt: "Lead z RSS przed B+" })
    );
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.slug, "legacy");
  });

  it("summarizeSchedulePublishRun counts published vs skipped", () => {
    const summary = summarizeSchedulePublishRun([
      { id: "a", slug: "a", ok: true },
      { id: "b", ok: false, reason: "skip" },
    ]);
    assert.equal(summary.due, 2);
    assert.equal(summary.published, 1);
    assert.equal(summary.skipped, 1);
  });
});

describe("publish-scheduled cron (P0-SCHED)", () => {
  it("vercel.json runs publish-scheduled every minute", () => {
    const vercel = readFileSync(join(process.cwd(), "vercel.json"), "utf8");
    const config = JSON.parse(vercel) as {
      crons?: Array<{ path: string; schedule: string }>;
    };
    const job = config.crons?.find((c) => c.path === "/api/cron/publish-scheduled");
    assert.equal(job?.schedule, "* * * * *");
  });
});

describe("RSS / AI never auto-publish (PR10 contract)", () => {
  it("ingest and process-drafts still avoid PUBLISHED", () => {
    const ingest = readFileSync(join(process.cwd(), "lib/rss/ingest.ts"), "utf8");
    const processSrc = readFileSync(
      join(process.cwd(), "lib/rss/process-drafts.ts"),
      "utf8"
    );
    assert.doesNotMatch(ingest, /status:\s*ArticleStatus\.PUBLISHED/);
    assert.doesNotMatch(processSrc, /ArticleStatus\.PUBLISHED/);
  });
});
