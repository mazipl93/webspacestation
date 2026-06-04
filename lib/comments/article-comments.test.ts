import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  COMMENT_BODY_MAX,
  formatCommentError,
  normalizeCommentBody,
  rowToComment,
} from "./article-comments";

describe("normalizeCommentBody", () => {
  it("trims and accepts non-empty body", () => {
    assert.equal(normalizeCommentBody("  hello  "), "hello");
  });

  it("rejects empty", () => {
    assert.equal(normalizeCommentBody("   "), null);
  });

  it("rejects over max length", () => {
    assert.equal(normalizeCommentBody("x".repeat(COMMENT_BODY_MAX + 1)), null);
  });
});

describe("formatCommentError", () => {
  it("maps missing table to setup hint", () => {
    const msg = formatCommentError(
      "Could not find the table 'public.article_comments' in the schema cache"
    );
    assert.match(msg, /article_comments\.sql/);
  });
});

describe("rowToComment", () => {
  it("maps snake_case row to UI shape", () => {
    const c = rowToComment({
      id: "a",
      article_slug: "slug-1",
      user_id: "u1",
      author_name: "Jan",
      author_avatar_url: null,
      body: "tekst",
      created_at: "2026-06-04T12:00:00.000Z",
      edited_at: null,
    });
    assert.equal(c.articleSlug, "slug-1");
    assert.equal(c.author, "Jan");
    assert.equal(c.editedAt, undefined);
  });
});
