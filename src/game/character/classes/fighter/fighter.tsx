import { createModifierRef } from "../../modifiers";
import { ClassConfig } from "../classes";
import { Skill } from "~/game/character/character";
import { martialWeapons } from "~/game/items/items";

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
	availableSkills: fighterAvailableSkills,
	hitDiceType: 10,
	proficiencies: [
		createModifierRef("classWeaponProficiency", {
			weaponRanks: ["simple", "martial"],
		}),
	],
	savingThrows: ["strength", "constitution"],
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
