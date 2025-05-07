import { skillModifier } from "~/utils/dice";
import { Item } from "../items/items";
import { getBaseSkill } from "./character";
import { classConfigs } from "./classes/classes";
import { fighterModifiers } from "./classes/fighter/modifiers";
import { createAdvantageToHitModifier, createModifier, Modifiers } from "./modifiers-type";
import { opponentModifiers } from "./opponents";

// Represents specific modifier implementations. They implement their Modifier "template" but can pass around their own props (cannot be serialized and stays in the codebase)
export const modifiers = {
	baseSkillInitialValue: createModifier("baseSkillInitialValue", {
		title: "Base Skill initial value",
		display: false,
		target: "baseSkill",
		source: "base",
		type: "overrideBase",
		predicate: (props, skill) => props.skill == skill,
		fn: props => {
			return props.value;
		},
	}),
	classWeaponProficiency: createModifier("classWeaponProficiency", {
		title: "Class weapon proficiencies",
		display: true,
		target: "weaponProficiency",
		type: "override",
		source: "class",
		fn: (props, weapon) => props.weaponRanks.includes(weapon.rank),
	}),
	equippedArmorsAC: createModifier("equippedArmorsAC", {
		title: "Equipped armors",
		display: false,
		target: "armorClass",
		source: "item",
		type: "overrideBase",
		predicate: (_props, character) =>
			character.inventory.some(item => item.type == "armor" && item.subType != "shield" && item.equipped),
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
	}),
	equippedShieldAC: createModifier("equippedShieldAC", {
		title: "Equipped shield",
		display: false,
		target: "armorClass",
		source: "item",
		type: "bonus",
		predicate: (_props, character) =>
			character.inventory.some(item => item.type == "armor" && item.subType == "shield" && item.equipped),
		fn: (_props, character) =>
			(
				character.inventory.find(item => item.type == "armor" && item.subType == "shield" && item.equipped) as Item & {
					type: "armor";
				}
			).armorClass,
	}),
	classHitPoints: createModifier("classHitPoints", {
		title: "Class hit points",
		display: false,
		target: "hitPoints",
		source: "class",
		type: "overrideBase",
		fn: (_props, character) => {
			const hitDiceSides = classConfigs[character.class].hitDice.sides;
			const constModifier = skillModifier(getBaseSkill(character, "constitution"));
			let hp = hitDiceSides + constModifier;

			for (let i = 1; i < character.level; i++) {
				hp += 1 + Math.floor(hitDiceSides / 2) + constModifier;
			}

			return hp;
		},
	}),
	advantageToHit: createAdvantageToHitModifier("advantageToHit", "attackRoll", "Advantage to hit", Math.max),
	disadvantageToHit: createAdvantageToHitModifier("disadvantageToHit", "attackRoll", "Disadvantage to hit", Math.min),
	abilityScoreImprovement: createModifier("abilityScoreImprovement", {
		title: "Ability Score Improvement",
		display: true,
		source: "class",
		target: "baseSkill",
		type: "bonus",
		fn: (props, skill) => props.skills[skill] ?? 0,
	}),
	...opponentModifiers,
	...fighterModifiers,
} satisfies Modifiers;
