import { nanoid } from "nanoid";
import { ConditionalKeys } from "type-fest";
import { Armor, Weapon } from "../character/character";
import { armors } from "./armors";
import { basicItems } from "./basic-items";
import { weapons } from "./weapons";
import { formatList } from "~/utils/text";
import { Dice } from "~/utils/dice";

export const itemTypes = ["basic", "weapon", "armor"] as const;
export type ItemType = (typeof itemTypes)[number];

type EnsureItemType<T extends { type: ItemType }> = T;

export type ItemList<Key extends ItemKey = ItemKey> = Array<{ key: Key; quantity: number }>;

export type ItemTemplate = EnsureItemType<
	{
		name: string;
		value: number;
	} & (
		| {
				type: "basic";
		  }
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
	)
>;

export type Item = ItemTemplate & {
	id: ReturnType<typeof nanoid>;
	key: ItemKey;
} & (
		| { type: "basic"; quantity: number }
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
	...basicItems,
} satisfies Record<string, ItemTemplate>;

export type ItemKey = keyof typeof items;
export type ArmorItemKey = keyof typeof armors;
export type WeaponItemKey = keyof typeof weapons;
export type BasicItemKey = keyof typeof basicItems;

export type MartialWeapons = ConditionalKeys<typeof items, { type: "weapon"; rank: "martial" }>;
export type SimpleWeapons = ConditionalKeys<typeof items, { type: "weapon"; rank: "simple" }>;

export const simpleWeapons = (Object.entries(items) as Array<[ItemKey, Item]>)
	.filter(([_id, item]) => item.type == "weapon" && item.rank == "simple")
	.map(([id, _item]) => id) as SimpleWeapons[];
export const martialWeapons = (Object.entries(items) as Array<[ItemKey, Item]>)
	.filter(([_id, item]) => item.type == "weapon" && item.rank == "martial")
	.map(([id, _item]) => id) as MartialWeapons[];

export function createItem(key: ItemKey): Item {
	console.debug("createItem key", key);
	const template = items[key];

	switch (template.type) {
		case "armor":
			return { ...template, equipped: false, id: nanoid(), key } satisfies Item & { type: "armor" };
		case "weapon":
			return { ...template, equipped: false, id: nanoid(), key } satisfies Item & { type: "weapon" };
		case "basic":
			return { ...template, id: nanoid(), key, quantity: 1 } satisfies Item & { type: "basic" };
		default:
			throw new Error(`key ${key} does not exist in items, or has a wrong type`);
	}
}

export function createArmor(key: ArmorItemKey): Armor {
	return createItem(key) as Armor;
}
export function createWeapon(key: WeaponItemKey): Weapon {
	return createItem(key) as Weapon;
}

export const itemTypeLabels = {
	armor: "Armor",
	basic: "Item",
	weapon: "Weapon",
} satisfies Record<ItemType, string>;

export function formatItemList(list: ItemList) {
	return formatList(
		mergeItems(list)
			.filter(({ quantity }) => quantity > 0)
			.map(({ key, quantity }) => ({ name: items[key].name, quantity })),
	);
}

export function mergeItems(list: ItemList): ItemList {
	let mergedList: ItemList = [];

	for (const item of list) {
		const foundItemIndex = mergedList.findIndex(i => i.key == item.key);
		if (foundItemIndex >= 0) {
			mergedList[foundItemIndex] = { key: item.key, quantity: mergedList[foundItemIndex].quantity + item.quantity };
		} else {
			mergedList.push(item);
		}
	}

	return mergedList;
}
