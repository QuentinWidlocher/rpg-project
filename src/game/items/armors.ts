import { ItemTemplate } from "~/game/items/items";
import { gc } from "~/utils/currency";

export const armors = {
	chainMail: {
		armorClass: 16,
		name: "Chain Mail",
		subType: "heavy",
		type: "armor",
		value: gc(75),
	},
	leatherArmor: {
		armorClass: 11,
		name: "Leather armor",
		subType: "light",
		type: "armor",
		useDex: true,
		value: gc(10),
	},
	shield: {
		armorClass: 2,
		name: "Shield",
		subType: "shield",
		type: "armor",
		value: gc(10),
	},
} satisfies Record<string, ItemTemplate>;
