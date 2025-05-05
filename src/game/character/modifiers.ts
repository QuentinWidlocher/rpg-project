import { Armor, BaseSkill, PlayerCharacter, Proficency, Skill, Weapon, getBaseSkill } from "./character";
import { SetStoreFunction, createStore } from "solid-js/store";
import { fighterAvailableSkills, fightingStyles } from "./classes/fighter";
import type { ArraySlice, JsonObject, Merge } from "type-fest";
import { Item } from "../items/items";
import { d20, skillModifier } from "~/utils/dice";
import { classConfigs } from "./classes/classes";
import { ActionCost } from "../battle/battle";
import { createEventBus } from "@solid-primitives/event-bus";
import { makePersisted } from "@solid-primitives/storage";
import { createEffect } from "solid-js";
import { nanoid } from "nanoid";
import { Opponent, OpponentAttack } from "./opponents";
import { Equal, Expect, Not } from "~/tests";

type WithState<T extends { baseState?: JsonObject; fn: (...args: any[]) => any }> = T extends {
	baseState?: infer State;
	fn: (props: infer Props, ...args: infer Args) => infer Return;
}
	? State extends JsonObject
		? T & {
				fn: (props: Props & StateModifiers<State>, ...args: Args) => Return;
				predicate?: (props: Props & StateModifiers<State>, ...args: Args) => boolean;
		  }
		: never
	: never;

// In order
const modifierSource = ["base", "race", "background", "class", "item", "action", "dm"] as const;
type ModifierSource = (typeof modifierSource)[number];

// In order
const modifierType = ["overrideBase", "bonus", "override"] as const;
type ModifierType = (typeof modifierType)[number];

type StateModifiers<State extends JsonObject = JsonObject> = {
	state: State & { markedAsDone?: boolean | null };
	setState: SetStoreFunction<State & { markedAsDone: boolean | null }>;
};

// Represents a Modifier "template" for a specific value
export type Modifier<Props extends JsonObject = never, State extends JsonObject = never> = WithState<
	{
		title: string;
		description?: string;
		display: boolean;
		type: ModifierType;
		source: ModifierSource;
		baseState?: State;
	} & (
		| {
				target: "armorClass";
				fn: (props: Props & StateModifiers<State>, character: PlayerCharacter) => number;
		  }
		| {
				target: "attackRoll";
				fn: (
					props: Props & StateModifiers<State>,
					roll: { roll: number; modifier: number },
					item: Item,
					character: PlayerCharacter,
				) => { roll?: number; modifier?: number };
		  }
		| {
				target: "opponentAttackRoll";
				fn: (
					props: Props & StateModifiers<State>,
					roll: { roll: number; modifier: number },
					attack: OpponentAttack,
					opponent: Opponent,
				) => { roll?: number; modifier?: number };
		  }
		| {
				target: "damageRoll";
				fn: (
					props: Props & StateModifiers<State>,
					roll: { roll: number; modifier: number },
					weapon: Weapon,
					actionCost: ActionCost,
					character: PlayerCharacter,
				) => { roll?: number; modifier?: number };
		  }
		| {
				target: "initiative";
				fn: (props: Props & StateModifiers<State>, character: PlayerCharacter) => number;
		  }
		| {
				target: "action";
				fn: (
					props: Props & StateModifiers<State>,
					character: PlayerCharacter,
					setCharacter: SetStoreFunction<PlayerCharacter>,
				) => undefined;
		  }
		| {
				target: "proficiency";
				fn: (props: Props & StateModifiers<State>, character: PlayerCharacter) => number;
		  }
		| {
				target: "skillProficiency";
				fn: (props: Props & StateModifiers<State>, skill: Skill) => Proficency;
		  }
		| {
				target: "weaponProficiency";
				fn: (props: Props & StateModifiers<State>, weapon: Weapon) => Proficency;
		  }
		| {
				target: "armorProficiency";
				fn: (props: Props & StateModifiers<State>, armor: Armor) => Proficency;
		  }
		| {
				target: "savingThrowProficiency";
				fn: (props: Props & StateModifiers<State>, baseSkill: BaseSkill) => Proficency;
		  }
		| {
				target: "baseSkill";
				fn: (props: Props & StateModifiers<State>, skill: BaseSkill, character: PlayerCharacter) => number;
		  }
		| {
				target: "hitPoints";
				fn: (props: Props & StateModifiers<State>, character: PlayerCharacter) => number;
		  }
		| {
				target: "opponentHitPoints";
				fn: (props: Props & StateModifiers<State>, opponent: Opponent) => number;
		  }
	)
