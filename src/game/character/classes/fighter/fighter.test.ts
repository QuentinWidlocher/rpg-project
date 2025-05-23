import { nanoid } from "nanoid";
import { createStore } from "solid-js/store";
import { beforeEach, describe, expect, test } from "vitest";
import { createActionRef, executeAbility, getActionFromRef } from "../../actions";
import { PlayerCharacter } from "../../character";
import { sourceTarget } from "../../guards";
import { createModifierRef, getModifierValue } from "../../modifiers";
import { Opponent } from "../../opponents";
import { fightingStyles } from "./modifiers";
import { d20 } from "~/utils/dice";
import { weapons } from "~/game/items/weapons";
import { createArmor, createWeapon, items } from "~/game/items/items";
import { Store, actionCosts, getMaxHp } from "~/game/battle/battle";

describe("Fighting Styles", () => {
	let character: PlayerCharacter;

	beforeEach(() => {
		character = {
			actions: [],
			availableActions: [...actionCosts],
			class: "fighter",
			hp: { current: 10 },
			id: nanoid(),
			inventory: [],
			level: 1,
			modifiers: [],
			money: 0,
			name: "",
			xp: { current: 0, next: 1 },
		} satisfies PlayerCharacter;
	});

	describe(`${fightingStyles.fightingStyleArchery.title} (${fightingStyles.fightingStyleArchery.description})`, () => {
		test("should work with a shortbow", () => {
			const roll = d20(1);
			const value = getModifierValue([createModifierRef("fightingStyleArchery", {})], "attackRoll", { modifier: 0, roll })(
				{ modifier: 0, roll },
				createWeapon(weapons.shortbow),
				character,
			);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(2);
		});

		test("should not work with a halberd", () => {
			const roll = d20(1);
			const value = getModifierValue([createModifierRef("fightingStyleArchery", {})], "attackRoll", { modifier: 0, roll })(
				{ modifier: 0, roll },
				createWeapon(weapons.halberd),
				character,
			);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(0);
		});
	});

	describe(`${fightingStyles.fightingStyleDefense.title} (${fightingStyles.fightingStyleDefense.description})`, () => {
		test("should work with chainMail", () => {
			character.inventory.push({ ...createArmor(items.chainMail), equipped: true });

			const value = getModifierValue([createModifierRef("fightingStyleDefense", {})], "armorClass", 0)(character);

			expect(value).toEqual(1);
		});

		test("should not work with unequiped chainMail", () => {
			character.inventory.push({ ...createArmor(items.chainMail), equipped: false });

			const value = getModifierValue([createModifierRef("fightingStyleDefense", {})], "armorClass", 0)(character);

			expect(value).toEqual(0);
		});

		test("should not work without armor", () => {
			const value = getModifierValue([createModifierRef("fightingStyleDefense", {})], "armorClass", 0)(character);

			expect(value).toEqual(0);
		});
	});

	describe(`${fightingStyles.fightingStyleDueling.title} (${fightingStyles.fightingStyleDueling.description})`, () => {
		test("should work with a sword and a shield", () => {
			character.inventory.push({ ...createWeapon(items.shortsword), equipped: true });
			character.inventory.push({ ...createArmor(items.shield), equipped: true });

			const roll = d20(1);

			const value = getModifierValue([createModifierRef("fightingStyleDueling", {})], "attackRoll", { modifier: 0, roll })(
				{ modifier: 0, roll },
				createWeapon(items.shortsword),
				character,
			);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(2);
		});

		test("should not work with two swords", () => {
			character.inventory.push({ ...createWeapon(items.shortsword), equipped: true });
			character.inventory.push({ ...createWeapon(items.shortsword), equipped: true });

			const roll = d20(1);

			const value = getModifierValue([createModifierRef("fightingStyleDueling", {})], "attackRoll", { modifier: 0, roll })(
				{ modifier: 0, roll },
				createWeapon(items.shortsword),
				character,
			);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(0);
		});
	});

	describe(`${fightingStyles.fightingStyleGreatWeaponFighting.title} (${fightingStyles.fightingStyleGreatWeaponFighting.description})`, () => {
		test("should work with a 2 roll with a greatsword (two-handed)", () => {
			let rolledAOneOrATwo = 0;

			for (let i = 0; i < 1000; i++) {
				const value = getModifierValue([createModifierRef("fightingStyleGreatWeaponFighting", {})], "damageRoll", {
					modifier: 0,
					roll: 2,
				})({ modifier: 0, roll: 2 }, { ...createWeapon(items.greatsword), equipped: true }, "action", character);

				if (value.roll! <= 2) {
					rolledAOneOrATwo++;
				}

				expect(value.modifier).toEqual(0);
			}

			expect(rolledAOneOrATwo).toBeLessThan(100); // 10% threshold (2d6)
		});

		test("should not work with a 4 roll with a greatsword (two-handed)", () => {
			const value = getModifierValue([createModifierRef("fightingStyleGreatWeaponFighting", {})], "damageRoll", {
				modifier: 0,
				roll: 4,
			})({ modifier: 0, roll: 4 }, { ...createWeapon(items.greatsword), equipped: true }, "action", character);

			expect(value.roll).toEqual(4);
			expect(value.modifier).toEqual(0);
		});

		test("should work with a 2 roll with a battleaxe (versatile)", () => {
			let rolledAOneOrATwo = 0;

			for (let i = 0; i < 1000; i++) {
				const value = getModifierValue([createModifierRef("fightingStyleGreatWeaponFighting", {})], "damageRoll", {
					modifier: 0,
					roll: 2,
				})({ modifier: 0, roll: 2 }, { ...createWeapon(items.battleaxe), equipped: true }, "action", character);

				if (value.roll! <= 2) {
					rolledAOneOrATwo++;
				}

				expect(value.modifier).toEqual(0);
			}

			expect(rolledAOneOrATwo).toBeLessThan(300); // 300% threshold (1d6)
		});

		test("should not work with a 2 roll with a shortsword (not two-handed or versatile)", () => {
			const value = getModifierValue([createModifierRef("fightingStyleGreatWeaponFighting", {})], "damageRoll", {
				modifier: 0,
				roll: 2,
			})({ modifier: 0, roll: 2 }, { ...createWeapon(items.shortsword), equipped: true }, "action", character);

			expect(value.roll).toEqual(2);
			expect(value.modifier).toEqual(0);
		});
	});

	describe(`${fightingStyles.fightingStyleTwoWeaponFighting.title} (${fightingStyles.fightingStyleTwoWeaponFighting.description})`, () => {
		test("should work with two battleaxes for the bonus action (lvl 1, prof +2)", () => {
			character.inventory.push({ ...createWeapon(items.battleaxe), equipped: true });
			character.inventory.push({ ...createWeapon(items.battleaxe), equipped: true });

			const roll = d20(1);

			const value = getModifierValue([createModifierRef("fightingStyleTwoWeaponFighting", {})], "damageRoll", {
				modifier: 0,
				roll,
			})({ modifier: 0, roll }, { ...createWeapon(items.shortsword), equipped: true }, "bonusAction", character);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(2);
		});

		test("should work with two battleaxes for the bonus action (lvl 10, prof +4)", () => {
			character.level = 10;
			character.inventory.push({ ...createWeapon(items.battleaxe), equipped: true });
			character.inventory.push({ ...createWeapon(items.battleaxe), equipped: true });

			const roll = d20(1);

			const value = getModifierValue([createModifierRef("fightingStyleTwoWeaponFighting", {})], "damageRoll", {
				modifier: 0,
				roll,
			})({ modifier: 0, roll }, { ...createWeapon(items.shortsword), equipped: true }, "bonusAction", character);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(4);
		});

		test("should not work with two battleaxes for the standard action", () => {
			character.inventory.push({ ...createWeapon(items.battleaxe), equipped: true });
			character.inventory.push({ ...createWeapon(items.battleaxe), equipped: true });

			const roll = d20(1);

			const value = getModifierValue([createModifierRef("fightingStyleTwoWeaponFighting", {})], "damageRoll", {
				modifier: 0,
				roll,
			})({ modifier: 0, roll }, { ...createWeapon(items.shortsword), equipped: true }, "action", character);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(0);
		});

		test("should not work with one battleaxe for the bonus action", () => {
			character.inventory.push({ ...createWeapon(items.battleaxe), equipped: true });
			character.inventory.push({ ...createWeapon(items.battleaxe), equipped: false });

			const roll = d20(1);

			const value = getModifierValue([createModifierRef("fightingStyleTwoWeaponFighting", {})], "damageRoll", {
				modifier: 0,
				roll,
			})({ modifier: 0, roll }, { ...createWeapon(items.shortsword), equipped: true }, "bonusAction", character);

			expect(value.roll).toEqual(roll);
			expect(value.modifier).toEqual(0);
		});
	});
});

