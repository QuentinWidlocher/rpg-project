import { Item } from "../items/items";
import { BaseSkill, getBaseSkill, getSkillLabel } from "./character";
import { classConfigs } from "./classes/classes";
import { fighterModifiers } from "./classes/fighter/modifiers";
import { createAdvantageToHitModifier, createModifier, Modifiers } from "./modifiers-type";
import { opponentModifiers } from "./opponents";
import { skillModifier } from "~/utils/dice";

// Represents specific modifier implementations. They implement their Modifier "template" but can pass around their own props (cannot be serialized and stays in the codebase)
export const modifiers = {
	abilityScoreImprovement: createModifier("abilityScoreImprovement", {
		description: props =>
			`You gain ${new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(
				Object.entries(props.skills ?? {})
					.filter(([_, v]) => v > 0)
					.map(([s, v]) => `+${v} to ${getSkillLabel(s as BaseSkill)}`),
			)}.`,
		display: true,
		fn: (props, skill) => props.skills[skill] ?? 0,
		source: "class",
		target: "baseSkill",
		title: "Ability Score Improvement",
		type: "bonus",
	}),
	advantageToHit: createAdvantageToHitModifier("advantageToHit", "attackRoll", "Advantage to hit", Math.max),
	baseAttacksPerAction: createModifier("baseAttacksPerAction", {
		display: false,
		fn: props => props.value,
		source: "base",
		target: "attackPerAction",
		title: "Base attacks per action",
		type: "overrideBase",
	}),
	baseMaxHitDice: createModifier("baseMaxHitDice", {
		display: false,
		fn: (_props, character) => character.level,
		source: "base",
		target: "maxHitDice",
		title: "Base max hit dice",
		type: "overrideBase",
	}),
	baseSkillInitialValue: createModifier("baseSkillInitialValue", {
		display: false,
		fn: props => props.value,
		predicate: (props, skill) => props.skill == skill,
		source: "base",
		target: "baseSkill",
		title: "Base Skill initial value",
		type: "overrideBase",
	}),
	bonusMaxHitDice: createModifier("bonusMaxHitDice", {
		description: props => `You get +${props.value} to your total hit dice`,
		display: true,
		fn: props => props.value,
		source: "class",
		target: "maxHitDice",
		title: "Bonus to hit dice",
		type: "bonus",
	}),
	classHitPoints: createModifier("classHitPoints", {
		display: false,
		fn: (_props, character) => {
			const hitDiceSides = classConfigs[character.class].hitDiceType;
			const constModifier = skillModifier(getBaseSkill(character, "constitution"));
			let hp = hitDiceSides + constModifier;

			for (let i = 1; i < character.level; i++) {
				hp += 1 + Math.floor(hitDiceSides / 2) + constModifier;
			}

			return hp;
		},
		source: "class",
		target: "hitPoints",
		title: "Class hit points",
		type: "overrideBase",
	}),
	classWeaponProficiency: createModifier("classWeaponProficiency", {
		description: props =>
			`You gain proficiency with ${new Intl.ListFormat("en", { style: "long" }).format(props.weaponRanks)} weapon${
				props.weaponRanks.length > 1 ? "s" : null
			}.`,
		display: true,
		fn: (props, weapon) => props.weaponRanks.includes(weapon.rank),
		source: "class",
		target: "weaponProficiency",
		title: "Class weapon proficiencies",
		type: "override",
	}),
	disadvantageToHit: createAdvantageToHitModifier("disadvantageToHit", "attackRoll", "Disadvantage to hit", Math.min),
	equippedArmorsAC: createModifier("equippedArmorsAC", {
		display: false,
		fn: (_props, character) => {
			const armor = character.inventory.find(
				item => item.type == "armor" && item.subType != "shield" && item.equipped,
			) as Item & { type: "armor" };
			let result = armor.armorClass;

			if (armor.useDex) {
				result += skillModifier(getBaseSkill(character, "dexterity"));
			}

			return result;
		},
		predicate: (_props, character) =>
			character.inventory.some(item => item.type == "armor" && item.subType != "shield" && item.equipped),
		source: "item",
		target: "armorClass",
		title: "Equipped armors",
		type: "overrideBase",
	}),
	equippedShieldAC: createModifier("equippedShieldAC", {
		display: false,
		fn: (_props, character) =>
			(
				character.inventory.find(item => item.type == "armor" && item.subType == "shield" && item.equipped) as Item & {
					type: "armor";
				}
			).armorClass,
		predicate: (_props, character) =>
			character.inventory.some(item => item.type == "armor" && item.subType == "shield" && item.equipped),
		source: "item",
		target: "armorClass",
		title: "Equipped shield",
		type: "bonus",
	}),
	extraAttack1: createModifier("extraAttack1", {
		description: "You can attack twice, instead of once, whenever you take the Attack action on your turn.",
		display: true,
		fn: () => 2,
		source: "class",
		target: "attackPerAction",
		title: "Extra Attack (1)",
		type: "overrideBase",
	}),
	extraAttack2: createModifier("extraAttack2", {
		description: "You can attack three times, instead of once, whenever you take the Attack action on your turn.",
		display: true,
		fn: () => 3,
		source: "class",
		target: "attackPerAction",
		title: "Extra Attack (2)",
		type: "overrideBase",
	}),
	extraAttack3: createModifier("extraAttack3", {
		description: "You can attack four times, instead of once, whenever you take the Attack action on your turn.",
		display: true,
		fn: () => 4,
		source: "class",
		target: "attackPerAction",
		title: "Extra Attack (3)",
		type: "overrideBase",
	}),
	...opponentModifiers,
	...fighterModifiers,
} satisfies Modifiers;
