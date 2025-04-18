import { JsonObject } from "type-fest";
import {
	ActionCost,
	Store,
	opponentAttackThrow,
	playerCharacterAttackThrow,
} from "../battle/battle";
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

type WithState<
	T extends { baseState?: JsonObject; fn?: (...args: any[]) => any },
> = T extends {
	baseState?: infer State;
	fn?: (props: infer Props, ...args: infer Args) => infer Return;
}
	? State extends JsonObject
		? T & {
				fn?: (props: Props & StateModifiers<State>, ...args: Args) => Return;
				predicate?: (
					props: Props & StateModifiers<State>,
					...args: Args
				) => boolean;
			}
		: never
	: never;

type StateModifiers<State extends JsonObject = JsonObject> = {
	state: State & { usage: number; markedAsDone?: boolean | null };
	setState: SetStoreFunction<
		State & { usage: number; markedAsDone: boolean | null }
	>;
};
export type Action<
	Props extends JsonObject = any,
	State extends JsonObject = any,
> = WithState<
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
				fn: (
					props: Props & StateModifiers<State & { usage: number }>,
					source: Store<PlayerCharacter | Opponent>,
					target?: Store<PlayerCharacter | Opponent>,
				) => void;
				targetting: "self" | "other";
				restoreOn?: "short-rest" | "long-rest" | "any-rest" | "new-day";
				multipleTargets: number | false;
		  }
	)
>;

export type Targeted<T extends Action> = T & {
	target: Store<PlayerCharacter | Opponent>;
};
export type Sourced<T extends Action> = T & {
	source: Store<PlayerCharacter | Opponent>;
};
export type WithId<T extends Action> = T & {
	id: ReturnType<typeof nanoid>;
};

export type WeaponAttack = Action & { type: "weaponAttack" };
export type Ability = Action & { type: "ability" };
export type BaseAttack = Action & { type: "baseAttack" };

type GetActionProps<Act extends Ability> = Omit<
	Parameters<Act["fn"]>[0],
	keyof StateModifiers
>;
type GetActionArgs<Act extends Ability> =
	Parameters<Act["fn"]> extends [any, ...infer T] ? T : [];

export const actions = {
  debugAction: {
    title: 'Debug Ability (silvery barbs)',
    cost: 'reaction',
    targetting: 'other',
    fn: (props, source, target) => {
      console.debug({props, source, target})
      if (isStorePlayerCharacter(source) && target && isStoreOpponent(target)) {
        source.set('modifiers', prev => ([...prev, createModifierRef('advantageToHit', {timesToUse: 1})]))
        target.set('modifiers', prev => ([...prev, createModifierRef('opponentDisadvantageToHit', { timesToUse: 1})]))
      }
    },
    multipleTargets: false,
    type: 'ability',
  } satisfies Action<{}, {}>,
	...fighterAbilities,
};

export type ActionRefKey = keyof typeof actions;

export type ActionRef<ActionKey extends ActionRefKey = any> = {
	id: string;
	actionKey: ActionKey;
	props: GetActionProps<(typeof actions)[ActionKey]>;
};

export function executeAttack(
	attack: Sourced<Targeted<WeaponAttack | BaseAttack>>,
) {
	if (attack.type == "weaponAttack" && isPlayerCharacter(attack.source.value)) {
		return playerCharacterAttackThrow(
			attack.source.value,
			attack.target.value,
			attack.weapon,
			attack.cost,
		);
	} else if (attack.type == "baseAttack" && isOpponent(attack.source.value)) {
		return opponentAttackThrow(
			attack.source.value,
			attack.target.value,
			attack.attack,
		);
	} else {
		throw new Error("Wrong action");
	}
}

export function executeAbility<
  ActionKey extends ActionRefKey,
	T extends Targeted<Sourced<ActionFromRef<ActionKey>>>,
>(ability: T) {
	if (
  	ability.props.state.usage > 0 &&
		(!ability.predicate ||
		ability.predicate(ability.props, ability.source, ability.target))
	) {
		ability.fn?.(ability.props, ability.source, ability.target);
		ability.props.setState("usage", (prev) => prev - 1);
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
	props: GetActionProps<(typeof actions)[ActionKey]>,
) {
	return { id: nanoid(), actionKey, props } satisfies ActionRef<ActionRefKey>;
}

const [actionStates, setActionStates] = makePersisted(
	createStore<Record<ActionRef["id"], StateModifiers["state"]>>({}),
	{ name: "actionStates" },
);
createEffect(() => console.log(actionStates));
export const actionUsedEventBus =
	createEventBus<ReturnType<typeof getActionFromRef>>();

export function getActionFromRef<ActionKey extends ActionRefKey>(
	ref: ActionRef<ActionKey>,
) {
	// We **want** to cast to a broader type here, to prevent the actual action list to set what the type is
	const action: Action = actions[ref.actionKey];

	if (!(ref.id in actionStates)) {
		setActionStates(ref.id, { ...action.baseState, usage: 0 });
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
	} satisfies ActionFromRef<ActionKey>;
}

export type ActionFromRef<
  ActionKey extends ActionRefKey = ActionRefKey,
	Props extends JsonObject = any,
  State extends JsonObject & { usage: number } = { usage: number },
> = Action<Props, State> & { type: "ability" } & ActionRef<ActionKey> & { props: ActionRef<ActionKey>['props'] & {
  state: State,
  setState: SetStoreFunction<State>
}}
