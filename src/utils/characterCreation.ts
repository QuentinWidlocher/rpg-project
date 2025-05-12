import { nanoid } from "nanoid";
import { createActionRef } from "~/game/character/actions";
import { PlayerCharacter } from "~/game/character/character";

export const serializedFighter = {
	actions: [createActionRef("secondWind", { maxUsage: 1 }), createActionRef("debugAction", { maxUsage: Infinity })],
	availableActions: ["action", "bonusAction", "reaction"],
	availableExtraAttacks: 0,
	class: "fighter",
	hitDice: 1,
	hp: {
		current: 12,
	},
	id: "dz5t9EbyuY4L5tyIqs7JE",
	inventory: [
		{
			armorClass: 16,
			equipped: true,
			id: nanoid(),
			name: "Chain Mail",
			subType: "heavy",
			type: "armor",
			value: 750000,
		},
		{
			equipped: true,
			hitDice: {
				amount: 1,
				sides: 8,
			},
			id: nanoid(),
			name: "Battleaxe",
			rank: "martial",
			subType: "melee",
			tags: ["versatile"],
			type: "weapon",
			value: 1000,
		},
		{
			equipped: true,
			hitDice: {
				amount: 1,
				sides: 8,
			},
			id: nanoid(),
			name: "Battleaxe",
			rank: "martial",
			subType: "melee",
			tags: ["versatile"],
			type: "weapon",
			value: 1000,
		},
		{
			equipped: false,
			hitDice: {
				amount: 1,
				sides: 8,
			},
			id: nanoid(),
			name: "Light Crossbow",
			rank: "simple",
			subType: "ranged",
			tags: ["two-handed"],
			type: "weapon",
			value: 2500,
		},
	],
	level: 1,
	modifiers: [
		{
			id: "sXFyZi5Z2a0ljVh3uTzdv",
			modifierKey: "baseSkillInitialValue",
			props: {
				skill: "strength",
				value: 16,
			},
		},
		{
			id: "YFbHg_vvUA8TWnYJXtBUF",
			modifierKey: "baseSkillInitialValue",
			props: {
				skill: "dexterity",
				value: 10,
			},
		},
		{
			id: "woTyz5IMi6bvF4ILdWHPI",
			modifierKey: "baseSkillInitialValue",
			props: {
				skill: "wisdom",
				value: 12,
			},
		},
		{
			id: "_u3p6vuWB6os5Yu_Cl6f-",
			modifierKey: "baseSkillInitialValue",
			props: {
				skill: "charisma",
				value: 12,
			},
		},
		{
			id: "pSVW_upUT6AExS-gcHdIf",
			modifierKey: "baseSkillInitialValue",
			props: {
				skill: "constitution",
				value: 15,
			},
		},
		{
			id: "7d8U1xBVFHILDxgULl1B4",
			modifierKey: "baseSkillInitialValue",
			props: {
				skill: "intelligence",
				value: 10,
			},
		},
		{
			id: nanoid(),
			modifierKey: "baseMaxHitDice",
			props: {},
		},
		{
			id: nanoid(),
			modifierKey: "baseAttacksPerAction",
			props: { value: 1 },
		},
		{
			id: "a8d5DrCZl4bppSQ41GzXz",
			modifierKey: "classWeaponProficiency",
			props: {
				weaponRanks: ["simple", "martial"],
			},
		},
		{
			id: "hsSkUz1D1vs1WBij6ORe8",
			modifierKey: "equippedArmorsAC",
			props: {},
		},
		{
			id: "wW8xGuVPuST3Yy9TEpg6x",
			modifierKey: "equippedShieldAC",
			props: {},
		},
		{
			id: "bxm9QTnDXG416CtVvfloA",
			modifierKey: "classHitPoints",
			props: {},
		},
		{
			id: "pqtPemCdfB7NDOd2HxKs8",
			modifierKey: "fighterProficiencies",
			props: {
				skills: ["athletics", "survival"],
			},
		},
		{
			id: "wYbDbwiMV3ehhQxGm0IY4",
			modifierKey: "fightingStyleDueling",
			props: {},
		},
	],
	money: 0,
	name: "Lazard",
	xp: {
		current: 0,
		next: 300,
	},
} satisfies PlayerCharacter;
