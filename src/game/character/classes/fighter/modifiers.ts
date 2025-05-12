import { getDamageRoll, getProficiencyBonus } from "../../character";
import { createModifier } from "../../modifiers-type";
import { fighterAvailableSkills } from "./fighter";

export const fightingStyles = {
	fightingStyleArchery: createModifier("fightingStyleArchery", {
		description: "You gain a +2 bonus to attack rolls you make with ranged weapons.",
		display: true,
		fn: () => ({ modifier: 2 }),
		predicate: (_props, _roll, item) => item.type == "weapon" && item.subType == "ranged",
		source: "class",
		target: "attackRoll",
		title: "Fighting Style: Archery",
		type: "bonus",
	}),

	fightingStyleDefense: createModifier("fightingStyleDefense", {
		description: "While you are wearing armor, you gain a +1 bonus to AC.",
		display: true,
		fn: () => 1,
		predicate: (_props, character) => character.inventory.some(item => item.type == "armor" && item.equipped),
		source: "class",
		target: "armorClass",
		title: "Fighting Style: Defense",
		type: "bonus",
	}),

	fightingStyleDueling: createModifier("fightingStyleDueling", {
		description:
			"When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.",
		display: true,
		fn: () => ({ modifier: 2 }),
		predicate: (_props, _roll, item, character) =>
			item.type == "weapon" &&
			item.subType == "melee" &&
			!item.tags.includes("two-handed") &&
			character.inventory.filter(item => item.type == "weapon" && item.equipped).length <= 1,
		source: "class",
		target: "attackRoll",
		title: "Fighting Style: Dueling",
		type: "bonus",
	}),

	fightingStyleGreatWeaponFighting: createModifier("fightingStyleGreatWeaponFighting", {
		description:
			"When you roll a 1 or 2 on a damage die for an attack you make with a melee weapon that you are wielding with two hands, you can reroll the die and must use the new roll, even if the new roll is a 1 or a 2. The weapon must have the two-handed or versatile property for you to gain this benefit.",
		display: true,
		fn: (_props, _roll, weapon, _actionCost, character) => getDamageRoll(weapon, character),
		// @FIXME: we should reroll a single die when needed
		predicate: (_props, { roll }, weapon) =>
			(weapon.tags.includes("two-handed") || weapon.tags.includes("versatile")) && roll <= 2,
		source: "class",
		target: "damageRoll",
		title: "Fighting Style: Great Weapon Fighting",
		type: "override",
	}),

	fightingStyleTwoWeaponFighting: createModifier("fightingStyleTwoWeaponFighting", {
		description:
			"When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack.",
		display: true,
		fn: (_props, _roll, _weapon, _actionCost, character) => ({
			modifier: getProficiencyBonus(character),
		}),
		predicate: (_props, _roll, weapon, actionCost, character) =>
			!weapon.tags.includes("two-handed") &&
			actionCost == "bonusAction" &&
			character.inventory.filter(
				item =>
					item.type == "weapon" && (item.tags.includes("one-handed") || item.tags.includes("versatile")) && item.equipped,
			).length == 2,
		source: "class",
		target: "damageRoll",
		title: "Fighting Style: Two weapon fighting",
		type: "bonus",
	}),
};

export const fighterModifiers = {
	...fightingStyles,
	fighterProficiencies: createModifier("fighterProficiencies", {
		description: props =>
			`You gain proficiency with ${new Intl.ListFormat("en", { style: "long" }).format(props.skills)}.`,
		display: true,
		fn: (props, skill) => props.skills.includes(skill),
		predicate: (_props, skill) => fighterAvailableSkills.includes(skill),
		source: "class",
		target: "skillProficiency",
		title: "Fighter proficiencies",
		type: "override",
	}),
};
