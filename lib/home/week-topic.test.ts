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
  limit: 5,
  accent: "#a855f7",
};

test("pickWeekTopicArticles returns only weekTopic flag", () => {
  const all = [
    { ...BASE, id: "1", slug: "a", weekTopic: true },
    { ...BASE, id: "2", slug: "b", weekTopic: true },
    { ...BASE, id: "3", slug: "c", weekTopic: false },
  ];
  const pick = pickWeekTopicArticles(all, new Set(["hero"]), CONFIG);
  assert.equal(pick.articles.length, 2);
  assert.ok(pick.articles.every((a) => a.weekTopic));
});

test("pickWeekTopicArticles empty when none flagged", () => {
  const pick = pickWeekTopicArticles([{ ...BASE, weekTopic: false }], new Set(), CONFIG);
  assert.equal(pick.articles.length, 0);
});
