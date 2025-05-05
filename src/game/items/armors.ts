import { ItemTemplate } from "~/game/items/items";
import { gc } from "~/utils/currency";

export const armors = {
	chainMail: {
		name: "Chain Mail",
		type: "armor",
		subType: "heavy",
		armorClass: 16,
		value: gc(75),
	},
	leatherArmor: {
		name: "Leather armor",
		type: "armor",
		subType: "light",
		armorClass: 11,
		value: gc(10),
		useDex: true,
	},
	shield: {
		name: "Shield",
		type: "armor",
		subType: "shield",
		armorClass: 2,
		value: gc(10),
	},
} satisfies Record<string, ItemTemplate>;
