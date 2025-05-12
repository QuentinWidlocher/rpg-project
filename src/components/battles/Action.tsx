import { twJoin } from "tailwind-merge";
import { ActionCostIcon } from "./ActionCostIcon";
import { type AnyAction, ActionFromRef } from "~/game/character/actions";

export function TopLeftActionCostIcon(props: { actionCost?: AnyAction["cost"]; available: boolean }) {
	if (!props.actionCost) {
		return null;
	}

	return (
		<div class="-m-2 absolute top-0 right-0 ">
			<ActionCostIcon {...props} />
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
				{props.action.title} <TopLeftActionCostIcon actionCost={props.action.cost} available={props.available} />
			</span>
			<span>{props.action.label?.(props.action)}</span>
		</button>
	);
}
