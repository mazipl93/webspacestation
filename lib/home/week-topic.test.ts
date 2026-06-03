import assert from "node:assert/strict";
import { test } from "node:test";
import type { NewsArticle } from "@/types";
import { pickWeekTopicArticles, type WeekTopicConfig } from "./week-topic";

const BASE: NewsArticle = {
  id: "1",
  title: "A",
  excerpt: "",
  category: "misje",
  publishedAt: "2026-06-01T12:00:00.000Z",
  timeLabel: "1 d",
  image: "",
  slug: "a",
};

const CONFIG: WeekTopicConfig = {
  label: "Test",
  subtitle: "",
  tag: "starship",
  limit: 5,
  accent: "#a855f7",
};

test("pickWeekTopicArticles prefers tagged articles", () => {
  const all = [
    { ...BASE, id: "1", slug: "a", tags: ["starship"] },
    { ...BASE, id: "2", slug: "b", tags: ["starship", "spacex"] },
    { ...BASE, id: "3", slug: "c", tags: [] },
  ];
  const pick = pickWeekTopicArticles(all, new Set(), [], CONFIG);
  assert.equal(pick.fromTag, true);
  assert.equal(pick.articles.length, 2);
  assert.ok(pick.articles.every((a) => a.tags?.includes("starship")));
});

test("pickWeekTopicArticles falls back when fewer than 2 tagged", () => {
  const all = [{ ...BASE, slug: "a", tags: ["other"] }];
  const fallback = [
    { ...BASE, id: "2", slug: "fb1" },
    { ...BASE, id: "3", slug: "fb2" },
  ];
  const pick = pickWeekTopicArticles(all, new Set(), fallback, CONFIG);
  assert.equal(pick.fromTag, false);
  assert.equal(pick.articles.length, 2);
});
