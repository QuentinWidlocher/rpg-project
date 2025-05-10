import { SetStoreFunction } from "solid-js/store";
import { ArraySlice, EmptyObject, JsonObject } from "type-fest";
import { ActionCost } from "../battle/battle";
import { Item } from "../items/items";
import { Armor, BaseSkill, PlayerCharacter, Proficency, Skill, Weapon } from "./character";
import { Opponent, OpponentAttack } from "./opponents";
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
const _modifierSource = ["base", "race", "background", "class", "item", "action", "dm"] as const;
type ModifierSource = (typeof _modifierSource)[number];

// In order
const _modifierType = ["overrideBase", "bonus", "override"] as const;
type ModifierType = (typeof _modifierType)[number];

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

type ModifierDeclarationProps = {
	target: AnyModifier["target"];
	type: AnyModifier["type"];
	props: JsonObject;
	state: JsonObject;
};

export type ModifierDeclaration<T extends ModifierDeclarationProps> = Modifier<T["props"], T["state"]> & {
	target: T["target"];
	type: T["type"];
};

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
			// @ts-expect-error SetStoreFunction don't infer type correctly here but props.state.usage work though
			props.setState("usage", x => x + 1);
			// @ts-expect-error SetStoreFunction don't infer type correctly here but props.state.usage work though
			props.setState("markedAsDone", props.state.usage >= props.maxUsage);
			// @ts-expect-error I've done my best by typing the rest parameter -5 line
			return modifier.fn(props, ...rest);
		},
		predicate: (
			props: Parameters<Modifiers[ModKey]["fn"]>[0],
			...rest: ArraySlice<Parameters<Modifiers[ModKey]["fn"]>, 1>
		) => {
			// @ts-expect-error euugh
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
			display: false,
			// @ts-expect-error @FIXME
			fn: (_props, { roll, modifier }) => {
				const newRoll = d20(1);
				const withAdvantage = func(roll, newRoll);
				console.debug(title, `before: ${roll}, after: ${newRoll}, result: ${withAdvantage}`);
				return { modifier, roll: withAdvantage };
			},
			source: "action",
			target: "attackRoll",
			title,
			type: "overrideBase",
		});
	} else {
		return createTempModifier(key, {
			display: false,
			// @ts-expect-error @FIXME
			fn: (_props, { roll, modifier }) => {
				const newRoll = d20(1);
				const withAdvantage = func(roll, newRoll);
				console.debug(title, `before: ${roll}, after: ${newRoll}, result: ${withAdvantage}`);
				return { modifier, roll: withAdvantage };
			},

			source: "action",

			target: "opponentAttackRoll",

			title,

			type: "overrideBase",
		});
	}
}

export type ModifierDeclarations = {
	// CHARACTER
	baseSkillInitialValue: {
		target: "baseSkill";
		type: "overrideBase";
		props: { skill: BaseSkill; value: number };
		state: EmptyObject;
	};
	classWeaponProficiency: {
		props: { weaponRanks: Weapon["rank"][] };
		state: EmptyObject;
		target: "weaponProficiency";
		type: "override";
	};
	equippedArmorsAC: {
		target: "armorClass";
		type: "overrideBase";
		props: EmptyObject;
		state: EmptyObject;
	};
	equippedShieldAC: {
		target: "armorClass";
		type: "bonus";
		props: EmptyObject;
		state: EmptyObject;
	};
	classHitPoints: {
		target: "hitPoints";
		type: "overrideBase";
		props: EmptyObject;
		state: EmptyObject;
	};
	advantageToHit: {
		target: "attackRoll";
		type: "overrideBase";
		props: EmptyObject;
		state: EmptyObject;
	};
	disadvantageToHit: {
		target: "attackRoll";
		type: "overrideBase";
		props: EmptyObject;
		state: EmptyObject;
	};
	abilityScoreImprovement: {
		target: "baseSkill";
		type: "bonus";
		props: { skills: Partial<Record<BaseSkill, 0 | 1 | 2>> };
		state: EmptyObject;
	};

	// OPPONENT
	overrideOpponentInitiative: {
		props: { overrideWith: number };
		state: EmptyObject;
		target: "opponentInitiative";
		type: "override";
	};
	opponentAdvantageToHit: {
		target: "opponentAttackRoll";
		type: "overrideBase";
		props: EmptyObject;
		state: EmptyObject;
	};
	opponentDisadvantageToHit: {
		target: "opponentAttackRoll";
		type: "overrideBase";
		props: EmptyObject;
		state: EmptyObject;
	};
	opponentMultiplyMaxHP: {
		props: { factor: number };
		state: EmptyObject;
		target: "opponentHitPoints";
		type: "overrideBase";
	};
	autoCriticalHit: {
		props: EmptyObject;
		state: EmptyObject;
		target: "attackRoll";
		type: "override";
	};

	// FIGHTER
	fightingStyleArchery: {
		target: "attackRoll";
		type: "bonus";
		props: EmptyObject;
		state: EmptyObject;
	};
	fightingStyleDefense: {
		target: "armorClass";
		type: "bonus";
		props: EmptyObject;
		state: EmptyObject;
	};
	fightingStyleDueling: {
		target: "attackRoll";
		type: "bonus";
		props: EmptyObject;
		state: EmptyObject;
	};
	fightingStyleGreatWeaponFighting: {
		target: "damageRoll";
		type: "override";
		props: EmptyObject;
		state: EmptyObject;
	};
	fightingStyleTwoWeaponFighting: {
		target: "damageRoll";
		type: "bonus";
		props: EmptyObject;
		state: EmptyObject;
	};
	fighterProficiencies: {
		target: "skillProficiency";
		type: "override";
		props: { skills: [Skill, Skill] };
		state: EmptyObject;
	};
};

export type Modifiers = {
	[k in keyof ModifierDeclarations]: ModifierDeclaration<ModifierDeclarations[k]>;
};
