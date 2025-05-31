import { Show } from "solid-js";
import { AttackResultDetailsTooltipContent } from "./Logs";
import { AttackResult } from "~/game/battle/battle";
import { BasicItemKey, formatItemList, ItemList } from "~/game/items/items";
import { formatCc } from "~/utils/currency";

export function VictoryModal(props: {
	onClose: () => void;
	fatalAttackResult?: (AttackResult & { success: true }) | null;
	xpGained?: number;
	moneyGained?: number;
	itemsGained?: ItemList<BasicItemKey>;
}) {
	return (
		<Show when={props.fatalAttackResult}>
			{fatalAttackResult => (
				<div class="w-full h-full top-0 left-0 sm:rounded-2xl absolute bg-black/70 grid place-content-center z-20">
					<div class="card">
						<div class="card-body bg-base-200 rounded-xl gap-5">
							<h2 class="card-title mx-auto mb-2 text-2xl capitalize text-success">You were victorious.</h2>
							<span class="tooltip">
								<AttackResultDetailsTooltipContent attackResultDetails={fatalAttackResult().details} />
								{fatalAttackResult().details.attacker} defeated the {fatalAttackResult().details.defender} with their{" "}
								{fatalAttackResult().details.attack}
							</span>
							{props.xpGained && <span>Your prowess in battle granted your party {props.xpGained}XP</span>}
							{props.moneyGained && (
								<span>This fight made you win {formatCc(props.moneyGained, { exhaustive: true, style: "long" })}</span>
							)}
							{props.itemsGained?.length && <span>You gained {formatItemList(props.itemsGained)}</span>}
							<button class="btn btn-success" onClick={() => props.onClose()}>
								Exit the battle
							</button>
						</div>
					</div>
				</div>
			)}
		</Show>
	);
}
