import type { BaseSkill, Skill } from "../character";
import type { ModifierRef } from "../modifiers";
import { fighterClassConfig } from "./fighter/fighter";
import type { Dice } from "~/utils/dice";
import type { ItemId } from "~/game/items/items";

export type ClassConfig = {
	hitDiceType: Dice["sides"];
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
		hitDiceType: 6,
		proficiencies: [],
		savingThrows: [],
		startingEquipment: [],
	},
	wizard: {
		availableSkills: [],
		hitDiceType: 8,
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
