import { ArraySlice, JsonObject, SetReturnType } from "type-fest";
import { ActionCost, Store, opponentAttackThrow, playerCharacterAttackThrow } from "../battle/battle";
import { PlayerCharacter, Weapon } from "./character";
import { Opponent, OpponentAttack } from "./opponents";
import { SetStoreFunction, createStore } from "solid-js/store";
import { fighterAbilities } from "./classes/fighter";
import { JSXElement, createEffect } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";
import { createEventBus } from "@solid-primitives/event-bus";
import { isOpponent, isPlayerCharacter, isStoreOpponent, isStorePlayerCharacter } from "./guards";
import { nanoid } from "nanoid";
import { createModifierRef, ModifierRef } from "./modifiers";
import { intersection } from "lodash-es";
import { Equal, Expect } from "~/tests";
import { createAbility } from "./actions-helpers";

type WithState<T extends { baseState?: JsonObject; fn?: (...args: any[]) => any }> = T extends {
	baseState?: infer State;
	fn?: (props: infer Props, ...args: infer Args) => infer Return;
}
	? State extends JsonObject
		? T & {
				fn?: (props: Props & StateModifiers<State>, ...args: Args) => Return;
				predicate?: (props: Props & StateModifiers<State>, ...args: Args) => boolean;
		  }
		: never
	: never;

type StateModifiers<State extends JsonObject = JsonObject> = {
	state: State & { usage: number; markedAsDone?: boolean | null };
	setState: SetStoreFunction<State & { usage: number; markedAsDone: boolean | null }>;
};
export type Action<Props extends JsonObject = never, State extends JsonObject = never> = WithState<
	{
		baseState?: State;
		cost?: ActionCost;
		description?: string;
		label?: (action: Action<Props, State>) => JSXElement;
		title: string;
	} & (
		| { type: "weaponAttack"; weapon: Weapon }
		| { type: "baseAttack"; attack: OpponentAttack }
		| {
				type: "ability";
				baseState?: State & { usage: number };
				fn: (
					props: Props & { maxUsage: number } & StateModifiers<State & { usage: number }>,
					source: Store<PlayerCharacter | Opponent>,
					target?: Store<PlayerCharacter | Opponent>,
				) => void;
				targetting: "self" | "other";
				restoreOn?: "short-rest" | "long-rest" | "any-rest" | "new-day";
				multipleTargets: number | false;
		  }
		| {
				type: "spell";
				// @TODO add ranks etc.
				fn: (
					props: Props & { maxUsage: number } & StateModifiers<State & { usage: number }>,
					source: Store<PlayerCharacter | Opponent>,
					target?: Store<PlayerCharacter | Opponent>,
				) => void;
				targetting: "self" | "other";
				multipleTargets: number | false;
		  }
	)
>;

export type AnyAction = Action<any, any>;
export type AnyAbility = AnyAction & { type: "ability" };

export type Targeted<T extends AnyAction> = T & {
	target: Store<PlayerCharacter | Opponent>;
};
export type Sourced<T extends AnyAction> = T & {
	source: Store<PlayerCharacter | Opponent>;
};
export type WithId<T extends AnyAction> = T & {
	id: ReturnType<typeof nanoid>;
};

export type WeaponAttack = AnyAction & { type: "weaponAttack" };
export type Ability<Props extends JsonObject = never, State extends JsonObject = never> = Action<
	Props & { maxUsage: number },
	State & { usage: number }
> & { type: "ability" };
export type BaseAttack = AnyAction & { type: "baseAttack" };

export type GetAbilityProps<Abl extends AnyAction> = Abl extends AnyAbility
	? Omit<Parameters<Abl["fn"]>[0], keyof StateModifiers>
	: never;

type GetActionArgs<Act extends Ability> = Parameters<Act["fn"]> extends [any, ...infer T] ? T : [];
export type GetAbilityFn<Props extends JsonObject = never, State extends JsonObject = never> = (
	props: Props & { maxUsage: number } & StateModifiers<State & { usage: number }>,
	source: Store<PlayerCharacter | Opponent>,
	target?: Store<PlayerCharacter | Opponent>,
) => void;
export type GetAbilityPredicate<Props extends JsonObject = never, State extends JsonObject = never> = SetReturnType<
	GetAbilityFn<Props, State>,
	boolean
>;

