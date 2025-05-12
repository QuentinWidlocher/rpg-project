import { AnyAbility, GetAbilityProps } from "~/game/character/actions";

export function AbilityDisplay<T extends AnyAbility>(props: { ability: T; props: GetAbilityProps<T> }) {
	return (
		<div class="card bg-base-300">
			<div class="card-body">
				<div class="flex justify-between mb-2">
					<h2 class="text-2xl font-bold">{props.ability.title}</h2>
				</div>
				{props.ability.description ? <p>{props.ability.description}</p> : null}
			</div>
		</div>
	);
}
