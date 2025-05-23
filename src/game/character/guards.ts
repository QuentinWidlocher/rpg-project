import { Store } from "../battle/battle";
import { Item } from "../items/items";
import { Ability, ActionFromRef, AnyAction, Sourced, Targeted, WeaponAttack } from "./actions";
import { Armor, PlayerCharacter, Weapon } from "./character";
import { Opponent } from "./opponents";

export function isStorePlayerCharacter(
	store: Store<PlayerCharacter | Opponent>,
	// @ts-expect-error I assure you it's assignable
): store is Store<PlayerCharacter> {
	return isPlayerCharacter(store.value);
}

export function isStoreOpponent(
	store: Store<PlayerCharacter | Opponent>,
	// @ts-expect-error I assure you it's assignable
): store is Store<Opponent> {
	return isOpponent(store.value);
}

export function isPlayerCharacter(character: PlayerCharacter | Opponent): character is PlayerCharacter {
	return "modifiers" in character;
}

export function isOpponent(character: PlayerCharacter | Opponent): character is Opponent {
	return "armorClass" in character;
}

export function isSourced<T extends AnyAction>(action: T): action is Sourced<T> {
	return "source" in action;
}

export function isTargeted<T extends AnyAction>(action: T): action is Targeted<T> {
	return "target" in action;
}

export function target<T extends AnyAction>(action: T, target: Targeted<T>["target"]): Targeted<T> {
	return { ...action, target };
}

export function source<T extends AnyAction>(action: T, source: Sourced<T>["source"]): Sourced<T> {
	return { ...action, source };
}

export function sourceTarget<T extends AnyAction>(
	action: T,
	sourceTarget: Sourced<T>["source"] & Targeted<T>["target"],
): Targeted<Sourced<T>> {
	return target(source(action, sourceTarget), sourceTarget);
}

export function isWeaponAttack(action: AnyAction): action is WeaponAttack {
	return action.type == "weaponAttack";
}

export function isAbility(action: AnyAction): action is Ability {
	return action.type == "ability";
}

export function isActionFromRef(action: AnyAction): action is ActionFromRef {
	return "actionKey" in action;
}

export function isWeaponItem(item: Item): item is Weapon {
	return item.type == "weapon";
}

export function isArmorItem(item: Item): item is Armor {
	return item.type == "armor";
}
