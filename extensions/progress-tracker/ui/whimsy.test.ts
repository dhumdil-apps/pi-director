import { describe, expect, it } from "vitest";
import { pickWord, wordPool } from "./whimsy.js";

describe("working words", () => {
	it("flavours both modes, with the legacy missing phase treated as explore", () => {
		const pools = [wordPool("explore"), wordPool("execute")];
		expect(pools.every((pool) => pool.length > 0)).toBe(true);
		expect(wordPool(undefined)).toBe(wordPool("explore"));
		// The pools must not overlap, or the badge's signal leaks away.
		for (const [index, pool] of pools.entries()) {
			for (const other of pools.slice(index + 1)) {
				expect(pool.filter((word) => other.includes(word))).toEqual([]);
			}
		}
	});

	it("never repeats the word already showing, so every tick is a visible change", () => {
		const pool = wordPool("explore");
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
