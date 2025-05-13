import { twMerge } from "tailwind-merge";
import { ActionCost } from "~/game/battle/battle";

export function ActionCostIcon(props: { actionCost?: ActionCost; available: boolean }) {
	return (
		<div class="h-5 w-5 grid grid-cols-1 grid-rows-1">
			<div
				class={twMerge(
					"mask w-full h-full bg-base-300 col-start-1 row-start-1",
					props.actionCost == "action" && "mask-circle",
					props.actionCost == "bonusAction" && "mask-triangle",
					props.actionCost == "reaction" && "mask-star",
				)}
			></div>
			<div
				class={twMerge(
					"mask w-full h-full bg-gradient-to-t col-start-1 row-start-1",
					props.actionCost == "action" && "mask-circle drop-shadow drop-shadow-green-600 from-green-600 to-green-500",
					props.actionCost == "bonusAction" && "mask-triangle drop-shadow drop-shadow-amber-600 from-amber-600 to-amber-500",
					props.actionCost == "reaction" && "mask-star drop-shadow drop-shadow-purple-600 from-purple-600 to-purple-500",
					!props.available && "opacity-50",
				)}
			></div>
		</div>
	);
}
