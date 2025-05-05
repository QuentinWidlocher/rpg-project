import { JsonObject } from "type-fest";
import { Ability, ActionRefKey, actions, GetAbilityFn, GetAbilityPredicate, GetAbilityProps } from "./actions";

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

export function createAbilityByLevel<Key extends ActionRefKey>(
	abilityRefKey: Key,
	defaultProps: NoInfer<GetAbilityProps<(typeof actions)[Key]>>,
	whatChanged?: string,
) {
	return { abilityRefKey, defaultProps, whatChanged };
}
