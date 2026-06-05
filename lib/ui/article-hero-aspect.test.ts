import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeHeroFrameSize,
  HERO_FRAME_DEFAULT_ASPECT,
} from "@/lib/ui/article-hero-aspect";

describe("computeHeroFrameSize", () => {
  it("uses full width for 16:9 when height fits within max", () => {
    const { width, height } = computeHeroFrameSize(800, 16 / 9, 580);
    assert.equal(width, 800);
    assert.equal(height, 450);
  });

  it("caps height and narrows width for wide 16:9 on large containers", () => {
    const { width, height } = computeHeroFrameSize(1200, 16 / 9, 580);
    assert.equal(height, 580);
    assert.ok(Math.abs(width - 580 * (16 / 9)) < 1);
  });

  it("caps height and narrows width for tall square images", () => {
    const { width, height } = computeHeroFrameSize(1200, 1, 580);
    assert.equal(width, 580);
    assert.equal(height, 580);
  });

  it("fits wide chart aspect at full width when short enough", () => {
    const { width, height } = computeHeroFrameSize(1000, 2, 580);
    assert.equal(width, 1000);
    assert.equal(height, 500);
  });

  it("falls back to 16:9 when aspect invalid", () => {
    const { width, height } = computeHeroFrameSize(1280, 0, 580);
    assert.equal(width, 1280);
    assert.equal(height, 580);
  });
});
