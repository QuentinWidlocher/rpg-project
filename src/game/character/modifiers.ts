import { createEventBus } from "@solid-primitives/event-bus";
import { makePersisted } from "@solid-primitives/storage";
import { nanoid } from "nanoid";
import { JSX, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { AnyModifier, GetModifierArgs, GetModifierProps, Modifiers, StateModifiers } from "./modifiers-type";
import { modifiers } from "./modifier-list";

export type ModifierRefKey = keyof Modifiers;
// type AnySpecificModifier = Modifiers[ModifierRefKey];
// type OneSpecificModifier<K extends ModifierRefKey> = Modifiers[K];
// type AnyModifierForTarget<Target extends AnyModifier["target"]> = AnyModifier & { target: Target };
// type ModifierFromSpecificModifier<SpecificModifier extends AnySpecificModifier> = AnyModifier & {
// 	target: SpecificModifier["target"];
// };

// Represents a ref to an implementation, with set props (this can be serialized and stored in the localstorage for ex.)
export type ModifierRef<ModKey extends ModifierRefKey = any> = {
	id: string;
	modifierKey: ModKey;
	props: GetModifierProps<Modifiers[ModKey]>;
};

export function createModifierRef<ModKey extends ModifierRefKey>(
	modifierKey: ModKey,
	props: GetModifierProps<Modifiers[ModKey]>,
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
		case "opponentInitiative":
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

export type ModifierByLevel<Key extends ModifierRefKey> = {
	modifierRefKey: Key;
	title: string;
	description?: string;
	whatChanged?: string;
} & (
	| {
			props: GetModifierProps<Modifiers[Key]>;
	  }
	| {
			form: () => { element: JSX.Element; getValues: () => GetModifierProps<Modifiers[Key]> };
	  }
);

export function createModifierByLevel<Key extends ModifierRefKey>(
	modifierRefKey: Key,
	getProps:
		| {
				props: GetModifierProps<Modifiers[Key]>;
		  }
		| {
				form: () => { element: JSX.Element; getValues: () => GetModifierProps<Modifiers[Key]> };
		  },
	whatChanged?: ModifierByLevel<Key>["whatChanged"],
): ModifierByLevel<Key> {
	return {
		modifierRefKey,
		title: modifiers[modifierRefKey].title,
		description: (modifiers[modifierRefKey] as AnyModifier).description,
		whatChanged,
		...getProps,
	};
}