>;

export type AnyModifier = Modifier<any, any>;

type GetModifierProps<Mod extends AnyModifier> = Omit<Parameters<Mod["fn"]>[0], keyof StateModifiers>;
type GetModifierState<Mod extends AnyModifier> = Omit<
	Pick<Parameters<Mod["fn"]>[0], keyof StateModifiers>["state"],
	"markedAsDone"
>;
type GetModifierArgs<Mod extends AnyModifier> = Parameters<Mod["fn"]> extends [any, ...infer T] ? T : [];

type t1 = GetModifierProps<Modifier<{}, {}>>;

export type TempModifier<Props extends JsonObject = {}, State extends JsonObject = {}> = Modifier<
	Props & { timesToUse: number },
	State & { timesUsed: number }
>;

/**
 * Create a modifier that keeps track of how much it's been used and set itself to done when necessary
 * @param modifier any modifier without usage tracking
 * @returns the same modifier with a usage tracking
 */
function createTempModifier<Props extends JsonObject = never, State extends JsonObject = never>(
	modifier: Modifier<NoInfer<Props> & { timesToUse: number }, NoInfer<State> & { timesUsed: number }>,
) {
	return {
		...modifier,
		baseState: { ...modifier.baseState, timesUsed: 0 },

		fn: ((props, ...rest: any[]) => {
			// @ts-expect-error
			props.setState("timesUsed", x => x + 1);
			// @ts-expect-error
			props.setState("markedAsDone", props.state.timesUsed >= props.timesToUse);
			// @ts-expect-error
			return modifier.fn(props, ...rest);
		}) as (
			props: GetModifierProps<typeof modifier> & { timesToUse: number } & StateModifiers<State & { timesUsed: number }>,
			...rest: ArraySlice<Parameters<(typeof modifier)["fn"]>, 1>
		) => ReturnType<(typeof modifier)["fn"]>,

		predicate: ((props, ...rest: any[]) => {
			return (
				// @ts-expect-error
				props.state.timesUsed < props.timesToUse && (modifier.predicate ? modifier.predicate?.(props, ...rest) : true)
			);
		}) as (
			props: Props & { timesToUse: number } & StateModifiers<State & { timesUsed: number }>,
			...rest: ArraySlice<Parameters<(typeof modifier)["fn"]>, 1>
		) => boolean,
	};
}

function createAdvantageToHitModifier(
	target: "attackRoll" | "opponentAttackRoll",
	title: string,
	func: (...values: number[]) => number,
) {
	if (target == "attackRoll") {
		return createTempModifier<{}, {}>({
			title,
			display: false,
			source: "action",
			type: "overrideBase",
			target: "attackRoll",
			fn: (props, { roll, modifier }) => {
				const newRoll = d20(1);
				const withAdvantage = func(roll, newRoll);
				console.debug(title, `before: ${roll}, after: ${newRoll}, result: ${withAdvantage}`);
				return { roll: withAdvantage, modifier };
			},
		});
	} else {
		return createTempModifier<{}, {}>({
			title,
			display: false,
			source: "action",
			type: "overrideBase",
			target: "opponentAttackRoll",
			fn: (props, { roll, modifier }) => {
				const newRoll = d20(1);
				const withAdvantage = func(roll, newRoll);
				console.debug(title, `before: ${roll}, after: ${newRoll}, result: ${withAdvantage}`);
				return { roll: withAdvantage, modifier };
			},
		});
	}
}

