import { AnyModifier, GetModifierProps } from "~/game/character/modifiers-type";

export function ModifierDisplay<T extends AnyModifier>(props: { modifier: T; props: GetModifierProps<T> }) {
	return (
		<div class="card bg-base-300">
			<div class="card-body">
				<div class="flex justify-between mb-2">
					<h2 class="text-2xl font-bold">{props.modifier.title}</h2>
				</div>
				{props.modifier.description ? (
					<p>
						{typeof props.modifier.description == "function"
							? props.modifier.description(props.props)
							: props.modifier.description}
					</p>
				) : null}
			</div>
		</div>
	);
}
