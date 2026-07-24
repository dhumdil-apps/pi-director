import { Value } from "@sinclair/typebox/value";
import { describe, expect, it } from "vitest";
import { ManageTodoListParams } from "./tool.js";

describe("manage_todo_list schema", () => {
  it.each(["read", "write"] as const)("accepts the %s operation", (operation) => {
    expect(Value.Check(ManageTodoListParams, { operation })).toBe(true);
  });

  it("rejects the removed phase operation", () => {
    expect(Value.Check(ManageTodoListParams, { operation: "phase", phase: "planning" })).toBe(false);
  });
});
