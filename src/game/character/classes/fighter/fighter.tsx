import { Skill } from "~/game/character/character";
import { martialWeapons } from "~/game/items/items";
import { createModifierRef } from "../../modifiers";
import { ClassConfig } from "../classes";

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
