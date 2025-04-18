import { beforeEach, describe, expect, test } from "vitest";
import { createModifierRef, getModifierValue } from "../modifiers";
import { PlayerCharacter } from "../character";
import { d20 } from "~/utils/dice";
import { weapons } from "~/game/items/weapons";
import { fightingStyles } from "./fighter";
import { items } from "~/game/items/items";
import { createActionRef, executeAbility, getActionFromRef } from "../actions";
import { source, sourceTarget, target } from "../guards";
import { Store, actionCosts, getMaxHp } from "~/game/battle/battle";
import { createStore } from "solid-js/store";
import { Opponent } from "../opponents";
import { nanoid } from "nanoid";

describe("Fighting Styles", () => {
	let character: PlayerCharacter;

	beforeEach(() => {
		character = {
			id: nanoid(),
			name: "",
			level: 1,
			xp: { current: 0, next: 1 },
			hp: { current: 10 },
			inventory: [],
			class: "fighter",
			modifiers: [],
			actions: [],
			availableActions: [...actionCosts],
		} satisfies PlayerCharacter;
	});

	describe(`${fightingStyles.fightingStyleArchery.title} (${fightingStyles.fightingStyleArchery.description})`, () => {
		test("should work with a shortbow", () => {
			const roll = d20(1);
			const value = getModifierValue(
				[createModifierRef("fightingStyleArchery", {})],
				"attackRoll",
				{ roll, modifier: 0 },
			)({ roll, modifier: 0 }, weapons.shortbow, character);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(2);
		});

		test("should not work with a halberd", () => {
			const roll = d20(1);
			const value = getModifierValue(
				[createModifierRef("fightingStyleArchery", {})],
				"attackRoll",
				{ roll, modifier: 0 },
			)({ roll, modifier: 0 }, weapons.halberd, character);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(0);
		});
	});

	describe(`${fightingStyles.fightingStyleDefense.title} (${fightingStyles.fightingStyleDefense.description})`, () => {
		test("should work with chainMail", () => {
			character.inventory.push({ ...items.chainMail, equipped: true });

			const value = getModifierValue(
				[createModifierRef("fightingStyleDefense", {})],
				"armorClass",
				0,
			)(character);

			expect(value).toEqual(1);
		});

		test("should not work with unequiped chainMail", () => {
			character.inventory.push({ ...items.chainMail, equipped: false });

			const value = getModifierValue(
				[createModifierRef("fightingStyleDefense", {})],
				"armorClass",
				0,
			)(character);

			expect(value).toEqual(0);
		});

		test("should not work without armor", () => {
			const value = getModifierValue(
				[createModifierRef("fightingStyleDefense", {})],
				"armorClass",
				0,
			)(character);

			expect(value).toEqual(0);
		});
	});

	describe(`${fightingStyles.fightingStyleDueling.title} (${fightingStyles.fightingStyleDueling.description})`, () => {
		test("should work with a sword and a shield", () => {
			character.inventory.push({ ...items.shortsword, equipped: true });
			character.inventory.push({ ...items.shield, equipped: true });

			const roll = d20(1);

			const value = getModifierValue(
				[createModifierRef("fightingStyleDueling", {})],
				"attackRoll",
				{ roll, modifier: 0 },
			)({ roll, modifier: 0 }, items.shortsword, character);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(2);
		});

		test("should not work with two swords", () => {
			character.inventory.push({ ...items.shortsword, equipped: true });
			character.inventory.push({ ...items.shortsword, equipped: true });

			const roll = d20(1);

			const value = getModifierValue(
				[createModifierRef("fightingStyleDueling", {})],
				"attackRoll",
				{ roll, modifier: 0 },
			)({ roll, modifier: 0 }, items.shortsword, character);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(0);
		});
	});

	describe(`${fightingStyles.fightingStyleGreatWeaponFighting.title} (${fightingStyles.fightingStyleGreatWeaponFighting.description})`, () => {
		test("should work with a 2 roll with a greatsword (two-handed)", () => {
			let rolledAOneOrATwo = 0;

			for (let i = 0; i < 1000; i++) {
				const value = getModifierValue(
					[createModifierRef("fightingStyleGreatWeaponFighting", {})],
					"damageRoll",
					{ roll: 2, modifier: 0 },
				)(
					{ roll: 2, modifier: 0 },
					{ ...items.greatsword, equipped: true },
					"action",
					character,
				);

				if (value.roll! <= 2) {
					rolledAOneOrATwo++;
				}

				expect(value.modifier).toEqual(0);
			}

			expect(rolledAOneOrATwo).toBeLessThan(100); // 10% threshold (2d6)
		});

		test("should not work with a 4 roll with a greatsword (two-handed)", () => {
			const value = getModifierValue(
				[createModifierRef("fightingStyleGreatWeaponFighting", {})],
				"damageRoll",
				{ roll: 4, modifier: 0 },
			)(
				{ roll: 4, modifier: 0 },
				{ ...items.greatsword, equipped: true },
				"action",
				character,
			);

			expect(value.roll).toEqual(4);
			expect(value.modifier).toEqual(0);
		});

		test("should work with a 2 roll with a battleaxe (versatile)", () => {
			let rolledAOneOrATwo = 0;

			for (let i = 0; i < 1000; i++) {
				const value = getModifierValue(
					[createModifierRef("fightingStyleGreatWeaponFighting", {})],
					"damageRoll",
					{ roll: 2, modifier: 0 },
				)(
					{ roll: 2, modifier: 0 },
					{ ...items.battleaxe, equipped: true },
					"action",
					character,
				);

				if (value.roll! <= 2) {
					rolledAOneOrATwo++;
				}

				expect(value.modifier).toEqual(0);
			}

			expect(rolledAOneOrATwo).toBeLessThan(300); // 300% threshold (1d6)
		});

		test("should not work with a 2 roll with a shortsword (not two-handed or versatile)", () => {
			const value = getModifierValue(
				[createModifierRef("fightingStyleGreatWeaponFighting", {})],
				"damageRoll",
				{ roll: 2, modifier: 0 },
			)(
				{ roll: 2, modifier: 0 },
				{ ...items.shortsword, equipped: true },
				"action",
				character,
			);

			expect(value.roll).toEqual(2);
			expect(value.modifier).toEqual(0);
		});
	});

	describe(`${fightingStyles.fightingStyleTwoWeaponFighting.title} (${fightingStyles.fightingStyleTwoWeaponFighting.description})`, () => {
		test("should work with two battleaxes for the bonus action (lvl 1, prof +2)", () => {
			character.inventory.push({ ...items.battleaxe, equipped: true });
			character.inventory.push({ ...items.battleaxe, equipped: true });

			const roll = d20(1);

			const value = getModifierValue(
				[createModifierRef("fightingStyleTwoWeaponFighting", {})],
				"damageRoll",
				{ roll, modifier: 0 },
			)(
				{ roll, modifier: 0 },
				{ ...items.shortsword, equipped: true },
				"bonusAction",
				character,
			);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(2);
		});

		test("should work with two battleaxes for the bonus action (lvl 10, prof +4)", () => {
			character.level = 10;
			character.inventory.push({ ...items.battleaxe, equipped: true });
			character.inventory.push({ ...items.battleaxe, equipped: true });

			const roll = d20(1);

			const value = getModifierValue(
				[createModifierRef("fightingStyleTwoWeaponFighting", {})],
				"damageRoll",
				{ roll, modifier: 0 },
			)(
				{ roll, modifier: 0 },
				{ ...items.shortsword, equipped: true },
				"bonusAction",
				character,
			);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(4);
		});

		test("should not work with two battleaxes for the standard action", () => {
			character.inventory.push({ ...items.battleaxe, equipped: true });
			character.inventory.push({ ...items.battleaxe, equipped: true });

			const roll = d20(1);

			const value = getModifierValue(
				[createModifierRef("fightingStyleTwoWeaponFighting", {})],
				"damageRoll",
				{ roll, modifier: 0 },
			)(
				{ roll, modifier: 0 },
				{ ...items.shortsword, equipped: true },
				"action",
				character,
			);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(0);
		});

		test("should not work with one battleaxe for the bonus action", () => {
			character.inventory.push({ ...items.battleaxe, equipped: true });
			character.inventory.push({ ...items.battleaxe, equipped: false });

			const roll = d20(1);

			const value = getModifierValue(
				[createModifierRef("fightingStyleTwoWeaponFighting", {})],
				"damageRoll",
				{ roll, modifier: 0 },
			)(
				{ roll, modifier: 0 },
				{ ...items.shortsword, equipped: true },
				"bonusAction",
				character,
			);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(0);
		});
	});
});

