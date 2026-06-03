import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  combineDateIso,
  combineTime24,
  datetimeLocalToIso,
  formatScheduleLabel,
  parseDatetimeLocal,
  SCHEDULE_MIN_LEAD_MS,
  splitTime24,
  toDatetimeLocalValue,
  validateScheduleLocal,
} from "@/lib/admin/schedule-datetime";
import { validateScheduleTime } from "@/lib/articles/workflow";

describe("schedule-datetime (local TZ)", () => {
  it("combineDateIso builds June 3 not March 6", () => {
    assert.equal(combineDateIso("2026", "06", "03"), "2026-06-03");
    assert.equal(combineDateIso("2026", "03", "06"), "2026-03-06");
    const june = parseDatetimeLocal("2026-06-03T22:05");
    assert.ok(june);
    assert.match(formatScheduleLabel(june!), /czerwiec/);
  });

  it("combineTime24 / splitTime24 round-trip", () => {
    assert.equal(combineTime24("22", "05"), "22:05");
    assert.deepEqual(splitTime24("22:05"), { hour: "22", minute: "05" });
  });

  it("parseDatetimeLocal treats value as local civil time", () => {
    const d = parseDatetimeLocal("2026-06-03T22:00");
    assert.ok(d);
    assert.equal(d.getHours(), 22);
    assert.equal(d.getMinutes(), 0);
  });

  it("datetimeLocalToIso round-trips through toDatetimeLocalValue", () => {
    const local = "2026-06-03T22:15";
    const iso = datetimeLocalToIso(local);
    assert.ok(iso);
    assert.equal(toDatetimeLocalValue(iso), local);
  });

  it("validateScheduleLocal accepts time ~2 minutes ahead", () => {
    const now = new Date("2026-06-03T21:59:00");
    const local = toDatetimeLocalValue(
      new Date(now.getTime() + 120_000).toISOString()
    );
    const result = validateScheduleLocal(local, now);
    assert.equal(result.ok, true);
  });

  it("validateScheduleLocal rejects time in the past", () => {
    const now = new Date("2026-06-03T21:59:00");
    const result = validateScheduleLocal("2026-06-03T10:00", now);
    assert.equal(result.ok, false);
  });

  it("validateScheduleTime uses same minimum lead on server", () => {
    const now = new Date("2026-06-03T21:59:00");
    const almostNow = new Date(now.getTime() + SCHEDULE_MIN_LEAD_MS - 1000);
    const ok = new Date(now.getTime() + SCHEDULE_MIN_LEAD_MS + 5000);
    assert.equal(validateScheduleTime(almostNow, now).ok, false);
    assert.equal(validateScheduleTime(ok, now).ok, true);
  });
});
