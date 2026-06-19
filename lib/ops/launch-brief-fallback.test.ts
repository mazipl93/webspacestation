import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { OpsLaunch } from "@/lib/ops/types";
import {
  buildFallbackLaunchBriefText,
  resolveLaunchBrief,
} from "@/lib/ops/launch-brief-fallback";

const base: OpsLaunch = {
  id: "x",
  provider: "SpaceX",
  mission: "Test",
  net: "2026-06-20T12:00:00Z",
  site: "SLC-40",
  image: "",
  hue: 200,
  statusLabel: "Go",
  phase: "countdown",
};

describe("launch-brief-fallback", () => {
  it("builds Starlink fallback", () => {
    const text = buildFallbackLaunchBriefText({
      ...base,
      mission: "Starlink Group 17-28",
    });
    assert.match(text, /Starlink/i);
    assert.match(text, /17-28/);
  });

  it("prefers stored AI brief when present", () => {
    const ai = {
      text: "Opis z OpenAI wystarczająco długi by był ważny dla testu jednostkowego.",
      basedOnNet: base.net,
      generatedAt: "2026-06-01T00:00:00Z",
    };
    const resolved = resolveLaunchBrief({ ...base, brief: ai });
    assert.equal(resolved.text, ai.text);
  });
});