describe("Fighter Abilities", () => {
	let character: Store<PlayerCharacter>;

	beforeEach(() => {
		let [store, setStore] = createStore<PlayerCharacter>({
			id: nanoid(),
			name: "",
			level: 1,
			xp: { current: 0, next: 1 },
			hp: { current: 10 },
			inventory: [],
			class: "fighter",
			modifiers: [createModifierRef("classHitPoints", {})],
			actions: [],
			availableActions: [...actionCosts],
		} satisfies PlayerCharacter);

		character = { value: store, set: setStore };
	});

	describe("Second Wind", () => {
		test("should give back HP", () => {
			const secondWindRef = createActionRef("secondWind", {});
			character.set("actions", character.value.actions.length, secondWindRef);
			character.set("hp", "current", 0);

			executeAbility(
				sourceTarget(
					getActionFromRef(secondWindRef),
					character as Store<PlayerCharacter | Opponent>,
				),
			);

			expect(character.value.hp.current).toBeGreaterThan(1 + 1); // 1d10 + 1
			expect(getActionFromRef(secondWindRef).props.state.usage).toBe(1);
		});

		test("should not give back HP if already full", () => {
			const secondWindRef = createActionRef("secondWind", {});
			character.set("actions", character.value.actions.length, secondWindRef);

			const maxHp = getMaxHp(character.value);
			character.set("hp", "current", maxHp);

			executeAbility(
				sourceTarget(
					getActionFromRef(secondWindRef),
					character as Store<PlayerCharacter | Opponent>,
				),
			);

			expect(character.value.hp.current).toBe(maxHp);
			expect(getActionFromRef(secondWindRef).props.state.usage).toBe(0);
		});
	});

	describe("Action Surge", () => {
		test("should give another action", () => {
			const actionSurgeRef = createActionRef("actionSurge", {});
			character.set("actions", character.value.actions.length, actionSurgeRef);
			character.set("hp", "current", 0);

			executeAbility(
				sourceTarget(
					getActionFromRef(actionSurgeRef),
					character as Store<PlayerCharacter | Opponent>,
				),
			);

			expect(character.value.availableActions).toStrictEqual([
				"action",
				"bonusAction",
				"reaction",
				"action",
			]);
			expect(getActionFromRef(actionSurgeRef).props.state.usage).toBe(1);
		});
	});
});
