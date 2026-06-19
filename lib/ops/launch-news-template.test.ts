import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { OpsLaunch } from "@/lib/ops/types";
import {
  buildLaunchNewsDraftFields,
  extractLaunchSyncFingerprint,
  launchNewsSyncFingerprint,
} from "@/lib/ops/launch-news-template";
import { launchTagFor } from "@/lib/ops/launch-tag";

const sample: OpsLaunch = {
  id: "ll-nrol-179",
  provider: "SpaceX",
  mission: "NROL-179",
  rocketName: "Falcon 9 Block 5",
  net: "2026-06-18T08:00:00Z",
  site: "Vandenberg SLC-4E",
  image: "https://example.com/pad.jpg",
  hue: 200,
  statusLabel: "Go for Launch",
  phase: "countdown",
  windowLabel: "NET 18 cze 2026, 08:00 UTC",
  detailUrl: "https://ll.thespacedevs.com/2.3.0/launches/abc/",
};

describe("launch-news-template", () => {
  it("includes launch tag and LL2 source", () => {
    const draft = buildLaunchNewsDraftFields(sample);
    assert.ok(draft.tags.includes(launchTagFor(sample.id)));
    assert.equal(draft.source, "Launch Library 2 (The Space Devs)");
    assert.match(draft.content, /Co wiemy/);
    assert.match(draft.content, /Czego nie ustalamy/);
    assert.match(draft.title, /NROL-179/);
  });

  it("stores sync fingerprint in HTML comment", () => {
    const draft = buildLaunchNewsDraftFields(sample);
    const fp = extractLaunchSyncFingerprint(draft.content);
    assert.equal(fp, launchNewsSyncFingerprint(sample));
  });
});
