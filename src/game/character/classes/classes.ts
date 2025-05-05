import type { BaseSkill, PlayerCharacter, Skill } from "../character";
import { fighterAbilitiesByLevel, fighterClassConfig } from "./fighter";
import type { ModifierRef } from "../modifiers";
import type { ItemId } from "~/game/items/items";
import type { Dice } from "~/utils/dice";
import type { ActionRefKey } from "../actions";
import { createAbilityByLevel } from "../actions-helpers";

export type ClassConfig = {
	hitDice: Dice;
	savingThrows: BaseSkill[];
	availableSkills: Skill[];
	proficiencies: ModifierRef[];
	startingEquipment: (ItemId | ItemId[])[][][]; // 😵 [a list of [choices between [lists of (items | choice of [item in a list])]]
};

export const classes = ["fighter", "wizard", "rogue"] as const;

export type Class = (typeof classes)[number];

export const classConfigs: Record<Class, ClassConfig> = {
	fighter: fighterClassConfig,
	wizard: {
		hitDice: { amount: 1, sides: 8 },
		savingThrows: [],
		availableSkills: [],
		proficiencies: [],
		startingEquipment: [],
	},
	rogue: {
		hitDice: { amount: 1, sides: 6 },
		savingThrows: [],
		availableSkills: [],
		proficiencies: [],
		startingEquipment: [],
	},
};

export function getClassLabel(clazz: Class): string {
	switch (clazz) {
		case "fighter":
			return "Fighter";
		case "rogue":
			return "Rogue";
		case "wizard":
			return "Wizard";
	}
}

export type AbilityByClassByLevel = ReturnType<typeof createAbilityByLevel<ActionRefKey>>;

export type AbilitiesByClassByLevel = {
	[c in Class]: {
		// [sc: SubClass]: {
		[lv: PlayerCharacter["level"]]: AbilityByClassByLevel[];
		// }
	};
};

export const abilitiesByClassByLevel = {
	fighter: fighterAbilitiesByLevel,
	rogue: [],
	wizard: [],
} as AbilitiesByClassByLevel;
