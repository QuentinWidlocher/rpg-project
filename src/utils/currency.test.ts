import { describe, expect, test } from "bun:test";
import { cc, formatCc, gc, sc } from "./currency";

type TestProps = {
	cc: Parameters<typeof formatCc>[0];
	options: Parameters<typeof formatCc>[1];
	result: ReturnType<typeof formatCc>;
};

const shortNotExhaustive = [
	{ cc: cc(1), options: { exhaustive: false, style: "short" }, result: "1 cc" },
	{ cc: cc(6), options: { exhaustive: false, style: "short" }, result: "6 cc" },
	{ cc: cc(10), options: { exhaustive: false, style: "short" }, result: "1 sc" },
	{ cc: cc(23), options: { exhaustive: false, style: "short" }, result: "2 sc" },
	{ cc: cc(100), options: { exhaustive: false, style: "short" }, result: "1 gc" },
	{ cc: cc(413), options: { exhaustive: false, style: "short" }, result: "4 gc" },

	{ cc: sc(1), options: { exhaustive: false, style: "short" }, result: "1 sc" },
	{ cc: sc(6), options: { exhaustive: false, style: "short" }, result: "6 sc" },
	{ cc: sc(10), options: { exhaustive: false, style: "short" }, result: "1 gc" },
	{ cc: sc(23), options: { exhaustive: false, style: "short" }, result: "2 gc" },
	{ cc: sc(100), options: { exhaustive: false, style: "short" }, result: "10 gc" },
	{ cc: sc(413), options: { exhaustive: false, style: "short" }, result: "41 gc" },

	{ cc: gc(1), options: { exhaustive: false, style: "short" }, result: "1 gc" },
	{ cc: gc(6), options: { exhaustive: false, style: "short" }, result: "6 gc" },
	{ cc: gc(10), options: { exhaustive: false, style: "short" }, result: "10 gc" },
	{ cc: gc(23), options: { exhaustive: false, style: "short" }, result: "23 gc" },
	{ cc: gc(100), options: { exhaustive: false, style: "short" }, result: "100 gc" },
	{ cc: gc(413), options: { exhaustive: false, style: "short" }, result: "413 gc" },
] satisfies TestProps[];

const longNotExhaustive = [
	{ cc: cc(1), options: { exhaustive: false, style: "long" }, result: "1 copper coin" },
	{ cc: cc(6), options: { exhaustive: false, style: "long" }, result: "6 copper coins" },
	{ cc: cc(10), options: { exhaustive: false, style: "long" }, result: "1 silver coin" },
	{ cc: cc(23), options: { exhaustive: false, style: "long" }, result: "2 silver coins" },
	{ cc: cc(100), options: { exhaustive: false, style: "long" }, result: "1 gold coin" },
	{ cc: cc(413), options: { exhaustive: false, style: "long" }, result: "4 gold coins" },

	{ cc: sc(1), options: { exhaustive: false, style: "long" }, result: "1 silver coin" },
	{ cc: sc(6), options: { exhaustive: false, style: "long" }, result: "6 silver coins" },
	{ cc: sc(10), options: { exhaustive: false, style: "long" }, result: "1 gold coin" },
	{ cc: sc(23), options: { exhaustive: false, style: "long" }, result: "2 gold coins" },
	{ cc: sc(100), options: { exhaustive: false, style: "long" }, result: "10 gold coins" },
	{ cc: sc(413), options: { exhaustive: false, style: "long" }, result: "41 gold coins" },

	{ cc: gc(1), options: { exhaustive: false, style: "long" }, result: "1 gold coin" },
	{ cc: gc(6), options: { exhaustive: false, style: "long" }, result: "6 gold coins" },
	{ cc: gc(10), options: { exhaustive: false, style: "long" }, result: "10 gold coins" },
	{ cc: gc(23), options: { exhaustive: false, style: "long" }, result: "23 gold coins" },
	{ cc: gc(100), options: { exhaustive: false, style: "long" }, result: "100 gold coins" },
	{ cc: gc(413), options: { exhaustive: false, style: "long" }, result: "413 gold coins" },
] satisfies TestProps[];