// Represents specific modifier implementations. They implement their Modifier "template" but can pass around their own props (cannot be serialized and stays in the codebase)
export const modifiers = {
	fighterProficiencies: {
		title: "Fighter proficiencies",
		display: true,
		target: "skillProficiency",
		source: "class",
		type: "override",
		fn: (props, skill) => props.skills.includes(skill),
		predicate: (_props, skill) => fighterAvailableSkills.includes(skill),
	} satisfies Modifier<{ skills: [Skill, Skill] }, {}>,
	baseSkillInitialValue: {
		title: "Base Skill initial value",
		display: false,
		target: "baseSkill",
		source: "base",
		type: "overrideBase",
		predicate: (props, skill) => props.skill == skill,
		fn: props => props.value,
	} satisfies Modifier<{ skill: BaseSkill; value: number }, {}>,
	classWeaponProficiency: {
		title: "Class weapon proficiencies",
		display: true,
		target: "weaponProficiency",
		type: "override",
		source: "class",
		fn: (props, weapon) => props.weaponRanks.includes(weapon.rank),
	} satisfies Modifier<{ weaponRanks: Weapon["rank"][] }, {}>,
	equippedArmorsAC: {
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
	} satisfies Modifier<{}, {}>,
	equippedShieldAC: {
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
	} satisfies Modifier<{}, {}>,
	classHitPoints: {
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
	} satisfies Modifier<{}, {}>,
	advantageToHit: createAdvantageToHitModifier("attackRoll", "Advantage to hit", Math.max),
	disadvantageToHit: createAdvantageToHitModifier("attackRoll", "Disadvantage to hit", Math.min),
	opponentAdvantageToHit: createAdvantageToHitModifier("opponentAttackRoll", "Advantage to hit", Math.max),
	opponentDisadvantageToHit: createAdvantageToHitModifier("opponentAttackRoll", "Disadvantage to hit", Math.min),
	opponentMultiplyMaxHP: {
		title: "Multiply opponent HP",
		display: false,
		source: "dm",
		target: "opponentHitPoints",
		type: "overrideBase",
		fn: (props, opponent) => Math.round(opponent.hp.max * props.factor),
	} satisfies Modifier<{ factor: number }, {}>,
	autoCriticalHit: createTempModifier<{}, {}>({
		title: "Auto Critical Hit",
		display: false,
		source: "dm",
		target: "attackRoll",
		type: "override",
		fn: props => ({ roll: 20 }),
	}),
	...fightingStyles,
};

type ModifierRefKey = keyof typeof modifiers;
type Modifiers = typeof modifiers;
type AnySpecificModifier = Modifiers[ModifierRefKey];
type OneSpecificModifier<K extends ModifierRefKey> = Modifiers[K];
type AnyModifierForTarget<Target extends AnyModifier["target"]> = AnyModifier & { target: Target };
type ModifierFromSpecificModifier<SpecificModifier extends AnySpecificModifier> = AnyModifier & {
	target: SpecificModifier["target"];
};

// Represents a ref to an implementation, with set props (this can be serialized and stored in the localstorage for ex.)
export type ModifierRef<ModKey extends ModifierRefKey = any> = {
	id: string;
	modifierKey: ModKey;
	props: GetModifierProps<(typeof modifiers)[ModKey]>;
};

export function createModifierRef<ModKey extends ModifierRefKey>(
	modifierKey: ModKey,
	props: GetModifierProps<(typeof modifiers)[ModKey]>,
) {
	return { id: nanoid(), modifierKey, props } satisfies ModifierRef;
}

function getModifiersFromRefs<ModKey extends ModifierRefKey>(
	refs: ModifierRef<ModKey>[],
	target: AnyModifier["target"],
) {
	let results = [];

	for (const ref of refs) {
		// We **want** to cast to a broader type here, to prevent the actual modifier list to set what the type is
		const mod = modifiers[ref.modifierKey] as AnyModifier;

		// We don't care if the modifier doesn't concern our target
		if (mod.target != target) {
			continue;
		}

		// We create the modifier state if it doesn't exists
		if (!(ref.id in modifierStates)) {
			setModifierStates(ref.id, { ...mod.baseState });
		}

		const [state, setState] = createStore(modifierStates[ref.id]);

		createEffect(function syncWithStates() {
			setModifierStates(ref.id, state);
		});

		results.push({
			...mod,
			...ref,
			props: {
				...ref.props,
				state,
				setState,
			},
		});
	}

	return results;
}

type ModifierOfTarget<Target extends AnyModifier["target"]> = AnyModifier & {
	target: Target;
};
type ModifierFn<Target extends AnyModifier["target"]> = ModifierOfTarget<Target>["fn"];
type ModifierFnReturnType<Target extends AnyModifier["target"]> = ReturnType<ModifierFn<Target>>;
type ModifierFnParams<Target extends AnyModifier["target"]> = GetModifierArgs<ModifierOfTarget<Target>>;

