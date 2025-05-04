import { Show } from "solid-js";
import { AttackResult } from "~/game/battle/battle";
import { AttackResultDetailsTooltipContent } from "./Logs";

export function DefeatModal(props: {
	onClose: () => void;
	fatalAttackResult?: (AttackResult & { success: true }) | null;
}) {
	return (
		<Show when={props.fatalAttackResult}>
			{fatalAttackResult => (
				<div class="w-full h-full -mt-10 sm:rounded-2xl absolute bg-black/70 grid place-content-center z-10">
					<div class="card">
						<div class="card-body bg-base-200 rounded-xl gap-10">
							<h2 class="card-title mx-auto text-2xl capitalize text-primary">You were defeated.</h2>
							<span class="tooltip">
								<AttackResultDetailsTooltipContent attackResultDetails={fatalAttackResult().details} />
								The {fatalAttackResult().details.attacker} killed {fatalAttackResult().details.defender} with{" "}
								{fatalAttackResult().details.attack}
							</span>
							<button class="btn btn-primary" onClick={() => props.onClose()}>
								Exit the battle
							</button>
						</div>
					</div>
				</div>
			)}
		</Show>
	);
}
