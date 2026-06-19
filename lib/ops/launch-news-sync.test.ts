import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { OpsLaunch } from "@/lib/ops/types";
import {
  filterLaunchNewsCandidates,
  LAUNCH_NEWS_CANDIDATE_WINDOW_MS,
} from "@/lib/ops/launch-news-candidates";

const base: OpsLaunch = {
  id: "ll-test",
  provider: "SpaceX",
  mission: "Starlink Group 1-1",
  net: "",
  site: "Pad",
  image: "",
  hue: 200,
  statusLabel: "Go",
  phase: "countdown",
};

describe("filterLaunchNewsCandidates", () => {
  const now = Date.parse("2026-06-10T12:00:00Z");

  it("includes upcoming launch within 7 days", () => {
    const launch: OpsLaunch = {
      ...base,
      net: new Date(now + 2 * 86_400_000).toISOString(),
    };
    const out = filterLaunchNewsCandidates([launch], now);
    assert.equal(out.length, 1);
  });

  it("excludes launch beyond window", () => {
    const launch: OpsLaunch = {
      ...base,
      net: new Date(now + LAUNCH_NEWS_CANDIDATE_WINDOW_MS + 86_400_000).toISOString(),
    };
    assert.equal(filterLaunchNewsCandidates([launch], now).length, 0);
  });

  it("excludes completed launches", () => {
    const launch: OpsLaunch = {
      ...base,
      net: new Date(now - 86_400_000).toISOString(),
      phase: "success",
    };
    assert.equal(filterLaunchNewsCandidates([launch], now).length, 0);
  });
});
