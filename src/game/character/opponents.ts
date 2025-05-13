import { nanoid } from "nanoid";
import { createStore } from "solid-js/store";
import { Character, Store } from "../battle/battle";
import { opponentTemplates } from "../opponents/monsters";
import { BaseSkill } from "./character";
import { getModifierValue, ModifierRef } from "./modifiers";
import { createAdvantageToHitModifier, createModifier } from "./modifiers-type";
import { d20, Dice, dX, skillModifier } from "~/utils/dice";

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
};

export const challengeXP = {
	"0": 10,
	"1": 200,
	"1/2": 100,
	"1/4": 50,
	"1/8": 25,
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
	overrides?: Partial<OpponentTemplate>,
) {
	const template = { ...opponentTemplates[templateName], ...overrides };
	const [value, set] = createStore<Opponent>({
		...template,
		hp: { current: template.hp, max: template.hp },
		id: nanoid(),
		modifiers: [],
		name: names.filter(n => n == templateName).length > 1 ? `${template.name} ${index + 1}` : template.name,
	});
	return { set, value } satisfies Store<Opponent>;
}

export function createOpponents(
	templateNames: Array<OpponentTemplateName> | Partial<Record<OpponentTemplateName, number>>,
	rename?: Partial<Record<OpponentTemplateName, string>>,
) {
	if (Array.isArray(templateNames)) {
		return templateNames.map((templateName, index) =>
			createOpponent(
				templateName,
				index,
				templateNames,
				rename && templateName in rename ? { name: rename[templateName] } : undefined,
			),
		);
	} else {
		return Object.keys(templateNames)
			.flatMap(key => [...new Array(templateNames[key as OpponentTemplateName])].map(_ => key as OpponentTemplateName))
			.map((templateName, index, templateNames) =>
				createOpponent(
					templateName,
					index,
					templateNames,
					rename && templateName in rename ? { name: rename[templateName] } : undefined,
				),
			);
	}
}

export function formatOpponents(
	templateNames: Array<OpponentTemplateName> | Partial<Record<OpponentTemplateName, number>>,
	rename?: Partial<Record<OpponentTemplateName, string>>,
) {
	let record: Partial<Record<OpponentTemplateName, number>>;

	if (Array.isArray(templateNames)) {
		record = templateNames.reduce((obj, name) => {
			const occurence = obj[name] ?? 0;
			return { ...obj, [name]: occurence + 1 };
		}, {} as Record<OpponentTemplateName, number>);
	} else {
		record = templateNames;
	}
	console.debug("rename", rename);

	return new Intl.ListFormat().format(
		Object.entries(record).map(([templateName, occurence]) => {
			const template = opponentTemplates[templateName as OpponentTemplateName];
			return `${occurence} ${
				rename && templateName in rename ? rename[templateName as OpponentTemplateName] : template.name
			}${occurence > 1 ? "s" : ""}`;
		}),
	);
}

export function getInitiative(opponent: Opponent) {
	const baseInitiative = d20(1) + skillModifier(opponent.skills.dexterity);
	return getModifierValue(opponent.modifiers, "opponentInitiative", baseInitiative)(opponent);
}

export function rollDamage(attack: OpponentAttack, _opponent: Opponent) {
	let damageRoll = dX(attack.damageDice);
	const damage = damageRoll + attack.damageBonus;

	return { damage, damageModifier: attack.damageBonus, damageRoll };
}

export function getOpponentAttackRoll(attack: OpponentAttack, opponent: Opponent) {
	const roll = d20(1);
	const skillMod = skillModifier(opponent.skills[attack.toHitBonusSkill]) + opponent.proficency;

	const result = getModifierValue(opponent.modifiers, "opponentAttackRoll", {
		modifier: skillMod,
		roll,
	})({ modifier: skillMod, roll }, attack, opponent);

	return result;
}

export function getOpponentMaxHp(opponent: Opponent) {
	return getModifierValue(opponent.modifiers, "opponentHitPoints", opponent.hp.max)(opponent);
}

export const opponentModifiers = {
	autoCriticalHit: createModifier("autoCriticalHit", {
		display: false,
		fn: () => ({ roll: 20 }),
		source: "dm",
		target: "attackRoll",
		title: "Auto Critical Hit",
		type: "override",
	}),
	opponentAdvantageToHit: createAdvantageToHitModifier(
		"opponentAdvantageToHit",
		"opponentAttackRoll",
		"Advantage to hit",
		Math.max,
	),
	opponentDisadvantageToHit: createAdvantageToHitModifier(
		"opponentDisadvantageToHit",
		"opponentAttackRoll",
		"Disadvantage to hit",
		Math.min,
	),
	opponentMultiplyMaxHP: createModifier("opponentMultiplyMaxHP", {
		display: false,
		fn: (props, opponent) => Math.round(opponent.hp.max * props.factor),
		source: "dm",
		target: "opponentHitPoints",
		title: "Multiply opponent HP",
		type: "overrideBase",
	}),
	overrideOpponentInitiative: createModifier("overrideOpponentInitiative", {
		display: false,
		fn: props => props.overrideWith,
		source: "dm",
		target: "opponentInitiative",
		title: "Override Opponent Initiative",
		type: "override",
	}),
};
