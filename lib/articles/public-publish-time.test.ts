import assert from "node:assert/strict";
import { test } from "node:test";
import { ArticleStatus } from "@prisma/client";
import {
  formatRelativePublishLabel,
  resolvePublicPublishTime,
} from "./public-publish-time";

test("resolvePublicPublishTime uses publishedAt when set", () => {
  const when = resolvePublicPublishTime({
    status: ArticleStatus.PUBLISHED,
    publishedAt: "2020-01-15T12:00:00.000Z",
    createdAt: "2026-06-01T12:00:00.000Z",
    updatedAt: "2026-06-04T12:00:00.000Z",
  });
  assert.equal(when.toISOString(), "2020-01-15T12:00:00.000Z");
});

test("resolvePublicPublishTime ignores updatedAt when publishedAt missing", () => {
  const when = resolvePublicPublishTime({
    status: ArticleStatus.PUBLISHED,
    publishedAt: null,
    createdAt: "2021-03-10T08:00:00.000Z",
    updatedAt: "2026-06-04T15:00:00.000Z",
  });
  assert.equal(when.toISOString(), "2021-03-10T08:00:00.000Z");
});

test("formatRelativePublishLabel is stable for fixed clock", () => {
  const d = new Date("2026-06-04T10:00:00.000Z");
  const now = new Date("2026-06-04T13:00:00.000Z").getTime();
  assert.equal(formatRelativePublishLabel(d, now), "3 godz. temu");
});
