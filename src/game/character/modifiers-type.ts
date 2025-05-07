import { SetStoreFunction } from "solid-js/store";
import { ArraySlice, JsonObject } from "type-fest";
import { Armor, BaseSkill, PlayerCharacter, Proficency, Skill, Weapon } from "./character";
import { Item } from "../items/items";
import { Opponent, OpponentAttack } from "./opponents";
import { ActionCost } from "../battle/battle";
import { d20 } from "~/utils/dice";

type WithPredicate<State extends JsonObject, T extends { fn: (...args: any[]) => any }> = T extends {
	fn: (props: infer Props, ...args: infer Args) => infer Return;
}
	? T & {
			fn: (props: Props & StateModifiers<State>, ...args: Args) => Return;
			predicate?: (props: Props & StateModifiers<State>, ...args: Args) => boolean;
	  }
	: never;

// In order
const modifierSource = ["base", "race", "background", "class", "item", "action", "dm"] as const;
type ModifierSource = (typeof modifierSource)[number];

// In order
const modifierType = ["overrideBase", "bonus", "override"] as const;
type ModifierType = (typeof modifierType)[number];

export type StateModifiers<State extends JsonObject = JsonObject> = {
	state: State & { markedAsDone?: boolean | null };
	setState: SetStoreFunction<State & { markedAsDone: boolean | null }>;
};

// Represents a Modifier "template" for a specific value
export type Modifier<Props extends JsonObject = never, State extends JsonObject = never> = WithPredicate<
	State,
	{
		title: string;
		description?: string;
		display: boolean;
		type: ModifierType;
		source: ModifierSource;
		baseState?: State;
	} & (
		| {
				target: "armorClass";
				fn: (props: Props & StateModifiers<State>, character: PlayerCharacter) => number;
		  }
		| {
				target: "attackRoll";
				fn: (
					props: Props & StateModifiers<State>,
					roll: { roll: number; modifier: number },
					item: Item,
					character: PlayerCharacter,
				) => { roll?: number; modifier?: number };
		  }
		| {
				target: "opponentAttackRoll";
				fn: (
					props: Props & StateModifiers<State>,
					roll: { roll: number; modifier: number },
					attack: OpponentAttack,
					opponent: Opponent,
				) => { roll?: number; modifier?: number };
		  }
		| {
				target: "damageRoll";
				fn: (
					props: Props & StateModifiers<State>,
					roll: { roll: number; modifier: number },
					weapon: Weapon,
					actionCost: ActionCost,
					character: PlayerCharacter,
				) => { roll?: number; modifier?: number };
		  }
		| {
				target: "initiative";
				fn: (props: Props & StateModifiers<State>, character: PlayerCharacter) => number;
		  }
		| {
				target: "opponentInitiative";
				fn: (props: Props & StateModifiers<State>, opponent: Opponent) => number;
		  }
		| {
				target: "action";
				fn: (
					props: Props & StateModifiers<State>,
					character: PlayerCharacter,
					setCharacter: SetStoreFunction<PlayerCharacter>,
				) => undefined;
		  }
		| {
				target: "proficiency";
				fn: (props: Props & StateModifiers<State>, character: PlayerCharacter) => number;
		  }
		| {
				target: "skillProficiency";
				fn: (props: Props & StateModifiers<State>, skill: Skill) => Proficency;
		  }
		| {
				target: "weaponProficiency";
				fn: (props: Props & StateModifiers<State>, weapon: Weapon) => Proficency;
		  }
		| {
				target: "armorProficiency";
				fn: (props: Props & StateModifiers<State>, armor: Armor) => Proficency;
		  }
		| {
				target: "savingThrowProficiency";
				fn: (props: Props & StateModifiers<State>, baseSkill: BaseSkill) => Proficency;
		  }
		| {
				target: "baseSkill";
				fn: (props: Props & StateModifiers<State>, skill: BaseSkill, character: PlayerCharacter) => number;
		  }
		| {
				target: "hitPoints";
				fn: (props: Props & StateModifiers<State>, character: PlayerCharacter) => number;
		  }
		| {
				target: "opponentHitPoints";
				fn: (props: Props & StateModifiers<State>, opponent: Opponent) => number;
		  }
	)
