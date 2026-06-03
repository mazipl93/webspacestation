import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_SIDEBAR_COLLAPSED_KEY,
  parseSidebarCollapsed,
} from "@/lib/ui/admin-sidebar-storage";

describe("admin sidebar storage (PR12)", () => {
  it("uses the required localStorage key", () => {
    assert.equal(ADMIN_SIDEBAR_COLLAPSED_KEY, "admin-sidebar-collapsed");
  });

  it("parseSidebarCollapsed reads only explicit true", () => {
    assert.equal(parseSidebarCollapsed("true"), true);
    assert.equal(parseSidebarCollapsed("false"), false);
    assert.equal(parseSidebarCollapsed(null), false);
    assert.equal(parseSidebarCollapsed(""), false);
  });
});
