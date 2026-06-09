import assert from "node:assert/strict";
import { test } from "node:test";
import type { NewsArticle } from "@/types";
import {
  buildHomepageWeekTopicSlides,
  pickWeekTopicArticles,
  type WeekTopicConfig,
} from "./week-topic";

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
  limit: 5,
  accent: "#a855f7",
};

test("buildHomepageWeekTopicSlides uses CMS slot order", () => {
  const cms = [
    { ...BASE, id: "2", slug: "b", weekTopicPosition: 2 },
    { ...BASE, id: "1", slug: "a", weekTopicPosition: 1 },
  ];
  const pick = buildHomepageWeekTopicSlides(cms, [], 4);
  assert.deepEqual(
    pick.articles.map((a) => a.slug),
    ["a", "b"]
  );
});

test("buildHomepageWeekTopicSlides legacy weekTopic when no slots", () => {
  const legacy = [
    { ...BASE, id: "1", slug: "old", weekTopic: true, publishedAt: "2026-06-01T12:00:00.000Z" },
    { ...BASE, id: "2", slug: "new", weekTopic: true, publishedAt: "2026-06-09T12:00:00.000Z" },
  ];
  const pick = buildHomepageWeekTopicSlides([], legacy, 4);
  assert.equal(pick.articles[0]?.slug, "new");
});

test("buildHomepageWeekTopicSlides keeps hero slug in section", () => {
  const cms = [
    { ...BASE, id: "1", slug: "hero", weekTopicPosition: 1 },
  ];
  const pick = buildHomepageWeekTopicSlides(cms, [], 4);
  assert.equal(pick.articles[0]?.slug, "hero");
});

test("pickWeekTopicArticles reads weekTopicPosition slots", () => {
  const all = [
    { ...BASE, id: "1", slug: "a", weekTopicPosition: 1 },
    { ...BASE, id: "2", slug: "b", weekTopicPosition: 2 },
    { ...BASE, id: "3", slug: "c", weekTopicPosition: 0 },
  ];
  const pick = pickWeekTopicArticles(all, new Set(["hero"]), CONFIG);
  assert.equal(pick.articles.length, 2);
});
