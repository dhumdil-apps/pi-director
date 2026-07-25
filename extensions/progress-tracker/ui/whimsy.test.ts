import { describe, expect, it } from "vitest";
import { pickWord, wordPool } from "./whimsy.js";

describe("working words", () => {
	it("flavours the pool by phase, with a neutral pool before a plan exists", () => {
		expect(wordPool("plan")).toContain("Pondering");
		expect(wordPool("execute")).toContain("Forging");
		expect(wordPool(undefined)).toContain("Rummaging");
		// The pools must not overlap, or the badge's signal leaks away.
		expect(wordPool("plan").filter((word) => wordPool("execute").includes(word))).toEqual([]);
	});

	it("never repeats the word already showing, so every tick is a visible change", () => {
		const pool = wordPool("plan");
		for (const current of pool) {
			for (const draw of [0, 0.5, 0.999999]) {
				expect(pickWord(pool, current, () => draw)).not.toBe(current);
			}
		}
	});

	it("stays in bounds at the top of the random range", () => {
		const pool = ["a", "b", "c"];
		expect(pool).toContain(pickWord(pool, undefined, () => 1));
	});

	it("repeats rather than blanking when the pool holds a single word", () => {
		expect(pickWord(["Solo"], "Solo", () => 0)).toBe("Solo");
	});
});
