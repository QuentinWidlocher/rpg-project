import { expect, test } from "vitest";
import { mean } from "lodash-es";
import { d10, d12, d20, d4, d6, d8, parseDice, skillModifier } from "./dice";

test.each([
	{ fn: d20, name: "d20" },
	{ fn: d12, name: "d12" },
	{ fn: d10, name: "d10" },
	{ fn: d8, name: "d8" },
	{ fn: d6, name: "d6" },
	{ fn: d4, name: "d4" },
])("$name(1) returns a number, $name(n > 1) returns an array", ({ fn: d }) => {
	const d1 = d(1);
	const dN = d(2);

	expect(typeof d1).toBe("number");
	expect(Array.isArray(dN)).toBe(true);
});

test.each([
	{ avg: 10.5, fn: d20, name: "d20" },
	{ avg: 6.5, fn: d12, name: "d12" },
	{ avg: 5.5, fn: d10, name: "d10" },
	{ avg: 4.5, fn: d8, name: "d8" },
	{ avg: 3.5, fn: d6, name: "d6" },
	{ avg: 2.5, fn: d4, name: "d4" },
])("$name() average is $avg", ({ fn: d, avg }) => {
	let rolls = [];

	for (let i = 0; i < 1_000_000; i++) {
		rolls.push(d(1));
	}

	expect(mean(rolls).toFixed(1)).toBe(avg.toFixed(1));
});

test.each([
	[0, 1, -5],
	[2, 3, -4],
	[4, 5, -3],
	[6, 7, -2],
	[8, 9, -1],
	[10, 11, 0],
	[12, 13, 1],
	[14, 15, 2],
	[16, 17, 3],
	[18, 19, 4],
	[20, 21, 5],
])("Skill modifier (%i and %i gives %i)", (a, b, expected) => {
	expect(skillModifier(a)).toBe(expected);
	expect(skillModifier(b)).toBe(expected);
});

test("parse", () => {
	expect(parseDice("1d6")).toStrictEqual({ amount: 1, sides: 6 });
	expect(parseDice("12d34")).toStrictEqual({ amount: 12, sides: 34 });
});
