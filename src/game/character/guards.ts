import { Character, Store } from "../battle/battle";
import { Ability, Action, ActionFromRef, Sourced, Targeted, WeaponAttack } from "./actions";
import { PlayerCharacter } from "./character";
import { Opponent } from "./opponents";

export function isStorePlayerCharacter(
	store: Store<PlayerCharacter | Opponent>,
	// @ts-ignore
): store is Store<PlayerCharacter> {
	return isPlayerCharacter(store.value)
}

export function isStoreOpponent(
	store: Store<PlayerCharacter | Opponent>,
	// @ts-ignore
): store is Store<Opponent> {
	return isOpponent(store.value)
}

export function isPlayerCharacter(
	character: PlayerCharacter | Opponent,
): character is PlayerCharacter {
	return "modifiers" in character;
}

export function isOpponent(
	character: PlayerCharacter | Opponent,
): character is Opponent {
	return "armorClass" in character;
}

export function isSourced<T extends Action>(action: T): action is Sourced<T> {
	return "source" in action;
}

export function isTargeted<T extends Action>(action: T): action is Targeted<T> {
	return "target" in action;
}

export function target<T extends Action>(
	action: T,
	target: Targeted<T>["target"],
): Targeted<T> {
	return { ...action, target };
}

export function source<T extends Action>(
	action: T,
	source: Sourced<T>["source"],
): Sourced<T> {
	return { ...action, source };
}

export function sourceTarget<T extends Action>(
	action: T,
	sourceTarget: Sourced<T>["source"] & Targeted<T>["target"],
): Targeted<Sourced<T>> {
	return target(source(action, sourceTarget), sourceTarget);
}

export function isWeaponAttack(action: Action): action is WeaponAttack {
	return action.type == "weaponAttack";
}

export function isAbility(action: Action): action is Ability {
	return action.type == "ability";
}

export function isActionFromRef(action: Action): action is ActionFromRef {
  return 'actionKey' in action
}