const shortExhaustive = [
	{ cc: cc(1), options: { exhaustive: true, style: "short" }, result: "1 cc" },
	{ cc: cc(6), options: { exhaustive: true, style: "short" }, result: "6 cc" },
	{ cc: cc(10), options: { exhaustive: true, style: "short" }, result: "1 sc" },
	{ cc: cc(23), options: { exhaustive: true, style: "short" }, result: "2 sc, 3 cc" },
	{ cc: cc(100), options: { exhaustive: true, style: "short" }, result: "1 gc" },
	{ cc: cc(413), options: { exhaustive: true, style: "short" }, result: "4 gc, 1 sc, 3 cc" },

	{ cc: sc(1), options: { exhaustive: true, style: "short" }, result: "1 sc" },
	{ cc: sc(6), options: { exhaustive: true, style: "short" }, result: "6 sc" },
	{ cc: sc(10), options: { exhaustive: true, style: "short" }, result: "1 gc" },
	{ cc: sc(23), options: { exhaustive: true, style: "short" }, result: "2 gc, 3 sc" },
	{ cc: sc(100), options: { exhaustive: true, style: "short" }, result: "10 gc" },
	{ cc: sc(413), options: { exhaustive: true, style: "short" }, result: "41 gc, 3 sc" },

	{ cc: gc(1), options: { exhaustive: true, style: "short" }, result: "1 gc" },
	{ cc: gc(6), options: { exhaustive: true, style: "short" }, result: "6 gc" },
	{ cc: gc(10), options: { exhaustive: true, style: "short" }, result: "10 gc" },
	{ cc: gc(23), options: { exhaustive: true, style: "short" }, result: "23 gc" },
	{ cc: gc(100), options: { exhaustive: true, style: "short" }, result: "100 gc" },
	{ cc: gc(413), options: { exhaustive: true, style: "short" }, result: "413 gc" },
] satisfies TestProps[];

const longExhaustive = [
	{ cc: cc(1), options: { exhaustive: true, style: "long" }, result: "1 copper coin" },
	{ cc: cc(6), options: { exhaustive: true, style: "long" }, result: "6 copper coins" },
	{ cc: cc(10), options: { exhaustive: true, style: "long" }, result: "1 silver coin" },
	{ cc: cc(23), options: { exhaustive: true, style: "long" }, result: "2 silver coins and 3 copper coins" },
	{ cc: cc(100), options: { exhaustive: true, style: "long" }, result: "1 gold coin" },
	{
		cc: cc(413),
		options: { exhaustive: true, style: "long" },
		result: "4 gold coins, 1 silver coin, and 3 copper coins",
	},

	{ cc: sc(1), options: { exhaustive: true, style: "long" }, result: "1 silver coin" },
	{ cc: sc(6), options: { exhaustive: true, style: "long" }, result: "6 silver coins" },
	{ cc: sc(10), options: { exhaustive: true, style: "long" }, result: "1 gold coin" },
	{ cc: sc(23), options: { exhaustive: true, style: "long" }, result: "2 gold coins and 3 silver coins" },
	{ cc: sc(100), options: { exhaustive: true, style: "long" }, result: "10 gold coins" },
	{ cc: sc(413), options: { exhaustive: true, style: "long" }, result: "41 gold coins and 3 silver coins" },

	{ cc: gc(1), options: { exhaustive: true, style: "long" }, result: "1 gold coin" },
	{ cc: gc(6), options: { exhaustive: true, style: "long" }, result: "6 gold coins" },
	{ cc: gc(10), options: { exhaustive: true, style: "long" }, result: "10 gold coins" },
	{ cc: gc(23), options: { exhaustive: true, style: "long" }, result: "23 gold coins" },
	{ cc: gc(100), options: { exhaustive: true, style: "long" }, result: "100 gold coins" },
	{ cc: gc(413), options: { exhaustive: true, style: "long" }, result: "413 gold coins" },
] satisfies TestProps[];

describe("Currency", () => {
	describe("formatCp()", () => {
		describe("short + exhaustive", () => {
			test.each(shortExhaustive.map(({ cc, options: { style, exhaustive }, result }) => [cc, result, style, exhaustive]))(
				"%i cc should print %p",
				(cc, result, style, exhaustive) => {
					expect(formatCc(cc, { exhaustive, style })).toEqual(result);
				},
			);
		});
		describe("long + exhaustive", () => {
			test.each(longExhaustive.map(({ cc, options: { style, exhaustive }, result }) => [cc, result, style, exhaustive]))(
				"%i cc should print %p",
				(cc, result, style, exhaustive) => {
					expect(formatCc(cc, { exhaustive, style })).toEqual(result);
				},
			);
		});
		describe("short + not exhaustive", () => {
			test.each(
				shortNotExhaustive.map(({ cc, options: { style, exhaustive }, result }) => [cc, result, style, exhaustive]),
			)("%i cc should print %p", (cc, result, style, exhaustive) => {
				expect(formatCc(cc, { exhaustive, style })).toEqual(result);
			});
		});
		describe("long + not exhaustive", () => {
			test.each(
				longNotExhaustive.map(({ cc, options: { style, exhaustive }, result }) => [cc, result, style, exhaustive]),
			)("%i cc should print %p", (cc, result, style, exhaustive) => {
				expect(formatCc(cc, { exhaustive, style })).toEqual(result);
			});
		});
	});
});
