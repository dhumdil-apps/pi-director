import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dispatchSettlement, pwbRouteTaskSummary } from "../extensions/agent-workflow/settlement.ts";

describe("settlement dispatch", () => {
  it("routes ask PWB before any picker", () => {
    assert.deepEqual(
      dispatchSettlement({
        mode: "align",
        ask: { outcome: "routed", target: "spec" },
        nextQueued: true,
        nextSkip: false,
      }),
      { action: "route", target: "spec" },
    );
  });

  it("keeps ask cancel as skip_picker even when next was queued", () => {
    assert.deepEqual(
      dispatchSettlement({
        mode: "align",
        ask: { outcome: "cancelled" },
        nextQueued: true,
        nextSkip: false,
      }),
      { action: "skip_picker" },
    );
  });

  it("opens the picker when next is queued", () => {
    assert.deepEqual(dispatchSettlement({ mode: "spec", nextQueued: true, nextSkip: false }), {
      action: "open_picker",
    });
  });

  it("keeps explicit empty next as none in every mode", () => {
    assert.deepEqual(dispatchSettlement({ mode: "align", nextQueued: false, nextSkip: true }), {
      action: "none",
    });
    assert.deepEqual(dispatchSettlement({ mode: "vibe", nextQueued: false, nextSkip: true }), {
      action: "none",
    });
  });

  it("opens the picker on Align when ask and next are both absent", () => {
    assert.deepEqual(dispatchSettlement({ mode: "align", nextQueued: false, nextSkip: false }), {
      action: "open_picker",
    });
  });

  it("leaves Spec and Vibe silent when ask and next are both absent", () => {
    assert.deepEqual(dispatchSettlement({ mode: "spec", nextQueued: false, nextSkip: false }), {
      action: "none",
    });
    assert.deepEqual(dispatchSettlement({ mode: "vibe", nextQueued: false, nextSkip: false }), {
      action: "none",
    });
  });

  it("opens the Align picker after an answered ask with no next", () => {
    assert.deepEqual(
      dispatchSettlement({
        mode: "align",
        ask: { outcome: "answered" },
        nextQueued: false,
        nextSkip: false,
      }),
      { action: "open_picker" },
    );
  });

  it("does not let an answered ask suppress a queued next", () => {
    assert.deepEqual(
      dispatchSettlement({
        mode: "align",
        ask: { outcome: "answered" },
        nextQueued: true,
        nextSkip: false,
      }),
      { action: "open_picker" },
    );
  });
});

describe("pwb route task summary", () => {
  it("joins answer labels for a scope-informed start name", () => {
    assert.equal(
      pwbRouteTaskSummary([
        { label: "diagnose and fix", value: "diagnose-and-fix" },
        { label: "add full", value: "add-full" },
      ]),
      "diagnose and fix add full",
    );
  });

  it("falls back when answers are empty", () => {
    assert.equal(pwbRouteTaskSummary([]), "proceed with best");
    assert.equal(pwbRouteTaskSummary(undefined), "proceed with best");
    assert.equal(pwbRouteTaskSummary([{ value: "  scoped  " }]), "scoped");
  });
});