function addModifierBonus<Target extends AnyModifier["target"]>(
	target: Target,
	a: ModifierFnReturnType<Target>,
	b: ModifierFnReturnType<Target>,
): ModifierFnReturnType<Target> {
	switch (target) {
		case "armorClass":
		case "proficiency":
		case "initiative":
		case "baseSkill":
		case "hitPoints":
		case "opponentHitPoints":
			return ((a as ModifierFnReturnType<"armorClass">) +
				(b as ModifierFnReturnType<"armorClass">)) as ModifierFnReturnType<Target>;
		case "damageRoll":
		case "attackRoll":
		case "opponentAttackRoll":
			let [x, y] = [a as ModifierFnReturnType<"attackRoll">, b as ModifierFnReturnType<"attackRoll">];
			return {
				roll: Math.max(x.roll ?? 0, y.roll ?? 0),
				modifier: (x.modifier ?? 0) + (y.modifier ?? 0),
			} as ModifierFnReturnType<Target>;
		case "weaponProficiency":
		case "skillProficiency":
		case "armorProficiency":
		case "savingThrowProficiency":
			return a || b;
		case "action":
			return undefined as ModifierFnReturnType<Target>;
		default:
			throw new Error(`Target ${target} don't have an overrideBase applicator`);
	}
}

function applyOverrideBase<Target extends AnyModifier["target"]>(
	target: Target,
	a: ModifierFnReturnType<Target>,
	b: ModifierFnReturnType<Target>,
): ModifierFnReturnType<Target> {
	switch (target) {
		case "armorClass":
		case "proficiency":
		case "initiative":
		case "baseSkill":
		case "weaponProficiency":
		case "skillProficiency":
		case "armorProficiency":
		case "savingThrowProficiency":
		case "hitPoints":
		case "opponentHitPoints":
			return b;
		case "damageRoll":
		case "attackRoll":
		case "opponentAttackRoll":
			let [x, y] = [a as ModifierFnReturnType<"attackRoll">, b as ModifierFnReturnType<"attackRoll">];
			return { ...x, ...y } as ModifierFnReturnType<Target>;
		case "action":
			return undefined as ModifierFnReturnType<Target>;
		default:
			throw new Error(`Target ${target} don't have an overrideBase applicator`);
	}
}

const [modifierStates, setModifierStates] = makePersisted(
	createStore<Record<ModifierRef["id"], StateModifiers["state"]>>({}),
	{ name: "modifierStates" },
);
export const modifierUsedEventBus = createEventBus<ReturnType<typeof getModifiersFromRefs>[number]>();

export function getModifierValue<Target extends AnyModifier["target"]>(
	modifiers: ModifierRef<any>[],
	target: Target,
	baseValue: ModifierFnReturnType<Target>,
) {
	const mods = getModifiersFromRefs(modifiers, target);

	return (...args: ModifierFnParams<Target>): ModifierFnReturnType<Target> => {
		const lastOverride = mods.findLast(mod => mod.type == "override");
		if (lastOverride != null) {
			if (
				!lastOverride.props.state.markedAsDone &&
				(!lastOverride.predicate || lastOverride.predicate(lastOverride.props, ...(args as [])))
			) {
				const result = lastOverride.fn(
					lastOverride.props,
					...(args as [never, any, any, any]),
				) as ModifierFnReturnType<Target>;

				modifierUsedEventBus.emit(lastOverride);

				return result;
			}
		}

		let result = baseValue;

		const overrideBases = mods.filter(mod => mod.type == "overrideBase").toReversed();
		for (const overrideBase of overrideBases) {
			if (overrideBase != null) {
				if (
					!overrideBase.props.state.markedAsDone &&
					(!overrideBase.predicate || overrideBase.predicate(overrideBase.props, ...(args as [])))
				) {
					result = applyOverrideBase(
						target,
						result,
						overrideBase.fn(overrideBase.props, ...(args as [never, any, any, any])) as ModifierFnReturnType<Target>,
					);

					modifierUsedEventBus.emit(overrideBase);

					break;
				}
			}
		}

		for (const mod of mods) {
			if (mod.type != "bonus") continue;

			if (!mod.props.state.markedAsDone && (!mod.predicate || mod.predicate(mod.props, ...(args as [])))) {
				result = addModifierBonus(
					target,
					result,
					mod.fn(mod.props, ...(args as [never, any, any, any])) as ModifierFnReturnType<Target>,
				);
			}

			modifierUsedEventBus.emit(mod);
		}

		return result;
	};
}
