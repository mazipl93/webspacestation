import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  filterLaunchesForBriefGeneration,
  launchNeedsBrief,
  mergeLaunchBriefsFromPrevious,
} from "@/lib/ops/launch-brief-merge";
import type { OpsLaunch } from "@/lib/ops/types";

const baseLaunch = (overrides: Partial<OpsLaunch>): OpsLaunch => ({
  id: "1",
  provider: "SpaceX",
  mission: "Starlink Group 1-1",
  net: "2026-06-20T12:00:00Z",
  site: "Pad",
  image: "",
  hue: 1,
  statusLabel: "Go",
  phase: "countdown",
  ...overrides,
});

describe("launchNeedsBrief", () => {
  it("needs brief when missing", () => {
    assert.equal(launchNeedsBrief(baseLaunch({})), true);
  });

  it("skips when NET unchanged", () => {
    const launch = baseLaunch({
      brief: {
        text: "Test brief long enough to pass validation rules in generator.",
        basedOnNet: "2026-06-20T12:00:00Z",
        generatedAt: "2026-06-11T00:00:00Z",
      },
    });
    assert.equal(launchNeedsBrief(launch), false);
  });
});

describe("mergeLaunchBriefsFromPrevious", () => {
  it("carries brief forward when NET matches", () => {
    const brief = {
      text: "Cached brief for unchanged NET on this launch card.",
      basedOnNet: "2026-06-20T12:00:00Z",
      generatedAt: "2026-06-11T00:00:00Z",
    };
    const previous = [baseLaunch({ id: "a", brief })];
    const current = [baseLaunch({ id: "a" })];
    const merged = mergeLaunchBriefsFromPrevious(current, previous);
    assert.equal(merged[0]?.brief?.text, brief.text);
  });
});

describe("filterLaunchesForBriefGeneration", () => {
  it("limits and skips launches with valid brief", () => {
    const now = Date.parse("2026-06-11T12:00:00Z");
    const launches = [
      baseLaunch({
        id: "a",
        net: "2026-06-12T12:00:00Z",
        brief: {
          text: "Already generated brief stored in ops cache snapshot.",
          basedOnNet: "2026-06-12T12:00:00Z",
          generatedAt: "2026-06-11T00:00:00Z",
        },
      }),
      baseLaunch({ id: "b", net: "2026-06-13T12:00:00Z" }),
      baseLaunch({ id: "c", net: "2026-07-20T12:00:00Z" }),
    ];
    const pending = filterLaunchesForBriefGeneration(launches, 8, 21, now);
    assert.deepEqual(pending.map((l) => l.id), ["b"]);
  });
});
