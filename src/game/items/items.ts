import { ConditionalKeys } from "type-fest";
import { nanoid } from "nanoid";
import { Armor, Weapon } from "../character/character";
import { weapons } from "./weapons";
import { armors } from "./armors";
import { Dice } from "~/utils/dice";

export type ItemTemplate = {
	name: string;
	value: number;
} & (
	| {
			type: "weapon";
			subType: "melee" | "ranged";
			rank: "simple" | "martial" | "natural";
			hitDice: Dice;
			tags: Array<"two-handed" | "versatile" | "finesse" | "thrown" | "light" | "heavy">;
	  }
	| {
			type: "armor";
			subType: "light" | "medium" | "heavy" | "shield";
			armorClass: number;
			useDex?: boolean;
	  }
);

export type Item = ItemTemplate & {
	id: ReturnType<typeof nanoid>;
} & (
		| {
				type: "weapon";
				equipped: boolean;
		  }
		| {
				type: "armor";
				equipped: boolean;
		  }
	);

export const items = {
	...armors,
	...weapons,
} satisfies Record<string, ItemTemplate>;

export type ItemId = keyof typeof items;

export type MartialWeapons = ConditionalKeys<typeof items, { type: "weapon"; rank: "martial" }>;
export type SimpleWeapons = ConditionalKeys<typeof items, { type: "weapon"; rank: "simple" }>;

export const simpleWeapons = (Object.entries(items) as Array<[ItemId, Item]>)
	.filter(([_id, item]) => item.type == "weapon" && item.rank == "simple")
	.map(([id, _item]) => id) as SimpleWeapons[];
export const martialWeapons = (Object.entries(items) as Array<[ItemId, Item]>)
	.filter(([_id, item]) => item.type == "weapon" && item.rank == "martial")
	.map(([id, _item]) => id) as MartialWeapons[];

export function createItem(template: ItemTemplate): Item {
	const baseItem = {
		...template,
		id: nanoid(),
	};

	switch (template.type) {
		case "armor":
			return { ...baseItem, equipped: false };
		case "weapon":
			return { ...baseItem, equipped: false };

		default:
			return baseItem as Item;
	}
}

export function createArmor(template: ItemTemplate & { type: "armor" }): Armor {
	return createItem(template) as Armor;
}
export function createWeapon(template: ItemTemplate & { type: "weapon" }): Weapon {
	return createItem(template) as Weapon;
}
