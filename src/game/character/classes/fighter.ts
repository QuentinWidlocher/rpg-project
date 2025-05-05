import { PlayerCharacter, Skill, getDamageRoll, getProficiencyBonus } from "~/game/character/character";
import { createModifierRef, Modifier } from "../modifiers";
import { getMaxHp } from "~/game/battle/battle";
import { d10 } from "~/utils/dice";
import { isPlayerCharacter, isSourced, isStorePlayerCharacter } from "../guards";
import { createAbility, createAbilityByLevel } from "../actions-helpers";
import { AbilitiesByClassByLevel, ClassConfig } from "./classes";
import { martialWeapons } from "~/game/items/items";

export const fightingStyles = {
	fightingStyleArchery: {
		description: "You gain a +2 bonus to attack rolls you make with ranged weapons.",
		display: true,
		fn: () => ({ modifier: 2 }),
		predicate: (_props, _roll, item) => item.type == "weapon" && item.subType == "ranged",
		source: "class",
		target: "attackRoll",
		title: "Archery",
		type: "bonus",
	} satisfies Modifier<{}, {}>,

	fightingStyleDefense: {
		description: "While you are wearing armor, you gain a +1 bonus to AC.",
		display: true,
		fn: () => 1,
		predicate: (_props, character) => character.inventory.some(item => item.type == "armor" && item.equipped),
		source: "class",
		target: "armorClass",
		title: "Defense",
		type: "bonus",
	} satisfies Modifier<{}, {}>,

	fightingStyleDueling: {
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
		title: "Dueling",
		type: "bonus",
	} satisfies Modifier<{}, {}>,

	fightingStyleGreatWeaponFighting: {
		description:
			"When you roll a 1 or 2 on a damage die for an attack you make with a melee weapon that you are wielding with two hands, you can reroll the die and must use the new roll, even if the new roll is a 1 or a 2. The weapon must have the two-handed or versatile property for you to gain this benefit.",
		display: true,
		fn: (_props, _roll, weapon, _actionCost, character) => getDamageRoll(weapon, character),
		// @FIXME: we should reroll a single die when needed
		predicate: (_props, { roll }, weapon) =>
			(weapon.tags.includes("two-handed") || weapon.tags.includes("versatile")) && roll <= 2,
		source: "class",
		target: "damageRoll",
		title: "Great Weapon Fighting",
		type: "override",
	} satisfies Modifier<{}, {}>,

	fightingStyleTwoWeaponFighting: {
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
		title: "Two weapon fighting",
		type: "bonus",
	} satisfies Modifier<{}, {}>,
} as const;

export const fighterAbilities = {
	secondWind: createAbility<{}, {}>({
		title: "Second Wind",
		cost: "action",
		restoreOn: "any-rest",
		fn: (_props, source) => {
			if (isStorePlayerCharacter(source)) {
				source.set("hp", "current", prev => Math.min(prev + d10(1) + source.value.level, getMaxHp(source.value)));
			}
		},
		predicate: (_, source) => {
			const pc = source.value;
			return source.value.hp.current < getMaxHp(pc);
		},
		label: action => {
			if (isSourced(action)) {
				const pc = action.source.value;
				if (isPlayerCharacter(pc)) {
					return `+ 1d10 + ${pc.level} HP`;
				}
			}

			return `+ 1d10 HP`;
		},
		targetting: "self",
		multipleTargets: false,
		description: `You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.`,
	}),
	actionSurge: createAbility<{}, {}>({
		title: "Action Surge",
		cost: undefined,
		restoreOn: "any-rest",
		fn: (_props, source) => {
			if (isStorePlayerCharacter(source)) {
				source.set("availableActions", prev => [...prev, "action"]);
			}
		},
		targetting: "self",
		description: `You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a short or long rest before you can use it again.`,
		multipleTargets: false,
	}),
};

export const fighterAbilitiesByLevel = {
	1: [createAbilityByLevel("secondWind", { maxUsage: 1 })],
	2: [createAbilityByLevel("actionSurge", { maxUsage: 1 })],
	17: [createAbilityByLevel("actionSurge", { maxUsage: 2 }, "You can use Action Surge twice before a rest")],
} satisfies AbilitiesByClassByLevel["fighter"];

export const fighterAvailableSkills: Skill[] = [
	"acrobatics",
	"animalHandling",
	"athletics",
	"history",
	"insight",
	"intimidation",
	"perception",
	"survival",
];

export const fighterClassConfig = {
	hitDice: { amount: 1, sides: 10 },
	availableSkills: fighterAvailableSkills,
	savingThrows: ["strength", "constitution"],
	proficiencies: [
		createModifierRef("classWeaponProficiency", {
			weaponRanks: ["simple", "martial"],
		}),
	],
	startingEquipment: [
		[
			["chainMail"],
			["leatherArmor", "longbow"], // @TODO ammunitions
		],
		[
			[martialWeapons, "shield"],
			[martialWeapons, martialWeapons],
		],
		[["lightCrossbow"], ["handaxe", "handaxe"]],
	],
} satisfies ClassConfig;
