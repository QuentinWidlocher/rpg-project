import type { JSX } from "solid-js";
import type { JsonObject } from "type-fest";
import {
	type Ability,
	type ActionRefKey,
	actions,
	type AnyAction,
	type GetAbilityFn,
	type GetAbilityPredicate,
	type GetAbilityProps,
} from "./actions";

/**
 * Create a modifier that keeps track of how much it's been used and set itself to done when necessary
 * @param modifier any modifier without usage tracking
 * @returns the same modifier with a usage tracking
 */
export function createAbility<Props extends JsonObject = never, State extends JsonObject = never>(
	ability: Omit<Ability<Props, State>, "type">,
) {
	return {
		...ability,
		type: "ability" as const,
		baseState: { usage: 0, ...ability.baseState },
		fn: ((props, source, target) => {
			props.setState("usage" as unknown as any, (x: any) => x + 1);
			return ability.fn(props, source, target);
		}) satisfies GetAbilityFn<Props, State>,

		predicate: ((props, source, target) => {
			// console.debug("props.state.usage", props.state.usage);
			// console.debug("props.maxUsage", props.maxUsage);
			// console.debug("ability.predicate", ability.predicate);
			return (
				props.state.usage < props.maxUsage && (ability.predicate ? ability.predicate?.(props as any, source, target) : true)
			);
		}) satisfies GetAbilityPredicate<Props, State>,
	};
}

export type AbilityByLevel<Key extends ActionRefKey> = {
	abilityRefKey: Key;
	title: string;
	description: string;
	whatChanged?: string;
} & (
	| {
			props: GetAbilityProps<(typeof actions)[Key]>;
	  }
	| {
			form: () => { element: JSX.Element; getValues: () => GetAbilityProps<(typeof actions)[Key]> };
	  }
);

export function createAbilityByLevel<Key extends ActionRefKey>(
	abilityRefKey: Key,
	getProps:
		| {
				props: GetAbilityProps<(typeof actions)[Key]>;
		  }
		| {
				form: () => { element: JSX.Element; getValues: () => GetAbilityProps<(typeof actions)[Key]> };
		  },
	whatChanged?: AbilityByLevel<Key>["whatChanged"],
): AbilityByLevel<any> {
	return {
		abilityRefKey,
		title: actions[abilityRefKey].title,
		description: (actions[abilityRefKey] as AnyAction).description,
		whatChanged,
		...getProps,
	} as AbilityByLevel<any>;
}
