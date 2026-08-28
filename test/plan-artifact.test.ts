import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readPlanDigest } from "../extensions/agent-workflow/plan-digest.ts";

describe("readPlanDigest", () => {
  it("reads Current / Desired until the next heading", () => {
    const contents = `## Digest\n\n- Current: spinner is blank\n- Desired: Show plan digest\n\n## Goal\n\nLong goal and transcripts.\n`;
    assert.equal(readPlanDigest(contents), "- Current: spinner is blank\n- Desired: Show plan digest");
  });

  it("omits missing, empty, and comment-only Digest", () => {
    assert.equal(readPlanDigest("## Goal\n"), undefined);
    assert.equal(readPlanDigest("## Digest\n\n## Goal\n"), undefined);
    assert.equal(readPlanDigest(`## Digest\n\n<!-- skip -->\n\n## Goal\n`), undefined);
  });

  it("does not include later sections", () => {
    const contents = `## Digest\n\n- Current: a\n- Desired: b\n\n## User transcript\n\nHuge dump.\n`;
    assert.equal(readPlanDigest(contents), "- Current: a\n- Desired: b");
  });
});