>;

export type AnyModifier = Modifier<any, any>;

export type ModifierDeclaration<
	T extends {
		target: AnyModifier["target"];
		type: AnyModifier["type"];
		props: JsonObject;
		state: JsonObject;
	},
> = Modifier<T["props"], T["state"]> & { target: T["target"]; type: T["type"] };

export type TempModifierDeclaration<
	T extends {
		target: AnyModifier["target"];
		type: AnyModifier["type"];
		props: JsonObject;
		state: JsonObject;
	},
> = ModifierDeclaration<{
	target: T["target"];
	type: T["type"];
	props: T["props"] & { maxUsage: number };
	state: T["state"] & { usage: number };
}>;

export type GetModifierProps<Mod extends AnyModifier> = Omit<Parameters<Mod["fn"]>[0], keyof StateModifiers>;
export type GetModifierState<Mod extends AnyModifier> = Omit<
	Pick<Parameters<Mod["fn"]>[0], keyof StateModifiers>["state"],
	"markedAsDone"
>;
export type GetModifierArgs<Mod extends AnyModifier> = Parameters<Mod["fn"]> extends [any, ...infer T] ? T : [];

export type TempModifier<Props extends JsonObject = never, State extends JsonObject = never> = Modifier<
	Props & { maxUsage: number },
	State & { usage: number }
>;

export function createModifier<ModKey extends keyof Modifiers>(
	_key: ModKey,
	// Why not Modifiers[ModKey] here ? Your guess is as good as mine...
	modifier: {
		title: Modifiers[ModKey]["title"];
		description?: Modifiers[ModKey]["description"];
		display: Modifiers[ModKey]["display"];
		type: Modifiers[ModKey]["type"];
		source: Modifiers[ModKey]["source"];
		baseState?: Modifiers[ModKey]["baseState"];
		target: Modifiers[ModKey]["target"];
		fn: Modifiers[ModKey]["fn"];
		predicate?: Modifiers[ModKey]["predicate"];
	},
) {
	return modifier;
}

/**
 * Create a modifier that keeps track of how much it's been used and set itself to done when necessary
 * @param modifier any modifier without usage tracking
 * @returns the same modifier with a usage tracking
 */
export function createTempModifier<ModKey extends keyof Modifiers>(
	_key: ModKey,
	// Why not Modifiers[ModKey] here ? Your guess is as good as mine...
	modifier: {
		title: Modifiers[ModKey]["title"];
		description?: Modifiers[ModKey]["description"];
		display: Modifiers[ModKey]["display"];
		type: Modifiers[ModKey]["type"];
		source: Modifiers[ModKey]["source"];
		baseState?: Modifiers[ModKey]["baseState"];
		target: Modifiers[ModKey]["target"];
		fn: Modifiers[ModKey]["fn"];
		predicate?: Modifiers[ModKey]["predicate"];
	},
) {
	return {
		...modifier,
		baseState: { ...modifier.baseState, usage: 0 },
		fn: (props: Parameters<Modifiers[ModKey]["fn"]>[0], ...rest: ArraySlice<Parameters<Modifiers[ModKey]["fn"]>, 1>) => {
			// @ts-expect-error
			props.setState("usage", x => x + 1);
			// @ts-expect-error
			props.setState("markedAsDone", props.state.usage >= props.maxUsage);
			// @ts-expect-error
			return modifier.fn(props, ...rest);
		},
		predicate: (
			props: Parameters<Modifiers[ModKey]["fn"]>[0],
			...rest: ArraySlice<Parameters<Modifiers[ModKey]["fn"]>, 1>
		) => {
			// @ts-expect-error
			return props.state.usage < props.maxUsage && (modifier.predicate ? modifier.predicate?.(props, ...rest) : true);
		},
	};
}

