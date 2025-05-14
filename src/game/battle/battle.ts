import { SetStoreFunction } from "solid-js/store";
import { sum } from "lodash-es";
import {
	getMaxHp as getPCMaxHp,
	getArmorClass as getPCArmorClass,
	PlayerCharacter,
	Weapon,
	getAttackRoll,
	getInitiativeRoll as getCharacterInitiative,
	getDamageRoll,
} from "../character/character";
import {
	OpponentAttack,
	Opponent,
	getInitiative as getOpponentInitiative,
	rollDamage,
	getOpponentAttackRoll,
	getOpponentMaxHp,
} from "../character/opponents";
import { isOpponent } from "../character/guards";

export type Character = {
	id: string;
	name: string;
	hp: { current: number };
};

export const actionCosts = ["action", "bonusAction", "reaction"] as const;
export type ActionCost = (typeof actionCosts)[number];

export type AttackResult = {
	details: {
		attacker: string;
		defender: string;
		attack: string;
		hitRoll: number;
		hitModifier: number;
		defenderAC: number;
	};
} & (
	| {
			success: true;
			damage: number;
			details: { damageRoll: number; damageModifier: number };
	  }
	| { success: false }
);

export function getMaxHp(character: PlayerCharacter | Opponent): number {
	if (isOpponent(character)) {
		return getOpponentMaxHp(character);
	} else {
		return getPCMaxHp(character);
	}
}

export function getArmorClass(character: PlayerCharacter | Opponent): number {
	if (isOpponent(character)) {
		return character.armorClass;
	} else {
		return getPCArmorClass(character as PlayerCharacter);
	}
}

export function playerCharacterAttackThrow(
	attacker: PlayerCharacter,
	defender: PlayerCharacter | Opponent,
	weapon: Weapon,
	actionCost: ActionCost = "action",
): AttackResult {
	const { roll = 0, modifier = 0 } = getAttackRoll(weapon, attacker);
	const details: AttackResult["details"] = {
		attack: weapon.name,
		attacker: attacker.name,
		defender: defender.name,
		defenderAC: getArmorClass(defender),
		hitModifier: modifier,
		hitRoll: roll,
	};

	let weaponToUse = weapon;

	if (roll == 20) {
		weaponToUse = {
			...weaponToUse,
			hitDice: { amount: weaponToUse.hitDice.amount * 2, sides: weaponToUse.hitDice.sides },
		};
	}

	if (roll == 20 || roll + modifier >= getArmorClass(defender)) {
		const { roll = 0, modifier = 0 } = getDamageRoll(weaponToUse, attacker, actionCost);

		return {
			damage: roll + modifier,
			details: { ...details, damageModifier: modifier, damageRoll: roll },
			success: true as const,
		};
	} else {
		return { details, success: false as const };
	}
}

export function opponentAttackThrow(
	attacker: Opponent,
	defender: PlayerCharacter | Opponent,
	attack: OpponentAttack,
): AttackResult {
	const { roll = 0, modifier = 0 } = getOpponentAttackRoll(attack, attacker);

	const details: AttackResult["details"] = {
		attack: attack.name,
		attacker: attacker.name,
		defender: defender.name,
		defenderAC: getArmorClass(defender),
		hitModifier: modifier,
		hitRoll: roll,
	};

	if (roll + modifier >= details.defenderAC) {
		const { damage, damageRoll, damageModifier } = rollDamage(attack, attacker);

		return {
			damage,
			details: { ...details, damageModifier, damageRoll },
			success: true as const,
		};
	} else {
		return { details, success: false as const };
	}
}

export type Store<T> = { value: T; set: SetStoreFunction<T> };

export type Battle = {
	opponents: Array<Opponent>;
	party: Array<PlayerCharacter>;
};

function getXPMultiplier(battle: Battle) {
	switch (battle.opponents.length) {
		case 1:
			return 1;

		case 2:
			return 1.5;

		case 3:
		case 4:
		case 5:
		case 6:
			return 2;

		case 7:
		case 8:
		case 9:
		case 10:
			return 2.5;

		case 11:
		case 12:
		case 13:
		case 14:
			return 3;

		default:
			return 4;
	}
}

export function getTotalXPPerPartyMember(battle: Battle) {
	const totalXP = sum(battle.opponents.map(character => character.baseXP));
	const scaledXP = totalXP * getXPMultiplier(battle);
	return Math.round(scaledXP / battle.party.length);
}

export type InitiativeEntry = ReturnType<typeof rollAllInitiatives>[number];

export function rollAllInitiatives(battle: Battle) {
	const opponents = battle.opponents.map(character => ({
		id: character.id,
		initiative: getOpponentInitiative(character),
		name: character.name,
		type: "OPPONENT" as const,
	}));

	const party = battle.party.map(character => ({
		id: character.id,
		initiative: getCharacterInitiative(character),
		name: character.name,
		type: "PARTY" as const,
	}));

	return [...opponents, ...party].sort((a, b) => b.initiative - a.initiative);
}
