import { twJoin, twMerge } from "tailwind-merge";
import { type AnyAction, ActionFromRef } from "~/game/character/actions";

function ActionCostIcon(props: { action?: AnyAction; available: boolean }) {
	if (!props.action?.cost) {
		return null;
	}

	return (
		<div class="-m-2 w-5 h-5 absolute top-0 right-0 grid grid-cols-1 grid-rows-1">
			<div
				class={twMerge(
					"mask w-full h-full bg-base-300 col-start-1 row-start-1",
					props.action.cost == "action" && "mask-circle",
					props.action.cost == "bonusAction" && "mask-triangle",
					props.action.cost == "reaction" && "mask-star",
				)}
			></div>
			<div
				class={twMerge(
					"mask w-full h-full bg-gradient-to-t col-start-1 row-start-1",
					props.action.cost == "action" && "mask-circle z-10 drop-shadow drop-shadow-green-600 from-green-600 to-green-500",
					props.action.cost == "bonusAction" &&
						"mask-triangle drop-shadow drop-shadow-amber-600 from-amber-600 to-amber-500",
					props.action.cost == "reaction" && "mask-star drop-shadow drop-shadow-purple-600 from-purple-600 to-purple-500",
					!props.available && "opacity-50",
				)}
			></div>
		</div>
	);
}

export function Action<Act extends AnyAction | ActionFromRef>(props: {
	action: Act;
	available: boolean;
	selected: boolean;
	onClick: (action: Act) => void;
}) {
	return (
		<button
			disabled={!props.available}
			aria-selected={props.selected}
			onClick={() => props.onClick(props.action)}
			class={twJoin(
				"btn btn-xl disabled:aria-selected:text-base-content/20 relative text-sm not-aria-selected:btn-soft flex-col gap-0",
				props.action.cost == "action" && "[--btn-color:var(--color-green-500)] [--btn-fg:var(--color-green-100)]",
				props.action.cost == "bonusAction" && "[--btn-color:var(--color-amber-500)] [--btn-fg:var(--color-amber-100)]",
				props.action.cost == "reaction" && "[--btn-color:var(--color-purple-500)] [--btn-fg:var(--color-purple-100)]",
			)}
		>
			<span>
				{props.action.title} <ActionCostIcon action={props.action} available={props.available} />
			</span>
			<span>{props.action.label?.(props.action)}</span>
		</button>
	);
}