export function createAdvantageToHitModifier<ModKey extends keyof Modifiers>(
	key: ModKey,
	target: "attackRoll" | "opponentAttackRoll",
	title: string,
	func: (...values: number[]) => number,
) {
	if (target == "attackRoll") {
		return createTempModifier<ModKey>(key, {
			title,
			display: false,
			source: "action",
			type: "overrideBase",
			target: "attackRoll",
			// @ts-expect-error
			fn: (props, { roll, modifier }) => {
				const newRoll = d20(1);
				const withAdvantage = func(roll, newRoll);
				console.debug(title, `before: ${roll}, after: ${newRoll}, result: ${withAdvantage}`);
				return { roll: withAdvantage, modifier };
			},
		});
	} else {
		return createTempModifier(key, {
			title,
			display: false,
			source: "action",
			type: "overrideBase",
			target: "opponentAttackRoll",
			// @ts-expect-error
			fn: (props, { roll, modifier }) => {
				const newRoll = d20(1);
				const withAdvantage = func(roll, newRoll);
				console.debug(title, `before: ${roll}, after: ${newRoll}, result: ${withAdvantage}`);
				return { roll: withAdvantage, modifier };
			},
		});
	}
}

export type Modifiers = {
	// CHARACTER
	baseSkillInitialValue: ModifierDeclaration<{
		target: "baseSkill";
		type: "overrideBase";
		props: { skill: BaseSkill; value: number };
		state: {};
	}>;
	classWeaponProficiency: ModifierDeclaration<{
		props: { weaponRanks: Weapon["rank"][] };
		state: {};
		target: "weaponProficiency";
		type: "override";
	}>;
	equippedArmorsAC: ModifierDeclaration<{
		target: "armorClass";
		type: "overrideBase";
		props: {};
		state: {};
	}>;
	equippedShieldAC: ModifierDeclaration<{
		target: "armorClass";
		type: "bonus";
		props: {};
		state: {};
	}>;
	classHitPoints: ModifierDeclaration<{
		target: "hitPoints";
		type: "overrideBase";
		props: {};
		state: {};
	}>;
	advantageToHit: TempModifierDeclaration<{
		target: "attackRoll";
		type: "overrideBase";
		props: {};
		state: {};
	}>;
	disadvantageToHit: TempModifierDeclaration<{
		target: "attackRoll";
		type: "overrideBase";
		props: {};
		state: {};
	}>;
	abilityScoreImprovement: ModifierDeclaration<{
		target: "baseSkill";
		type: "bonus";
		props: { skills: Partial<Record<BaseSkill, 1 | 2>> };
		state: {};
	}>;

	// OPPONENT
	overrideOpponentInitiative: TempModifierDeclaration<{
		props: { overrideWith: number };
		state: {};
		target: "opponentInitiative";
		type: "override";
	}>;
	opponentAdvantageToHit: TempModifierDeclaration<{
		target: "opponentAttackRoll";
		type: "overrideBase";
		props: {};
		state: {};
	}>;
	opponentDisadvantageToHit: TempModifierDeclaration<{
		target: "opponentAttackRoll";
		type: "overrideBase";
		props: {};
		state: {};
	}>;
	opponentMultiplyMaxHP: ModifierDeclaration<{
		props: { factor: number };
		state: {};
		target: "opponentHitPoints";
		type: "overrideBase";
	}>;
	autoCriticalHit: TempModifierDeclaration<{
		props: {};
		state: {};
		target: "attackRoll";
		type: "override";
	}>;

	// FIGHTER
	fightingStyleArchery: ModifierDeclaration<{
		target: "attackRoll";
		type: "bonus";
		props: {};
		state: {};
	}>;
	fightingStyleDefense: ModifierDeclaration<{
		target: "armorClass";
		type: "bonus";
		props: {};
		state: {};
	}>;
	fightingStyleDueling: ModifierDeclaration<{
		target: "attackRoll";
		type: "bonus";
		props: {};
		state: {};
	}>;
	fightingStyleGreatWeaponFighting: ModifierDeclaration<{
		target: "damageRoll";
		type: "override";
		props: {};
		state: {};
	}>;
	fightingStyleTwoWeaponFighting: ModifierDeclaration<{
		target: "damageRoll";
		type: "bonus";
		props: {};
		state: {};
	}>;
	fighterProficiencies: ModifierDeclaration<{
		target: "skillProficiency";
		type: "override";
		props: { skills: [Skill, Skill] };
		state: {};
	}>;
};
