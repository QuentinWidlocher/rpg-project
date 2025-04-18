import { beforeEach, describe, expect, test } from "vitest";
import { PlayerCharacter } from "./character";
import { createModifierRef, getModifierValue, modifiers } from "./modifiers";
import { fighterAvailableSkills } from "./classes/fighter";
import { weapons } from "../items/weapons";
import { items, martialWeapons, simpleWeapons } from "../items/items";
import { nanoid } from "nanoid";

describe("Basic modifiers", () => {
	let character: PlayerCharacter;

	beforeEach(() => {
		character = {
			id: nanoid(),
			name: "",
			level: 1,
			actions: [],
			availableActions: [],
			xp: { current: 0, next: 1 },
			hp: { current: 10 },
			inventory: [],
			class: "fighter",
			modifiers: [],
		} satisfies PlayerCharacter;
	});

	describe(modifiers.fighterProficiencies.title, () => {
		test("should work with two fighters skills", () => {
			const isProficient = getModifierValue(
				[
					createModifierRef("fighterProficiencies", {
						skills: [fighterAvailableSkills[0], fighterAvailableSkills[1]],
					}),
				],
				"skillProficiency",
				false,
			);

			expect(isProficient(fighterAvailableSkills[0])).toBe(true);
			expect(isProficient(fighterAvailableSkills[1])).toBe(true);
			expect(isProficient(fighterAvailableSkills[2])).toBe(false);
			expect(isProficient("arcana")).toBe(false);
		});

		test("should not work with two non fighters skills", () => {
			const isProficient = getModifierValue(
				[
					createModifierRef("fighterProficiencies", {
						skills: ["arcana", "performance"],
					}),
				],
				"skillProficiency",
				false,
			);

			expect(isProficient(fighterAvailableSkills[0])).toBe(false);
			expect(isProficient(fighterAvailableSkills[1])).toBe(false);
			expect(isProficient(fighterAvailableSkills[2])).toBe(false);
			expect(isProficient("arcana")).toBe(false);
		});
	});

	describe(modifiers.baseSkillInitialValue.title, () => {
		test("should work with a base skill", () => {
			const getBaseSkill = getModifierValue(
				[
					createModifierRef("baseSkillInitialValue", {
						skill: "charisma",
						value: 16,
					}),
				],
				"baseSkill",
				10,
			);

			expect(getBaseSkill("charisma", character)).toBe(16);
			expect(getBaseSkill("strength", character)).toBe(10);
		});
	});

	describe(modifiers.classWeaponProficiency.title, () => {
		test("should work with only simple weapons", () => {
			const getWeaponProficiency = getModifierValue(
				[createModifierRef("classWeaponProficiency", { weaponRanks: ["simple"] })],
				"weaponProficiency",
				false,
			);

			expect(
				getWeaponProficiency({ ...weapons[simpleWeapons[0]], equipped: true }),
			).toBe(true);
			expect(
				getWeaponProficiency({ ...weapons[martialWeapons[0]], equipped: true }),
			).toBe(false);
		});
	});

	describe(modifiers.equippedArmorsAC.title, () => {
		test("should work with chainmail", () => {
			character.inventory.push({ ...items.chainMail, equipped: true });

			const ac = getModifierValue(
				[createModifierRef("equippedArmorsAC", {})],
				"armorClass",
				10,
			)(character);

			expect(ac).toEqual(items.chainMail.armorClass);
		});

		test("should not work with unequipped chainmail", () => {
			character.inventory.push({ ...items.chainMail, equipped: false });

			const ac = getModifierValue(
				[createModifierRef("equippedArmorsAC", {})],
				"armorClass",
				10,
			)(character);

			expect(ac).toEqual(10);
		});

		test("should not work with shields", () => {
			character.inventory.push({ ...items.shield, equipped: false });

			const ac = getModifierValue(
				[createModifierRef("equippedArmorsAC", {})],
				"armorClass",
				10,
			)(character);

			expect(ac).toEqual(10);
		});
	});

	describe(modifiers.equippedShieldAC.title, () => {
		test("should work with shield", () => {
			character.inventory.push({ ...items.shield, equipped: true });

			const ac = getModifierValue(
				[createModifierRef("equippedShieldAC", {})],
				"armorClass",
				10,
			)(character);

			expect(ac).toEqual(10 + items.shield.armorClass);
		});

		test("should not work with unequipped shield", () => {
			character.inventory.push({ ...items.shield, equipped: false });

			const ac = getModifierValue(
				[createModifierRef("equippedShieldAC", {})],
				"armorClass",
				10,
			)(character);

			expect(ac).toEqual(10);
		});

		test("should not work with armors", () => {
			character.inventory.push({ ...items.chainMail, equipped: false });

			const ac = getModifierValue(
				[createModifierRef("equippedArmorsAC", {})],
				"armorClass",
				10,
			)(character);

			expect(ac).toEqual(10);
		});
	});

	describe(modifiers.classHitPoints.title, () => {
		test("should work for a lvl3 fighter", () => {
			character.level = 3;

			const hp = getModifierValue(
				[createModifierRef("classHitPoints", {})],
				"hitPoints",
				0,
			)(character);

			expect(hp).toBe(10 + (10 / 2 + 1) + (10 / 2 + 1));
		});

		test("should work for a lvl3 fighter with +2 const", () => {
			character.level = 3;
			character.modifiers = [
				createModifierRef("baseSkillInitialValue", {
					skill: "constitution",
					value: 14,
				}),
			];

			const hp = getModifierValue(
				[createModifierRef("classHitPoints", {})],
				"hitPoints",
				0,
			)(character);

			expect(hp).toBe(10 + 2 + (10 / 2 + 1 + 2) + (10 / 2 + 1 + 2));
		});
	});

	describe(modifiers.advantageToHit.title, () => {
		test("should give advantage only on next attack", () => {
			const firstAttackRoll = getModifierValue(
				[createModifierRef("advantageToHit", { timesToUse: 1 })],
				"attackRoll",
				{ roll: -1, modifier: 0 },
			)({ roll: -1, modifier: 0 }, weapons.dagger, character);

			const secondAttackRoll = getModifierValue(
				[createModifierRef("advantageToHit", { timesToUse: 1 })],
				"attackRoll",
				{ roll: -1, modifier: 0 },
			)({ roll: -1, modifier: 0 }, weapons.dagger, character);

			expect(firstAttackRoll.roll).toBeGreaterThan(0);
			expect(secondAttackRoll.roll).toBe(-1);
		});

		test("should give advantage permantly", () => {
			for (let i = 0; i < 100; i++) {
				const attackRoll = getModifierValue(
					[createModifierRef("advantageToHit", { permanent: true, timesToUse: 0 })],
					"attackRoll",
					{ roll: -1, modifier: 0 },
				)({ roll: -1, modifier: 0 }, weapons.dagger, character);

				expect(attackRoll.roll).toBeGreaterThan(0);
			}
		});
	});
});
