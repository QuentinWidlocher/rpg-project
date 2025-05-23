import { createEventBus } from "@solid-primitives/event-bus";
import { makePersisted } from "@solid-primitives/storage";
import { nanoid } from "nanoid";
import { createEffect, JSX } from "solid-js";
import { createStore } from "solid-js/store";
import { BaseIssue, BaseSchema, SafeParseResult } from "valibot";
import { modifiers } from "./modifier-list";
import {
	AnyModifier,
	GetModifierArgs,
	GetModifierProps,
	ModifierDeclarations,
	Modifiers,
	StateModifiers,
} from "./modifiers-type";

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
		// @FIXME
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		if (!(ref.id in modifierStates)) {
			// @FIXME
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			setModifierStates(ref.id, { ...mod.baseState });
		}

		// @FIXME
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		const [state, setState] = createStore(modifierStates[ref.id]);

		createEffect(function syncWithStates() {
			// @FIXME
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			setModifierStates(ref.id, state);
		});

		results.push({
			...mod,
			...ref,
			props: {
				...ref.props,
				setState,
				state,
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
		case "maxHitDice":
		case "attackPerAction":
		case "opponentHitPoints":
			return ((a as ModifierFnReturnType<"armorClass">) +
				(b as ModifierFnReturnType<"armorClass">)) as ModifierFnReturnType<Target>;
		case "damageRoll":
		case "attackRoll":
		case "opponentAttackRoll":
			return {
				modifier:
					((a as ModifierFnReturnType<"attackRoll">).modifier ?? 0) +
					((b as ModifierFnReturnType<"attackRoll">).modifier ?? 0),
				roll: Math.max(
					(a as ModifierFnReturnType<"attackRoll">).roll ?? 0,
					(b as ModifierFnReturnType<"attackRoll">).roll ?? 0,
				),
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
		case "maxHitDice":
		case "proficiency":
		case "initiative":
		case "opponentInitiative":
		case "baseSkill":
		case "weaponProficiency":
		case "skillProficiency":
		case "armorProficiency":
		case "savingThrowProficiency":
		case "hitPoints":
		case "attackPerAction":
		case "opponentHitPoints":
			return b;
		case "damageRoll":
		case "attackRoll":
		case "opponentAttackRoll":
			return {
				...(a as ModifierFnReturnType<"attackRoll">),
				...(b as ModifierFnReturnType<"attackRoll">),
			} as ModifierFnReturnType<Target>;
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
			form: (props: {
				onFormChanged: <
					TSchema extends BaseSchema<
						ModifierDeclarations[Key]["props"],
						ModifierDeclarations[Key]["props"],
						BaseIssue<unknown>
					>,
				>(
					props: SafeParseResult<TSchema>,
				) => void;
			}) => JSX.Element;
	  }
);

export function createModifierByLevel<Key extends ModifierRefKey>(
	modifierRefKey: Key,
	getProps:
		| {
				props: GetModifierProps<Modifiers[Key]>;
		  }
		| {
				form: (props: {
					onFormChanged: <
						TSchema extends BaseSchema<
							ModifierDeclarations[Key]["props"],
							ModifierDeclarations[Key]["props"],
							BaseIssue<unknown>
						>,
					>(
						props: SafeParseResult<TSchema>,
					) => void;
				}) => JSX.Element;
		  },
	whatChanged?: ModifierByLevel<Key>["whatChanged"],
): ModifierByLevel<Key> {
	const modifier = modifiers[modifierRefKey] as AnyModifier;
	return {
		description:
			typeof modifier.description == "function"
				? modifier.description("props" in getProps ? getProps.props : {})
				: modifier.description,
		modifierRefKey,
		title: modifier.title,
		whatChanged,
		...getProps,
	};
}
