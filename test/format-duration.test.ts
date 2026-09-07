import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatDuration } from "../extensions/progress-tracker/ui/activity-indicator.ts";

describe("formatDuration", () => {
  it("formats seconds, minutes, and hours", () => {
    assert.equal(formatDuration(0), "0s");
    assert.equal(formatDuration(5_000), "5s");
    assert.equal(formatDuration(83_000), "1m 23s");
    assert.equal(formatDuration(3_840_000), "1h 04m");
  });
});
