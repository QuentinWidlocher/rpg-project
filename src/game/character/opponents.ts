import { createStore } from "solid-js/store";
import { BaseSkill } from "./character";
import { d, d20, Dice, dX, parseDice, skillModifier } from "~/utils/dice";
import { Character, Store } from "../battle/battle";
import { opponentTemplates } from "../opponents/monsters";
import { nanoid } from "nanoid";
import { getModifierValue, ModifierRef } from "./modifiers";

export type OpponentAttack = {
	name: string;
	toHitBonusSkill: keyof Opponent["skills"];
	damageDice: Dice;
	damageBonus: number;
	type: "melee" | "ranged";
};

export type Opponent = Character & {
	armorClass: number;
	attacks: OpponentAttack[];
	baseXP: number;
	hp: { current: number; max: number };
	modifiers: ModifierRef[];
	proficency: number;
	skills: Record<BaseSkill, number>;
  initiativeOverride?: number;
};

export const challengeXP = {
	"0": 10,
	"1/8": 25,
	"1/4": 50,
	"1/2": 100,
	"1": 200,
	"2": 450,
	"3": 700,
	"4": 1100,
	"5": 1800,
	"6": 2300,
	"7": 2900,
	"8": 3900,
	"9": 5000,
	"10": 5900,
	"11": 7200,
	"12": 8400,
	"13": 10e3,
	"14": 11.5e3,
	"15": 13e3,
	"16": 15e3,
	"17": 18e3,
	"18": 20e3,
	"19": 22e3,
	"20": 25e3,
	"21": 33e3,
	"22": 41e3,
	"23": 50e3,
	"24": 62e3,
	"25": 75e3,
	"26": 90e3,
	"27": 105e3,
	"28": 120e3,
	"29": 135e3,
	"30": 155e3,
} as const;

export type OpponentTemplate = Omit<Opponent, "id" | "hp" | "skills"> & {
	hp: number;
	skills: { [k in keyof Opponent["skills"]]: number };
};

export type OpponentTemplateName = keyof typeof opponentTemplates;

export function createOpponent(
	templateName: OpponentTemplateName,
	index: number,
	names: OpponentTemplateName[],
) {
	const template = opponentTemplates[templateName];
	const [value, set] = createStore<Opponent>({
		...template,
		id: nanoid(),
		hp: { current: template.hp, max: template.hp },
		modifiers: [],
		name:
			names.filter(n => n == templateName).length > 1
				? `${template.name} ${index + 1}`
				: template.name,
	});
	return { value, set } satisfies Store<Opponent>;
}

export function createOpponents(
	templateNames:
		| Array<OpponentTemplateName>
		| Partial<Record<OpponentTemplateName, number>>,
) {
	if (Array.isArray(templateNames)) {
		return templateNames.map(createOpponent);
	} else {
		return Object.keys(templateNames)
			.flatMap(key =>
				[...new Array(templateNames[key as OpponentTemplateName])].map(
					_ => key as OpponentTemplateName,
				),
			)
			.map(createOpponent);
	}
}

export function getInitiative(opponent: Opponent) {
	return opponent.initiativeOverride ?? d20(1) + skillModifier(opponent.skills.dexterity);
}

export function rollDamage(attack: OpponentAttack, _opponent: Opponent) {
	let damageRoll = dX(attack.damageDice);
	const damage = damageRoll + attack.damageBonus;

	return { damageRoll, damageModifier: attack.damageBonus, damage };
}

export function getOpponentAttackRoll(attack: OpponentAttack, opponent: Opponent) {
	const roll = d20(1);
	const skillMod = skillModifier(opponent.skills[attack.toHitBonusSkill]) + opponent.proficency;

	const result = getModifierValue(opponent.modifiers, "opponentAttackRoll", {
		roll,
		modifier: skillMod,
	})({ roll, modifier: skillMod }, attack, opponent);

	return result;
}

export function getOpponentMaxHp(opponent: Opponent) {
  return getModifierValue(opponent.modifiers, "opponentHitPoints", opponent.hp.max)(opponent)
}
