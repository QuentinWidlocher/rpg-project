import { Item } from "../items/items";
import { getBaseSkill } from "./character";
import { classConfigs } from "./classes/classes";
import { fighterModifiers } from "./classes/fighter/modifiers";
import { createAdvantageToHitModifier, createModifier, Modifiers } from "./modifiers-type";
import { opponentModifiers } from "./opponents";
import { skillModifier } from "~/utils/dice";

// Represents specific modifier implementations. They implement their Modifier "template" but can pass around their own props (cannot be serialized and stays in the codebase)
export const modifiers = {
	abilityScoreImprovement: createModifier("abilityScoreImprovement", {
		display: true,
		fn: (props, skill) => props.skills[skill] ?? 0,
		source: "class",
		target: "baseSkill",
		title: "Ability Score Improvement",
		type: "bonus",
	}),
	advantageToHit: createAdvantageToHitModifier("advantageToHit", "attackRoll", "Advantage to hit", Math.max),
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
	...opponentModifiers,
	...fighterModifiers,
} satisfies Modifiers;
