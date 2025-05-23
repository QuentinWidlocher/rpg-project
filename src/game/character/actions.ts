import { createEventBus } from "@solid-primitives/event-bus";
import { makePersisted } from "@solid-primitives/storage";
import { intersection } from "lodash-es";
import { nanoid } from "nanoid";
import { JSXElement, createEffect } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { EmptyObject, JsonObject, SetReturnType } from "type-fest";
import { ActionCost, Store, opponentAttackThrow, playerCharacterAttackThrow } from "../battle/battle";
import { createAbility } from "./actions-helpers";
import { PlayerCharacter, Weapon } from "./character";
import { fighterAbilities } from "./classes/fighter/abilities";
import { isOpponent, isPlayerCharacter, isStoreOpponent, isStorePlayerCharacter } from "./guards";
import { createModifierRef } from "./modifiers";
import { Opponent, OpponentAttack } from "./opponents";

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

// type GetActionArgs<Act extends Ability> = Parameters<Act["fn"]> extends [any, ...infer T] ? T : [];
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
	abilityWithPropsAndStates: createAbility<{ theProps: { p: string } }, { theState: { s: string } }>({
		cost: "action",
		fn: (_props, _source, _target) => {},
		multipleTargets: false,
		targetting: "self",
		title: "abilityWithPropsAndStates",
	}),
	debugAction: {
		cost: "reaction",
		fn: (_props, source, target) => {
			if (isStorePlayerCharacter(source) && target && isStoreOpponent(target)) {
				source.set("modifiers", prev => [...prev, createModifierRef("advantageToHit", { maxUsage: 1 })]);
				target.set("modifiers", prev => [...prev, createModifierRef("opponentDisadvantageToHit", { maxUsage: 1 })]);
			}
		},
		multipleTargets: false,
		targetting: "other",
		title: "Debug Ability (silvery barbs)",
		type: "ability",
	} satisfies Action<EmptyObject, EmptyObject>,
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
	return { actionKey, id: nanoid(), props } satisfies AbilityRef<ActionRefKey>;
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
			setState,
			state,
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