describe("Fighter Abilities", () => {
	let character: Store<PlayerCharacter>;

	beforeEach(() => {
		let [store, setStore] = createStore<PlayerCharacter>({
			actions: [],
			availableActions: [...actionCosts],
			class: "fighter",
			hp: { current: 10 },
			id: nanoid(),
			inventory: [],
			level: 1,
			modifiers: [createModifierRef("classHitPoints", {})],
			money: 0,
			name: "",
			xp: { current: 0, next: 1 },
		} satisfies PlayerCharacter);

		character = { set: setStore, value: store };
	});

	describe("Second Wind", () => {
		test.each([...new Array(20)].map((_, i) => [1 + (i + 1), 10 + (i + 1), i + 1]))(
			"should give back between %i and %i HP at level %i",
			(minHp, maxHp, level) => {
				const secondWindRef = createActionRef("secondWind", { maxUsage: 1 });
				const secondWindInstance = getActionFromRef(secondWindRef);
				expect(secondWindInstance.props.state.usage).toBe(0);
				character.set("level", level);
				character.set("actions", character.value.actions.length, secondWindRef);
				character.set("hp", "current", 0);

				executeAbility(sourceTarget(secondWindInstance, character as Store<PlayerCharacter | Opponent>));

				expect(character.value.hp.current).toBeGreaterThanOrEqual(minHp);
				expect(character.value.hp.current).toBeLessThanOrEqual(maxHp);
				expect(secondWindInstance.props.state.usage).toBe(1);
			},
		);

		test("should not give back HP if already full", () => {
			const secondWindRef = createActionRef("secondWind", { maxUsage: 1 });
			const secondWindInstance = getActionFromRef(secondWindRef);
			expect(secondWindInstance.props.state.usage).toBe(0);
			character.set("actions", character.value.actions.length, secondWindRef);

			const maxHp = getMaxHp(character.value);
			character.set("hp", "current", maxHp);

			executeAbility(sourceTarget(secondWindInstance, character as Store<PlayerCharacter | Opponent>));

			expect(character.value.hp.current).toBe(maxHp);
			expect(secondWindInstance.props.state.usage).toBe(0);
		});
	});

	describe("Action Surge", () => {
		test("should give another action", () => {
			const actionSurgeRef = createActionRef("actionSurge", { maxUsage: 1 });
			const actionSurgeInstance = getActionFromRef(actionSurgeRef);
			character.set("actions", character.value.actions.length, actionSurgeRef);

			executeAbility(sourceTarget(actionSurgeInstance, character as Store<PlayerCharacter | Opponent>));

			expect(character.value.availableActions).toStrictEqual(["action", "bonusAction", "reaction", "action"]);
			expect(actionSurgeInstance.props.state.usage).toBe(1);
		});

		test("should work only once", () => {
			const actionSurgeRef = createActionRef("actionSurge", { maxUsage: 1 });
			const actionSurgeInstance = getActionFromRef(actionSurgeRef);
			character.set("actions", character.value.actions.length, actionSurgeRef);

			executeAbility(sourceTarget(actionSurgeInstance, character as Store<PlayerCharacter | Opponent>));

			expect(character.value.availableActions).toStrictEqual(["action", "bonusAction", "reaction", "action"]);

			executeAbility(sourceTarget(actionSurgeInstance, character as Store<PlayerCharacter | Opponent>));

			expect(character.value.availableActions).toStrictEqual(["action", "bonusAction", "reaction", "action"]);

			expect(actionSurgeInstance.props.state.usage).toBe(1);
		});

		test.todo("should work twice at lvl. idk");
	});
});
