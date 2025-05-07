import { AbilityByLevel } from "../actions-helpers";
import { ModifierByLevel } from "../modifiers";
import { Class } from "./classes";
import { fighterUpgradesByLevel } from "./fighter/jsp";

export type UpgradesByClassByLevel = {
	[c in Class]: {
		// [sc: SubClass]: {
		[lv: number]: {
			abilities: AbilityByLevel<any>[];
			modifiers: ModifierByLevel<any>[];
		};
		// }
	};
};

export const upgradesByClassByLevel = {
	fighter: fighterUpgradesByLevel,
	rogue: [],
	wizard: [],
} as UpgradesByClassByLevel;
