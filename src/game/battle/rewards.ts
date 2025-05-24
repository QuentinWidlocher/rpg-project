import { cc, gc, sc } from "~/utils/currency";
import { roll } from "~/utils/dice";

export const individualTreasureTable = [
	{
		crFrom: 0,
		crTo: 4,
		table: [
			{ from: 1, gold: () => cc(roll("5d6")), to: 30 },
			{ from: 31, gold: () => sc(roll("4d6")), to: 60 },
			{ from: 61, gold: () => gc(roll("3d6") * 0.5), to: 70 }, // 3d6 EP => 3d6 * 0.5 GP
			{ from: 71, gold: () => gc(roll("3d6")), to: 95 },
			{ from: 96, gold: () => gc(roll("1d6") * 10), to: 100 }, // 1d6 PP => 1d6 * 10 GP
		],
	},
	{
		crFrom: 5,
		crTo: 10,
		table: [
			{ from: 1, gold: () => cc(roll("4d6") * 100) + gc(roll("1d6") * 10 * 0.5), to: 30 }, // 4d6x100 CP; 1d6x10 EP => 1d6*10*0.5 GP = 1d6*5 GP
			{ from: 31, gold: () => sc(roll("6d6") * 10) + gc(roll("2d6") * 10), to: 60 },
			{ from: 61, gold: () => gc(roll("3d6") * 10 * 0.5) + gc(roll("2d6") * 10), to: 70 }, // 3d6x10 EP => 3d6*10*0.5 GP = 3d6*5 GP; 2d6x10 GP
			{ from: 71, gold: () => gc(roll("4d6") * 10), to: 95 },
			{ from: 96, gold: () => gc(roll("2d6") * 10) + gc(roll("3d6") * 10), to: 100 }, // 2d6x10 GP; 3d6 PP => 3d6*10 GP
		],
	},
	{
		crFrom: 11,
		crTo: 16,
		table: [
			{ from: 1, gold: () => sc(roll("4d6") * 100) + gc(roll("1d6") * 100), to: 20 },
			{ from: 21, gold: () => gc(roll("1d6") * 100 * 0.5) + gc(roll("1d6") * 100), to: 35 }, // 1d6x100 EP => 1d6*100*0.5 GP = 1d6*50 GP; 1d6x100 GP
			{ from: 36, gold: () => gc(roll("2d6") * 100) + gc(roll("1d6") * 10 * 10), to: 75 }, // 2d6x100 GP; 1d6x10 PP => 1d6*10*10 GP = 1d6*100 GP
			{ from: 76, gold: () => gc(roll("2d6") * 100) + gc(roll("2d6") * 10 * 10), to: 100 }, // 2d6x100 GP; 2d6x10 PP => 2d6*10*10 GP = 2d6*100 GP
		],
	},
	{
		crFrom: 17,
		crTo: Infinity,
		table: [
			{ from: 1, gold: () => gc(roll("2d6") * 1000 * 0.5) + gc(roll("8d6") * 100), to: 15 }, // 2d6x1000 EP => 2d6*1000*0.5 GP = 2d6*500 GP; 8d6x100 GP
			{ from: 16, gold: () => gc(roll("1d6") * 1000) + gc(roll("1d6") * 100 * 10), to: 55 }, // 1d6x1000 GP; 1d6x100 PP => 1d6*100*10 GP = 1d6*1000 GP
			{ from: 56, gold: () => gc(roll("1d6") * 1000) + gc(roll("2d6") * 100 * 10), to: 100 }, // 1d6x1000 GP; 2d6x100 PP => 2d6*100*10 GP = 2d6*1000 GP
		],
	},
];