export const actions = {
	debugAction: {
		title: "Debug Ability (silvery barbs)",
		cost: "reaction",
		targetting: "other",
		fn: (props, source, target) => {
			if (isStorePlayerCharacter(source) && target && isStoreOpponent(target)) {
				source.set("modifiers", prev => [...prev, createModifierRef("advantageToHit", { timesToUse: 1 })]);
				target.set("modifiers", prev => [...prev, createModifierRef("opponentDisadvantageToHit", { timesToUse: 1 })]);
			}
		},
		multipleTargets: false,
		type: "ability",
	} satisfies Action<{}, {}>,
	abilityWithPropsAndStates: createAbility<{ theProps: { p: string } }, { theState: { s: string } }>({
		title: "abilityWithPropsAndStates",
		cost: "action",
		targetting: "self",
		fn: ({ theProps, state, setState, maxUsage }, source, target) => {},
		multipleTargets: false,
	}),
	...fighterAbilities,
};

export type ActionRefKey = keyof typeof actions;

export type AbilityRef<ActionKey extends ActionRefKey = any> = {
	id: string;
	actionKey: ActionKey;
	props: GetAbilityProps<(typeof actions)[ActionKey]>;
};

export function executeAttack(attack: Sourced<Targeted<WeaponAttack | BaseAttack>>) {
	if (attack.type == "weaponAttack" && isPlayerCharacter(attack.source.value)) {
		return playerCharacterAttackThrow(attack.source.value, attack.target.value, attack.weapon, attack.cost);
	} else if (attack.type == "baseAttack" && isOpponent(attack.source.value)) {
		return opponentAttackThrow(attack.source.value, attack.target.value, attack.attack);
	} else {
		throw new Error("Wrong action");
	}
}

export function executeAbility<ActionKey extends ActionRefKey, T extends Targeted<Sourced<ActionFromRef<ActionKey>>>>(
	ability: T,
) {
	if (!ability.predicate || ability.predicate(ability.props, ability.source, ability.target)) {
		console.debug("used ability");
		ability.fn(ability.props, ability.source, ability.target);
	}
}

export function getActionCostLabel(actionCost: ActionCost) {
	switch (actionCost) {
		case "action":
			return "Action";
		case "bonusAction":
			return "Bonus action";
	}
}

export function createActionRef<ActionKey extends ActionRefKey>(
	actionKey: ActionKey,
	props: GetAbilityProps<(typeof actions)[ActionKey]>,
) {
	return { id: nanoid(), actionKey, props } satisfies AbilityRef<ActionRefKey>;
}

const [actionStates, setActionStates] = makePersisted(
	createStore<Record<AbilityRef["id"], StateModifiers["state"]>>({}),
	{ name: "actionStates" },
);

export const actionUsedEventBus = createEventBus<ReturnType<typeof getActionFromRef>>();

export function getActionFromRef<ActionKey extends ActionRefKey>(ref: AbilityRef<ActionKey>) {
	// We **want** to cast to a broader type here, to prevent the actual action list to set what the type is
	const action = actions[ref.actionKey] as AnyAction;

	if (!(ref.id in actionStates)) {
		setActionStates(ref.id, { usage: 0, ...action.baseState });
	}

	const [state, setState] = createStore(actionStates[ref.id]);

	createEffect(function syncWithStates() {
		setActionStates(ref.id, state);
	});

	return {
		...action,
		...ref,
		props: {
			...ref.props,
			state,
			setState,
		},
	} as ActionFromRef<ActionKey>;
}

export type ActionFromRef<
	ActionKey extends ActionRefKey = ActionRefKey,
	Props extends JsonObject = any,
	State extends JsonObject = any,
> = Ability<Props, State> &
	AbilityRef<ActionKey> & {
		props: AbilityRef<ActionKey>["props"] & {
			state: State;
			setState: SetStoreFunction<State>;
		};
	};

export function canHaveAction(pc: PlayerCharacter | Opponent, costs: ActionCost[]) {
	if (isPlayerCharacter(pc)) {
		return intersection(pc.availableActions, costs).length > 0;
	} else {
		return false;
	}
}

export function useActionCost(pc: Store<PlayerCharacter | Opponent>, costs: ActionCost[]) {
	if (isStorePlayerCharacter(pc)) {
		pc.set("availableActions", prev => prev.filter(cost => !costs.includes(cost)));
	}
}
