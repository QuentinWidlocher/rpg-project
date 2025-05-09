import type { BaseSkill, Skill } from "../character";
import type { ModifierRef } from "../modifiers";
import { fighterClassConfig } from "./fighter/fighter";
import type { Dice } from "~/utils/dice";
import type { ItemId } from "~/game/items/items";

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
	rogue: {
		availableSkills: [],
		hitDice: { amount: 1, sides: 6 },
		proficiencies: [],
		savingThrows: [],
		startingEquipment: [],
	},
	wizard: {
		availableSkills: [],
		hitDice: { amount: 1, sides: 8 },
		proficiencies: [],
		savingThrows: [],
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
